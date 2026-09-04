import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { History as CalendarIcon, Home as HomeIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import { Home } from "./pages/Home";
import { Scan } from "./pages/Scan";
import { Results } from "./pages/Results";
import { History } from "./pages/History";
import { Login } from "./pages/Login";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
      isActive ? "text-primary-700" : "text-neutral-400"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-200 bg-white">
      <NavLink to="/" end className={linkClass}>
        <HomeIcon size={20} />
        Home
      </NavLink>
      <NavLink to="/history" className={linkClass}>
        <CalendarIcon size={20} />
        History
      </NavLink>
    </nav>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="min-h-screen pb-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/scan/:mode" element={<Scan />} />
                <Route path="/results/:mode" element={<Results />} />
                <Route path="/history" element={<History />} />
              </Routes>
              <BottomNav />
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
