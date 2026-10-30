import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, User, Apple, History } from "lucide-react";
import Confetti from "./Confetti";
import NotificationManager from "./NotificationManager";
import OfflineIndicator from "./OfflineIndicator";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/nutrition", icon: Apple, label: "Nutrition" },
  { to: "/history", icon: History, label: "History" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const isWorkoutActive = location.pathname === "/workout/active";

  return (
    <div className="min-h-screen bg-bg-deep text-white flex flex-col">
      {/* Offline indicator (item 14) */}
      <OfflineIndicator />
      {/* Confetti overlay */}
      <Confetti />
      {/* Notification manager (background reminders) */}
      <NotificationManager />

      {/* Main content area — full screen when workout is active */}
      <main
        className={`app-main flex-1 ${
          isWorkoutActive
            ? "app-main-active h-screen max-h-screen overflow-hidden !pb-0"
            : "overflow-y-auto"
        }`}
        role="main"
      >
        <div key={location.pathname} className={isWorkoutActive ? "h-full" : "animate-fadeIn"}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Bar — hidden during Active Workout focus mode */}
      {!isWorkoutActive && (
        <nav
          className="app-nav fixed bottom-0 inset-x-0 z-50 bg-bg-surface/95 backdrop-blur-xl border-t border-border-slate"
          aria-label="Main navigation"
          role="navigation"
        >
          <div className="flex items-center justify-around h-16 max-w-3xl mx-auto px-2 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? "text-neon-cyan"
                      : "text-slate-500 hover:text-slate-300 active:scale-95"
                  }`
                }
                aria-label={item.label}
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      {isActive && (
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                      )}
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="text-[11px] font-medium">
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
