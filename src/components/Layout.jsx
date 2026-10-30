import { useEffect, useRef, Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, Library, User, Apple, History } from "lucide-react";
import Confetti from "./Confetti";
import NotificationManager from "./NotificationManager";
import OfflineIndicator from "./OfflineIndicator";
import LoadingSkeleton from "./LoadingSkeleton";
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
    <div className="min-h-dvh bg-bg-deep text-white">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <OfflineIndicator />
      <Confetti />
      <NotificationManager />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-52 flex-col border-r border-border-slate bg-bg-surface p-4 lg:flex">
        <NavLink
          to="/"
          className="mb-8 flex items-center gap-3 px-2 py-4"
          aria-label="GymTracker home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
            <Dumbbell size={22} aria-hidden="true" />
          </span>
          <span className="text-base font-bold">
            Gym<span className="text-neon-cyan">Tracker</span>
          </span>
        </NavLink>
        <nav aria-label="Main navigation" className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
              }
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-border-slate p-4">
          {activeWorkout ? (
            <NavLink
              to="/workout/active"
              className="block text-sm font-semibold text-neon-emerald"
            >
              Resume workout
              <span className="mt-1 block text-xs font-normal text-slate-400">
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
      </aside>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="app-main min-h-dvh lg:ml-52 lg:pb-8"
      >
        <div key={location.pathname} className="animate-fadeIn">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <nav
        className="mobile-nav fixed bottom-0 inset-x-0 z-50 border-t border-border-slate bg-bg-surface/95 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex h-16 max-w-xl items-center px-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors ${isActive ? "text-neon-cyan" : "text-slate-400 hover:text-slate-200"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
