import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Dumbbell, User, Apple, TrendingUp } from "lucide-react";
import Confetti from "./Confetti";
import NotificationManager from "./NotificationManager";
import OfflineIndicator from "./OfflineIndicator";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/history", icon: TrendingUp, label: "Progress" },
  { to: "/nutrition", icon: Apple, label: "Nutrition" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const isWorkoutActive = location.pathname === "/workout/active";

  return (
    <div className="min-h-screen bg-bg-deep text-[#F1F5F7] flex flex-col font-sans">
      {/* Offline indicator */}
      <OfflineIndicator />
      {/* Confetti overlay */}
      <Confetti />
      {/* Notification manager */}
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

      {/* Bottom Navigation Bar — matches Reference Mockup Panel 11 */}
      {!isWorkoutActive && (
        <nav
          className="app-nav fixed bottom-0 inset-x-0 z-50 bg-[#142332]/95 backdrop-blur-xl border-t border-[#223348]"
          aria-label="Main navigation"
          role="navigation"
        >
          <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 sm:px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? "text-[#C4E58A]"
                      : "text-[#8E9FA5] hover:text-[#F1F5F7] active:scale-95"
                  }`
                }
                aria-label={item.label}
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      {isActive && (
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#C4E58A] rounded-full shadow-[0_0_8px_rgba(196,229,138,0.4)]" />
                      )}
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">
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
