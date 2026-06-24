import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  Stethoscope,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/store/authStore";
import { resetPassword, validToken } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { token, id } = useParams<{ token: string; id: string }>(); // Get token from URL
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userd = useAuthStore((state) => state.user);

  const formSchema = z
    .object({
      password: z.string().min(6, { message: "Au moins 6 caractères" }),
      confirm: z.string().min(1, { message: "Veuillez confirmer le mot de passe" }),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    });
  const [resetCall, { loading }] = useMutation(resetPassword);

  const [callValidationToken, { data, error: errorValidation }] = useLazyQuery(validToken)
  useEffect(() => {
    if (id && token) {
      callValidationToken({
        variables: {
          tokenType: "FORGET",
          userId: id,
          token: token,
        },
      });
    }
  }, [callValidationToken, id, token]);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = (variables: { confirm: string; password: string }): void => {
    if (!data) setError("Token invalide");
    resetCall({
      variables: {
        ...variables,
        token: (data as { validToken: { token: { accessToken: string } } })?.validToken?.token?.accessToken,
      },
      onCompleted: () => {
        toast.success("Mot de passe mis à jour avec succès");
        navigate("/login");
      },
    });
  };
  if (userd) {
    return <Navigate to={params.get("from") || "/"} replace />;
  }
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Identical to Login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:20px_20px] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">My Office</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Bienvenue dans votre
            <span className="block text-blue-200">Espace de Gestion</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Gérez vos rendez-vous, patients et facturation en un seul endroit.
            Sécurisé, efficace et conçu pour les professionnels de santé.
          </p>
          <div className="space-y-4">
            {[
              { icon: Building2, text: "Gérez votre cabinet efficacement" },
              { icon: Mail, text: "Planification intelligente des rendez-vous" },
              { icon: Lock, text: "Protection sécurisée des données patients" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-8 left-12 text-white/60 text-sm">
            <p>© 2026 My Office. Tous droits réservés.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">My Office</span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </button>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Nouveau mot de passe</h2>
            <p className="text-slate-500 mt-2">
              Votre nouveau mot de passe doit être différent des mots de passe précédemment utilisés.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.password ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirm")}
                  className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.confirm ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirm.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Réinitialisation...</>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}