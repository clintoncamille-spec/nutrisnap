import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  History as CalendarIcon,
  Home as HomeIcon,
  Sparkles as SparklesIcon,
  User as UserIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useProfile } from "@nutrisnap/shared";
import { useAuth } from "./lib/AuthContext";
import { apiClient } from "./lib/apiClient";
import { Home } from "./pages/Home";
import { Scan } from "./pages/Scan";
import { Results } from "./pages/Results";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { Profile } from "./pages/Profile";
import { Coach } from "./pages/Coach";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireOnboarding({ children }: { children: React.ReactElement }) {
  const { data: profile, isLoading, isError, refetch } = useProfile(apiClient);

  if (isLoading) return null;
  if (isError) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 p-4 pt-24 text-center">
        <p className="text-sm text-danger-600">Couldn't load your profile.</p>
        <button
          onClick={() => refetch()}
          className="text-sm font-medium text-primary-700 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }
  // A profile is created lazily with displayName: null on first access
  // (see profileRepository.get) — onboarding always sets a non-null,
  // non-empty name, so its absence is what gates a first-run user into
  // the setup flow rather than a new schema column just for this.
  if (profile && !profile.displayName) return <Onboarding />;
  return children;
}

function OnboardingRoute() {
  const navigate = useNavigate();
  return <Onboarding onSaved={() => navigate("/profile")} />;
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
      <NavLink to="/coach" className={linkClass}>
        <SparklesIcon size={20} />
        Coach
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <UserIcon size={20} />
        Profile
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
            <RequireOnboarding>
              <div className="min-h-screen pb-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/scan/:mode" element={<Scan />} />
                  <Route path="/results/:mode" element={<Results />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/coach" element={<Coach />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/onboarding" element={<OnboardingRoute />} />
                </Routes>
                <BottomNav />
              </div>
            </RequireOnboarding>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
