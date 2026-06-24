import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Sidebar from "./components/Layout/Sidebar";
import CalendarPage from "./pages/CalendarPage";
import PatientsPage from "./pages/PatientsPage";
import NotePage from "./pages/Note";
import BillsPage from "./pages/BillsPage";
import { ErrorBoundary } from "./components/UI/ErrorBoundary";
import AuthProvider from "./providers/AuthProvider";
import SettingsPage from "./pages/Settings";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
};

// 🚨 NEW COMPONENT: This holds the useNavigate hook and the Routes
const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (...args: any[]) => {
      const flatArgs = args.flat(Infinity);
      const deeplinkingUrl = flatArgs.find((arg) => typeof arg === "string");

      if (!deeplinkingUrl) return;

      let path = "";

      // Scenario A: Dev mode (Vite dev server)
      if (deeplinkingUrl.startsWith("http://") || deeplinkingUrl.startsWith("https://")) {
        const hashIndex = deeplinkingUrl.indexOf("#");
        if (hashIndex !== -1) {
          path = deeplinkingUrl.substring(hashIndex + 1);
        }
      }
      // Scenario B: Production / Custom Protocol
      else {
        let stripped = deeplinkingUrl.replace(/^electron-fiddle:\/\//, "");
        stripped = stripped.replace(/#/g, "");
        path = stripped;
      }

      if (path) {
        const finalPath = path.startsWith("/") ? path : `/${path}`;
      

        navigate(finalPath);
      }
    };

    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.receive("navigate", handleNavigate);
    }

    return () => {
      if ((window as any).ipcRenderer) {
        (window as any).ipcRenderer.receive("navigate", () => { });
      }
    };
  }, [navigate]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgetPassword" element={<ForgotPassword />} />

        {/* 🚨 Added dynamic route to match the link in your email: /reset-password/:userId/:token */}
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/note"
          element={
            <ProtectedRoute>
              <NotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <HashRouter>
      {/* 🚨 Render the new component INSIDE the HashRouter */}
      <AppRoutes />
    </HashRouter>
  );
}