import { z } from "zod";

export const appointmentSchema = z
  .object({
    patientId: z.string().min(1, "Patient is required"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.date}T${data.startTime}`);
      const end = new Date(`${data.date}T${data.endTime}`);
      return end > start;
    },
    { message: "End time must be after start time", path: ["endTime"] },
  );

export const patientSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.string(),
  email: z.string(),
  phone: z.string().min(8).max(50),
  note: z.string(),
  addressedBy: z.string(),
  insurance: z.string(),
  birthDate: z.any(),
  startDate: z.any(),
  endDate: z.any(),
});

export const billSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  dateIssued: z.string().min(1, "Date is required"),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
export type PatientFormValues = z.infer<typeof patientSchema>;
export type BillFormValues = z.infer<typeof billSchema>;
