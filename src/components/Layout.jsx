import { useEffect, useRef, Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, Library, User, Apple, History } from "lucide-react";
import Confetti from "./Confetti";
import NotificationManager from "./NotificationManager";
import OfflineIndicator from "./OfflineIndicator";
import LoadingSkeleton from "./LoadingSkeleton";
import PWAInstallButton from "./PWAInstallButton";
import useWorkoutStore from "../store/workoutStore";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/exercises", icon: Library, label: "Exercises" },
  { to: "/nutrition", icon: Apple, label: "Nutrition" },
  { to: "/history", icon: History, label: "History" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const mainRef = useRef(null);
  const previousPath = useRef(location.pathname);
  const activeWorkout = useWorkoutStore((state) => state.activeWorkout);

  useEffect(() => {
    const section = navItems.find((item) =>
      item.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.to),
    );
    document.title = `${section?.label || "Page not found"} · GymTracker`;
    if (previousPath.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      mainRef.current?.focus({ preventScroll: true });
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-dvh w-full overflow-x-clip bg-bg-deep text-white">
      {/* Status-bar shield prevents scrolled content from bleeding behind system icons */}
      <div
        className="fixed top-0 inset-x-0 z-40 bg-bg-deep pointer-events-none"
        style={{ height: "var(--safe-top)" }}
        aria-hidden="true"
      />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <OfflineIndicator />
      <Confetti />
      <NotificationManager />

      {/* ── Desktop Sidebar (>= lg) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-slate-800 bg-bg-surface p-4 pt-[calc(1rem+var(--safe-top))] pb-[calc(1rem+var(--safe-bottom))] lg:flex">
        <NavLink
          to="/"
          className="mb-6 flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-800/40 transition-colors"
          aria-label="GymTracker home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-950 shrink-0">
            <Dumbbell size={20} aria-hidden="true" />
          </span>
          <span className="text-base font-bold tracking-tight text-white">
            GymTracker
          </span>
        </NavLink>

        <nav aria-label="Main navigation" className="space-y-1.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-950 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <PWAInstallButton compact />
          <div className="rounded-2xl border border-slate-800 bg-bg-deep/70 p-3.5">
            {activeWorkout ? (
              <NavLink
                to="/workout/active"
                className="block text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Resume workout →
                <span className="mt-1 block text-xs font-normal text-slate-300 truncate">
                  {activeWorkout.programName}
                </span>
              </NavLink>
            ) : (
              <p className="text-xs leading-relaxed text-slate-400">
                Small steps. Stronger habits.
                <br />
                Your next session starts here.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="app-main min-h-dvh w-full min-w-0 lg:pl-56 lg:pb-8"
      >
        <div key={location.pathname} className="w-full min-w-0">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* ── Mobile & Tablet Bottom Navigation (< lg) ── */}
      <nav
        className="mobile-nav fixed bottom-0 inset-x-0 z-50 border-t border-slate-800 bg-bg-surface/95 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid h-16 max-w-2xl grid-cols-6 items-center px-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 transition-colors ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute top-0.5 h-0.5 w-6 rounded-full bg-sky-400"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    aria-hidden="true"
                  />
                  <span className="max-w-full truncate text-[10px] leading-tight">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
