import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Calendar,
  Users,
  Receipt,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      to: "/",
      icon: Calendar,
      label: "Calendar",
      description: "Appointments",
    },
    {
      to: "/patients",
      icon: Users,
      label: "Patients",
      description: "Manage patients",
    },
    {
      to: "/bills",
      icon: Receipt,
      label: "Bills",
      description: "Invoices & payments",
    },
    {
      to: "/note",
      icon: FileText,
      label: "Notes",
      description: "Quick notes",
    },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    } ${isCollapsed ? "justify-center" : ""}`;

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out shadow-xl`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Office
                </h1>
                <p className="text-xs text-slate-500">Practice Management</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${
              isCollapsed ? "mx-auto" : ""
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user.firstName?.[0]?.toUpperCase() || "U"}
              {user.lastName?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${
                isCollapsed ? "" : "transition-transform group-hover:scale-110"
              }`}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.label}</p>
                <p className="text-xs text-slate-300 truncate">
                  {item.description}
                </p>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        {!isCollapsed && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Settings</span>
          </NavLink>
        )}

        <button
          onClick={logout}
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          <p>© 2026 My Office</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
