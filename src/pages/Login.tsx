import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signin, signup } from "../services/auth.service";
// import { signup } from "../services/auth.service"; // Uncomment when you have your signup mutation
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  Stethoscope,
  User, // Added for First/Last name
} from "lucide-react";

// ==========================================
// 1. Zod Validation Schemas
// ==========================================
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Veuillez entrer un email valide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
  withResources: z.boolean(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Veuillez entrer un email valide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  taxRegistration: z.string().min(1, { message: "Le numéro d'inscription fiscale est requis" }),
});

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ==========================================
  // 2. Login Form Hook
  // ==========================================
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      withResources: false,
    },
  });

  // ==========================================
  // 3. Register Form Hook
  // ==========================================
  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      taxRegistration: "",
    },
  });

  const [LoginCall, { loading: isLoading, error }] = useAuth({
    mutation: signin,
    options: {
      onCompleted: () => {
        navigate("/", { replace: true });
      },
    },
  });

  const [RegisterCall, { loading: isRegisterLoading }] = useAuth({
    mutation: signup,
    options: {
      onCompleted: () => {
        setActiveTab("login"); // Switch to login after successful registration
      },
    },
  });

  const onLoginSubmit = (variables: {
    email: string;
    password: string;
    withResources: boolean;
  }): void => {
    LoginCall({
      variables: { ...variables, withResources: rememberMe },
    });
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    // TODO: Call your signup mutation here
    RegisterCall({ variables: data });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Unchanged) */}
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
      {/* Added overflow-y-auto to prevent cutting off the longer register form on small screens */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">My Office</span>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "login"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "register"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              Inscription
            </button>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800">
              {activeTab === "login" ? "Connexion" : "Créer un compte"}
            </h2>
            <p className="text-slate-500 mt-2">
              {activeTab === "login"
                ? "Entrez vos identifiants pour accéder à votre compte"
                : "Remplissez les informations ci-dessous pour créer votre compte"}
            </p>
          </div>

          {/* Error Alert */}
          {error && activeTab === "login" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Échec de l'authentification</p>
                <p className="text-sm mt-1">
                  {error.message || "Veuillez vérifier votre email et mot de passe"}
                </p>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* LOGIN FORM                                 */}
          {/* ========================================== */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...registerLogin("email")}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${loginErrors.email || error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                      }`}
                    placeholder="vous@exemple.com"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgetPassword")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...registerLogin("password")}
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${loginErrors.password || error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
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
                {loginErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-3 text-sm text-slate-600 cursor-pointer select-none">
                  Se souvenir de moi pendant 30 jours
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoginSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoginSubmitting || isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Connexion en cours...</>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          )}

          {/* ========================================== */}
          {/* REGISTER FORM                              */}
          {/* ========================================== */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-6">
              {/* First & Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="firstName"
                      type="text"
                      {...registerSignup("firstName")}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${registerErrors.firstName ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                        }`}
                      placeholder="John"
                    />
                  </div>
                  {registerErrors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {registerErrors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="lastName"
                      type="text"
                      {...registerSignup("lastName")}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${registerErrors.lastName ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                        }`}
                      placeholder="Doe"
                    />
                  </div>
                  {registerErrors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {registerErrors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    {...registerSignup("email")}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${registerErrors.email ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                      }`}
                    placeholder="vous@exemple.com"
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="reg-password"
                    type={showRegisterPassword ? "text" : "password"}
                    {...registerSignup("password")}
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${registerErrors.password ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.password.message}
                  </p>
                )}
              </div>

              {/* Tax Registration */}
              <div className="space-y-2">
                <label htmlFor="taxRegistration" className="block text-sm font-medium text-slate-700">
                  Numéro d'inscription fiscale (Patente)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="taxRegistration"
                    type="text"
                    {...registerSignup("taxRegistration")}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${registerErrors.taxRegistration ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300"
                      }`}
                    placeholder="Ex: 1234567/A/M/000"
                  />
                </div>
                {registerErrors.taxRegistration && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.taxRegistration.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegisterSubmitting || isRegisterLoading} // Add isRegisterLoading here when you uncomment the mutation
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isRegisterSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Inscription en cours...</>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>
          )}


          {/*    <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Ou continuer avec</span>
            </div>
          </div>

       
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700">Facebook</span>
            </button>
          </div> */}

          {/* Footer Toggle Link */}
          <p className="text-center text-sm text-slate-500">
            {activeTab === "login" ? (
              <>
                Vous n'avez pas de compte ?{" "}
                <button type="button" onClick={() => setActiveTab("register")} className="text-blue-600 hover:text-blue-700 font-medium">
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <button type="button" onClick={() => setActiveTab("login")} className="text-blue-600 hover:text-blue-700 font-medium">
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
