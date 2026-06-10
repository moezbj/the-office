import { useState, useCallback, useEffect, useMemo, useRef } from "react"; // Added useRef
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import AppointmentModal from "../components/Calendar/AppointmentModal";
import { FETCH_APPOINTMENTS } from "../services/appointment.service";
import { Appointment } from "../types";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@apollo/client/react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "./styles/styles.css";

export default function CalendarPage() {
  const user = useAuthStore((state) => state.user);

  // 1. Create a ref to access the FullCalendar API
  const calendarRef = useRef<any>(null);

  // 2. State to hold the dynamic calendar title (e.g., "June 2026")
  const [currentTitle, setCurrentTitle] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(
    null,
  );
  const [selectedDropEvent, setSelectedDropEvent] =
    useState<EventDropArg | null>(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const [slotMinTime, setSlotMinTime] = useState("");
  const [slotMaxTime, setSlotMaxTime] = useState("");
  const [slotTime, setSlotTime] = useState("00:45:00");

  const { data, refetch, loading } = useQuery(FETCH_APPOINTMENTS, {
    fetchPolicy: "cache-and-network",
  });

  // ... (Keep your formattedData and stats useMemo exactly as they were) ...
  const formattedData = useMemo(() => {
    if (!data) return [];
    return (data as { appointments: Appointment[] }).appointments.map(
      (app: Appointment) => {
        const getColor = (status: string) => {
          switch (status) {
            case "DONE":
              return { bg: "#10b981", border: "#059669", text: "#065f46" };
            case "CANCELED":
              return { bg: "#ef4444", border: "#dc2626", text: "#991b1b" };
            case "PENDING":
              return { bg: "#3b82f6", border: "#2563eb", text: "#1e40af" };
            default:
              return { bg: "#8b5cf6", border: "#7c3aed", text: "#5b21b6" };
          }
        };
        const colors = getColor(app.status);
        return {
          id: app.id,
          title: app.patient.name,
          start: Number(app.startTime),
          end: Number(app.endTime),
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: "#ffffff",
          extendedProps: {
            phone: app.patient.phone,
            price: app.price,
            patient: app.patient,
            note: app.note,
            end: Number(app.endTime),
            status: app.status,
            colors: colors,
          },
        } as EventInput;
      },
    );
  }, [data]);
  const stats = useMemo(() => {
    if (!data) return { total: 0, completed: 0, canceled: 0, pending: 0 };
    const appointments = (data as { appointments: Appointment[] }).appointments;
    return {
      total: appointments.length,
      completed: appointments.filter((a) => a.status === "DONE").length,
      canceled: appointments.filter((a) => a.status === "CANCELED").length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
    };
  }, [data]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    setIsModalOpen(true);
  }, []);

  const handleEventSelect = (selectInfo: EventClickArg) => {
    setSelectedEvent(selectInfo);
    setIsModalOpen(true);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    setSelectedDropEvent(dropInfo);
  };

  // 3. FIXED Navigation Functions using the Ref
  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.today();
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.next();
  };

  const changeView = (view: string) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.changeView(view);
  };

  useEffect(() => {
    if (user) {
      setSlotMinTime(user.startWork.split(" ")[1]);
      setSlotMaxTime(user.endWork.split(" ")[1]);
      setSlotTime(user.slotDuration || "00:45:00");
    }
  }, [user]);
  console.log("slotMinTime", slotMinTime, "slotMaxTime", slotMaxTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total RDV</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Terminés</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">En attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Annulés</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.canceled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Custom Toolbar */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                  <button
                    onClick={handlePrev}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* 4. Display the dynamic title here */}
              <h2 className="text-2xl font-bold text-slate-800 capitalize">
                {currentTitle}
              </h2>

              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                {["dayGridMonth", "timeGridWeek", "timeGridDay"].map((view) => (
                  <button
                    key={view}
                    onClick={() => changeView(view)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === view
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {view === "dayGridMonth"
                      ? "Mois"
                      : view === "timeGridWeek"
                        ? "Semaine"
                        : "Jour"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef} // 5. Attach the ref here!
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                timeZone="UTC"
                headerToolbar={false} // Hide default header since we built a custom one
                eventClassNames="event-container"
                selectable={true}
                editable={true}
                weekends={true}
                nowIndicator={true}
                firstDay={1}
                hiddenDays={[0]}
                select={handleDateSelect}
                eventDrop={handleEventDrop}
                eventClick={handleEventSelect}
                events={formattedData}
                height="auto"
                lazyFetching={true}
                locale="fr"
                slotMinTime={slotMinTime}
                slotMaxTime={slotMaxTime}
                slotDuration={slotTime}
                eventContent={renderEventContent}
                allDaySlot={true}
                // 6. Update the title state whenever the calendar view changes
                datesSet={(dateInfo) => {
                  setCurrentTitle(dateInfo.view.title);
                }}
                slotLabelFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                dayHeaderFormat={{
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                }}
              />
            )}
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        setOpen={setIsModalOpen}
        selectedDate={selectedDate}
        info={selectedEvent}
        refetch={refetch}
        selectedDropEvent={selectedDropEvent}
        setSelectedEvent={setSelectedEvent}
        setSelectedDate={setSelectedDate}
        setSelectedDropEvent={setSelectedDropEvent}
      />
    </div>
  );
}

// Keep your renderEventContent exactly as it was
const renderEventContent = (eventContent: EventContentArg) => {
  const colors = eventContent.event.extendedProps.colors || {
    bg: "#3b82f6",
    border: "#2563eb",
    text: "#ffffff",
  };

  return (
    <div
      className="flex flex-col gap-0.5 py-1.5 px-2 h-[80px] overflow-hidden rounded-md text-white"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 opacity-80" />
        <span className="font-bold text-xs">{eventContent.timeText}</span>
      </div>
      <span className="font-semibold text-sm truncate leading-tight">
        {eventContent.event.title}
      </span>
      {eventContent.event.extendedProps.phone && (
        <span className="font-medium text-xs opacity-90 truncate">
          {eventContent.event.extendedProps.phone}
        </span>
      )}
    </div>
  );
};
