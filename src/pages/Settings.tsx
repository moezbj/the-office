import * as React from "react";
import {
  Sun,
  Moon,
  Clock,
  Globe,
  CreditCard,
  Save,
  Loader2,
  Settings,
  User,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { updateWork, updateLang } from "@/services/auth.service";
import { AuthContext } from "@/providers/AuthProvider";

export default function SettingsPage(): React.JSX.Element {
  const { setUser, user } = React.useContext(AuthContext);

  const [call, { loading }] = useMutation(updateWork, {
    onCompleted: (res: any) => {
      if (user) {
        setUser({
          ...user,
          endWork: res.updateWork.endWork,
          startWork: res.updateWork.startWork,
          slotDuration: res.updateWork.slotDuration,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    },
  });

  /*   const [callUpdateLang] = useMutation(updateLang, {
    onCompleted: () => {
      if (user) {
        setUser({ ...user });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    },
  }); */

  const [start, setStart] = React.useState<string>("");
  const [end, setEnd] = React.useState<string>("");
  const [slot, setSlot] = React.useState<string>("00:45:00");
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const startDate = new Date(user.startWork);
      const endDate = new Date(user.endWork);
      setStart(
        `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`,
      );
      setEnd(
        `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`,
      );
      setSlot(user.slotDuration || "00:45:00");
    }
  }, [user]);

  const handleSave = () => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);

    call({
      variables: {
        startWork: startDate,
        endWork: endDate,
        slotDuration: slot,
      },
    });
  };

  /*   const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    callUpdateLang({
      variables: {
        lang: lang,
      },
    });
  }; */

  const timeSlots = [
    { value: "00:15:00", label: "15 minutes" },
    { value: "00:30:00", label: "30 minutes" },
    { value: "00:45:00", label: "45 minutes" },
    { value: "01:00:00", label: "1 hour" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Settings
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your preferences and account settings
            </p>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl animate-pulse">
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Saved successfully!</span>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">{user.email}</p>
                </div>
              </div>
              {user.taxRegistration && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tax ID</p>
                    <p className="font-medium text-slate-800">
                      {user.taxRegistration}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Working Hours Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Working Hours
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Set your daily working schedule and appointment slot duration
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Slot Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Slot Duration
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {timeSlots.map((timeSlot) => (
                    <option key={timeSlot.value} value={timeSlot.value}>
                      {timeSlot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Theme Card */}
        {/*  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              {colorMode === "dark" ? (
                <Moon className="w-5 h-5 text-blue-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              Appearance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose your preferred theme mode
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleColorMode}
                  className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${
                    colorMode === "dark" ? "bg-slate-700" : "bg-blue-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 flex items-center justify-center ${
                      colorMode === "dark" ? "translate-x-8" : "translate-x-0"
                    }`}
                  >
                    {colorMode === "dark" ? (
                      <Moon className="w-4 h-4 text-slate-700" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </span>
                </button>
                <div>
                  <p className="font-medium text-slate-800">
                    {colorMode === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {colorMode === "dark"
                      ? "Easier on the eyes in low light"
                      : "Bright and clear for daytime use"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Language Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Language
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your preferred interface language
            </p>
          </div>
        </div>

        {/* Currency Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Currency
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage your billing currency settings
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 py-4">
          <p>© 2026 My Office • Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
