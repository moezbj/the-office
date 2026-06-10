export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  startWork: string;
  endWork: string;
  slotDuration: string;
  taxRegistration: string;
  country: string;
  currency: {
    name: string;
    native: string;
    symbol: string;
  };
}
export interface Token {
  accessToken: string;
  expiresIn: string;
  refreshToken: string;
  tokenType: string;
}

export interface Auth {
  user: User;
  token: Token;
}
export interface RefreshResponse {
  user: User;
  token: Token;
}

export interface Appointment {
  id: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  startTime: string;
  endTime: string;
  price: number;
  user: User;
  status: string;
  note: string;
}
export interface Bill {
  id: string;
  patientId: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}
export interface Patient {
  id: string;
  name: string;
  note: string;
  age: string;
  email: string;
  phone: string;
  insurance: string;
  Appointments: [Appointment];
  addressedBy: string;
  birthDate: string;
  startDate: string;
  endDate: string;
  createdAt: Date;
}
export interface ApiError {
  message: string;
  code?: string;
}
export interface NoteType {
  id: string;
  note: string;
  title: string;
}
