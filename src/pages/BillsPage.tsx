import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { FETCH_PATIENTS } from "../services/patient.service";
import { FETCH_APPOINTMENTS } from "@/services/appointment.service";
import Select from "@/components/UI/Select";
import Button from "@/components/UI/Button";
import BillTable from "@/components/bill/BillTable";
import { useMemo, useState } from "react";
import { User, Calendar, FileText, Loader2 } from "lucide-react";

const formSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  patient: z.string().min(1, "Veuillez sélectionner un patient"),
});

export default function BillsPage() {
  const { data, error, loading: patientsLoading } = useQuery(FETCH_PATIENTS, {
    fetchPolicy: "network-only",
  });
  
  const [call, { data: lists, loading: appointmentsLoading }] = useLazyQuery(FETCH_APPOINTMENTS);
  
  // State to store the fetched patient and appointments for rendering
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState<any[]>([]);

  const { handleSubmit, register, getValues, control, watch } = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: new Date(),
      endTime: new Date(),
      patient: "",
    },
  });

  // Watch patient value for real-time updates
  const watchedPatient = watch("patient");

  const patientsList = useMemo(() => {
    if (!data) return null;
    return data;
  }, [data]);

  // Update appointment data when the query completes
  useMemo(() => {
    if (lists?.appointments) {
      setAppointmentData(lists.appointments);
    }
  }, [lists]);

  // Find the selected patient based on the watched value
  const getPatient = useMemo(() => {
    if (!patientsList?.patients || !watchedPatient) return null;
    return patientsList.patients.find((p: any) => p.id === watchedPatient);
  }, [patientsList, watchedPatient]);

  const onSubmit = async (variables: any): Promise<void> => {
    // Get the patient from the submitted form values (not from render-time getValues)
    const patientId = variables.patient;
    const patient = patientsList?.patients.find((p: any) => p.id === patientId);
    
    if (patient) {
      setSelectedPatient(patient);
      
      // Call the appointment query with proper variables
      await call({
        variables: {
          name: patient.name,
          status: "DONE",
          startTime: variables.startTime.toISOString(),
          endTime: new Date(variables.endTime).toISOString(),
        },
      });
      // The useMemo for lists will handle updating appointmentData
    }
  };

  const isLoading = patientsLoading || appointmentsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mb-8 print:hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des Factures</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Patient Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> Patient <span className="text-red-500">*</span>
                </label>
                <Select
                  control={control}
                  {...register("patient")}
                  label=""
                  placeholder="choisir un patient"
                  options={
                    patientsList?.patients.map((e: any) => ({
                      label: e.name,
                      value: e.id,
                    })) || []
                  }
                  error={error?.message}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date début
                </label>
                <input
                  type="date"
                  {...register("startTime", { valueAsDate: true })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date fin
                </label>
                <input
                  type="date"
                  {...register("endTime", { valueAsDate: true })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 h-11 flex items-center justify-center gap-2"
                  label={isLoading ? "Chargement..." : "Générer"}
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Chargement..." : "Générer"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Invoice Preview Area */}
        <div>
          {appointmentsLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-slate-500">Chargement des rendez-vous...</p>
              </div>
            </div>
          )}
          
          {!appointmentsLoading && appointmentData.length > 0 && selectedPatient ? (
            <BillTable
              data={
                appointmentData.map((el: any) => ({
                  date: Number(el.startTime),
                  prix: el.price,
                }))
              }
              patient={selectedPatient}
            />
          ) : (
            !appointmentsLoading && (
              <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Aucune facture à afficher
                </h3>
                <p className="text-slate-500">
                  Sélectionnez un patient et une période, puis cliquez sur "Générer" pour créer une facture.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}