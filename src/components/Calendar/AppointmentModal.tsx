// AppointmentModal.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CANCEL_APPOINTMENT,
  CREATE_APPOINTMENT,
  DELETE_APPOINTMENT,
  UPDATE_APPOINTMENT,
} from "../../services/appointment.service";
import Modal from "../Modal/Modal";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { format } from "date-fns";
import { FETCH_PATIENTS } from "@/services/patient.service";
import { Patient } from "@/types";
import {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core/index.js";
import {
  X,
  User,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  XCircle,
  Plus,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  info: EventClickArg | null;
  selectedDate: DateSelectArg | null;
  selectedDropEvent: EventDropArg | null;
  refetch: () => void;
  setOpen: (value: boolean) => void;
  setSelectedDate: (value: null) => void;
  setSelectedEvent: (value: null) => void;
  setSelectedDropEvent: (value: null) => void;
}

const createIsoDateTime = (baseDate: Date, timeStr: string): string => {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
  return date.toISOString();
};

const formSchema = z.object({
  startTime: z.string().min(2).max(50),
  endTime: z.string().min(2).max(50),
  note: z.string(),
  patient: z.string().min(2).max(50),
  price: z.number().min(0),
});

export default function AppointmentModal({
  isOpen,
  info,
  selectedDate,
  selectedDropEvent,
  setOpen,
  setSelectedDate,
  setSelectedEvent,
  setSelectedDropEvent,
  refetch,
}: Props) {
  const [isCanceled, setIsCanceled] = useState(false);

  const { data, loading: loadingPatients } = useQuery(FETCH_PATIENTS, {
    fetchPolicy: "network-only",
  });
  const [call, { loading }] = useMutation(CREATE_APPOINTMENT);
  const [callUpdate, { loading: loadingUpdate }] = useMutation(UPDATE_APPOINTMENT);
  const [callDelete, { loading: loadingDelete }] = useMutation(DELETE_APPOINTMENT, {
    variables: { id: info?.event.id },
    onCompleted: () => {
      reset();
      setSelectedEvent(null);
      setSelectedDate(null);
      setOpen(false);
      refetch();
    },
  });
  const [callCancel, { loading: loadingCancel }] = useMutation(CANCEL_APPOINTMENT, {
    variables: { id: info?.event.id },
    onCompleted: () => {
      reset();
      setSelectedEvent(null);
      setSelectedDate(null);
      setOpen(false);
      refetch();
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      note: "",
      patient: "",
      price: 0,
    },
  });

  const onSubmit = async (variables: any) => {
    const getId = (data as { patients: Patient[] })?.patients.find(
      (v: any) => v.id === variables.patient
    );
    if (getId) {
      const GlobalInputs = {
        email: variables.email,
        note: variables.note,
        patientId: getId.id,
      };
      if (selectedDate) {
        const inputs = {
          startTime: createIsoDateTime(selectedDate.start, variables.startTime),
          endTime: createIsoDateTime(selectedDate.end, variables.endTime),
        };
        call({
          variables: { input: { ...inputs, ...GlobalInputs } },
          onCompleted: () => {
            reset();
            setSelectedEvent(null);
            setSelectedDate(null);
            setOpen(false);
            refetch();
          },
        });
      }

      if (info) {
        const baseStart = info.event.start || new Date(info.event.startStr);
        const baseEnd =
          info.event.end || (info.event.endStr ? new Date(info.event.endStr) : baseStart);
        const inputs = {
          startTime: createIsoDateTime(baseStart, variables.startTime),
          endTime: createIsoDateTime(baseEnd, variables.endTime),
        };
        callUpdate({
          variables: {
            input: {
              id: info.event.id,
              price: parseFloat(variables.price),
              ...inputs,
              ...GlobalInputs,
            },
          },
          onCompleted: () => {
            reset();
            setSelectedEvent(null);
            setSelectedDate(null);
            setOpen(false);
            refetch();
          },
        });
      }
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEvent(null);
    setSelectedDate(null);
    setOpen(false);
    setIsCanceled(false);
    refetch();
  };

  useEffect(() => {
    if (selectedDate) {
      setValue("startTime", format(selectedDate.start, "HH:mm"));
      setValue("endTime", format(selectedDate.end, "HH:mm"));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (info) {
      const start = info.event.start;
      const end = info.event.end;
      const startTimeStr = start
        ? format(start, "HH:mm")
        : info.event.startStr.split("T")[1]?.split(/[-+Z]/)[0]?.slice(0, 5) || "";
      const endTimeStr = end
        ? format(end, "HH:mm")
        : info.event.endStr.split("T")[1]?.split(/[-+Z]/)[0]?.slice(0, 5) || "";

      setValue("startTime", startTimeStr);
      setValue("endTime", endTimeStr);
      setValue("note", info.event.extendedProps.note || "");
      setValue("patient", info.event.extendedProps.patient?.id || "");
      setValue("price", info.event.extendedProps.price ?? 0);
      setIsCanceled(info.event.extendedProps.status === "CANCELED");
    }
  }, [info?.event]);

  useEffect(() => {
    if (selectedDropEvent) {
      callUpdate({
        variables: {
          input: {
            id: selectedDropEvent.event.id,
            startTime: selectedDropEvent.event.startStr,
            endTime: selectedDropEvent.event.endStr,
            patientId: selectedDropEvent.event.extendedProps.patient.id,
            status: selectedDropEvent.event.extendedProps.status,
            price: selectedDropEvent.event.extendedProps.price,
          },
        },
        onCompleted: () => {
          refetch();
          setSelectedDropEvent(null);
        },
      });
    }
  }, [selectedDropEvent]);

  const isEditing = !!info;
  const isLoading = loading || loadingUpdate;

  return (
    <Modal isOpen={isOpen} title="">
      <div className="relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing ? "Modifiez les informations du rendez-vous" : "Planifiez un nouveau rendez-vous"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Status Badge if editing */}
        {isEditing && isCanceled && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Rendez-vous annulé</p>
              <p className="text-sm text-red-600">Ce rendez-vous a été annulé</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Patient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register("patient")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">Choisir un patient</option>
                {(data as { patients: Patient[] })?.patients.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            {errors.patient && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.patient.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Date et Heure
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={
                    info
                      ? info.event.start
                        ? format(info.event.start, "yyyy-MM-dd")
                        : info.event.startStr.split("T")[0]
                      : selectedDate?.start
                      ? format(selectedDate.start, "yyyy-MM-dd")
                      : ""
                  }
                  readOnly
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 cursor-not-allowed"
                />
                <span className="text-xs text-slate-500">Date</span>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="time"
                    {...register("startTime")}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <span className="text-xs text-slate-500">Début</span>
              </div>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="time"
                    {...register("endTime")}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <span className="text-xs text-slate-500">Fin</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Notes
            </label>
            <textarea
              {...register("note")}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder="Ajouter des notes..."
            />
          </div>

          {/* Price (Only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Prix <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10"
                  placeholder="0.000"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  TND
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => callCancel()}
                  disabled={loadingCancel}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loadingCancel ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => callDelete()}
                  disabled={loadingDelete}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loadingDelete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting || loadingPatients}
              className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : isEditing ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Mettre à jour
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Créer le RDV
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}