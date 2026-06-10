import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormValues } from "../utils/validation";
import {
  FETCH_PATIENTS,
  CREATE_PATIENT,
  UPDATE_PATIENT,
  DELETE_PATIENT,
} from "../services/patient.service";
import Modal from "../components/Modal/Modal";
import { Patient } from "../types";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PatientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error, refetch } = useQuery(FETCH_PATIENTS, {
    fetchPolicy: "network-only",
  });
  const [call, { loading: createLoading }] = useMutation(CREATE_PATIENT);
  const [callUpdate, { loading: updateLoading }] = useMutation(UPDATE_PATIENT);
  const [callDelete, { loading: deleteLoading }] = useMutation(DELETE_PATIENT, {
    onCompleted: () => {
      refetch();
    },
  });

  const {
    register,
    handleSubmit,
    setValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    defaultValues: {
      name: "",
      age: "",
      birthDate: "",
      startDate: null,
      endDate: null,
      email: "",
      phone: "",
      note: "",
      addressedBy: "",
      insurance: "",
    },
    resolver: zodResolver(patientSchema),
  });

  const patients: Patient[] = useMemo(() => {
    if (!data) return [];
    return (data as { patients: Patient[] }).patients;
  }, [data]);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.phone.includes(term),
    );
  }, [patients, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const onSubmit = (variables: any): void => {
    const query: {
      name: string;
      birthDate: string;
      email: string;
      phone: string;
      note: string;
      insurance: string;
      addressedBy: string;
      startDate?: string;
      endDate?: string;
    } = {
      name: variables.name,
      birthDate: new Date(variables.birthDate).toISOString(),
      email: variables.email,
      phone: variables.phone,
      note: variables.note,
      insurance: variables.insurance,
      addressedBy: variables.addressedBy,
    };
    if (variables.startDate) {
      query.startDate = new Date(variables.startDate).toISOString();
    }
    if (variables.endDate) {
      query.endDate = new Date(variables.endDate).toISOString();
    }

    if (selectedRow) {
      callUpdate({
        variables: {
          input: {
            id: selectedRow,
            ...query,
          },
        },
        onCompleted: () => {
          refetch();
          reset();
          setSelectedRow(null);
          setIsModalOpen(false);
        },
      });
    } else {
      call({
        variables: {
          input: {
            ...query,
          },
        },
        onCompleted: () => {
          refetch();
          reset();
          setIsModalOpen(false);
        },
      });
    }
  };

  const setData = (p: Patient) => {
    setValues({
      birthDate: new Date(Number(p.birthDate)).toISOString().split("T")[0],
      name: p.name,
      email: p.email,
      phone: p.phone,
      startDate: p.startDate
        ? new Date(Number(p.startDate)).toISOString().split("T")[0]
        : "",
      endDate: p.endDate
        ? new Date(Number(p.endDate)).toISOString().split("T")[0]
        : "",
      insurance: p.insurance,
      note: p.note,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp: number | string) => {
    if (!timestamp) return "-";
    return new Date(Number(timestamp)).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isLoading = loading || createLoading || updateLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                Patients
              </h1>
              <p className="text-slate-500 text-sm">
                Gérez vos patients et leurs informations médicales
              </p>
            </div>
            <button
              onClick={() => {
                reset();
                setSelectedRow(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Nouveau Patient
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un patient par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Patients</p>
                <p className="text-2xl font-bold text-slate-800">
                  {patients.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ce Mois</p>
                <p className="text-2xl font-bold text-slate-800">
                  {
                    patients.filter((p) => {
                      const date = new Date(Number(p.createdAt));
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avec Assurance</p>
                <p className="text-2xl font-bold text-slate-800">
                  {patients.filter((p) => p.insurance).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>
                Une erreur est survenue lors du chargement des patients
              </span>
            </div>
          )}

          {isLoading ? (
            // Loading Skeleton
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 animate-pulse flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedPatients.length === 0 ? (
            // Empty State
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun patient"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par ajouter votre premier patient"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un patient
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Date de Naissance
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Assurance
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPatients.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {getInitials(p.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {p.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                ID: {p.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {p.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4 text-slate-400" />
                              {p.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(p.birthDate)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {p.insurance ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <Shield className="w-3 h-3 mr-1" />
                              {p.insurance}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setData(p);
                                setSelectedRow(p.id);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Êtes-vous sûr de vouloir supprimer ce patient ?",
                                  )
                                ) {
                                  callDelete({ variables: { id: p.id } });
                                }
                              }}
                              disabled={deleteLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Affichage de{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    à{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredPatients.length,
                      )}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">
                      {filteredPatients.length}
                    </span>{" "}
                    patients
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRow(null);
          reset();
        }}
        title=""
        className="max-w-3xl"
      >
        <div className="relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {selectedRow ? "Modifier le Patient" : "Nouveau Patient"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {selectedRow
                  ? "Modifiez les informations du patient"
                  : "Ajoutez un nouveau patient au système"}
              </p>
            </div>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRow(null);
                reset();
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Informations Personnelles
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: Jean Dupont"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="patient@email.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: +33 6 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Date de Naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("birthDate")}
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {errors.birthDate && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.birthDate.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Prise en Charge */}
            <section className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Prise en Charge
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Date de Début
                  </label>
                  <input
                    {...register("startDate")}
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.startDate.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Date de Fin
                  </label>
                  <input
                    {...register("endDate")}
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.endDate.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Assurance
                  </label>
                  <input
                    {...register("insurance")}
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: CNAM, CMU..."
                  />
                  {errors.insurance && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.insurance.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Notes
                </h3>
              </div>
              <div className="space-y-1.5">
                <textarea
                  {...register("note")}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Informations complémentaires..."
                />
                {errors.note && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.note.message?.toString()}
                  </p>
                )}
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRow(null);
                  reset();
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createLoading || updateLoading}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting || createLoading || updateLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : selectedRow ? (
                  "Mettre à jour"
                ) : (
                  "Créer le Patient"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
