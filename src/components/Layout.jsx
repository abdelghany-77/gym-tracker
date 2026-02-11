import { NavLink, Outlet } from "react-router-dom";
import { Home, Dumbbell, Library, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/exercises", icon: Library, label: "Exercises" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Main content area — scrollable, with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-neon-blue scale-105"
                    : "text-slate-500 hover:text-slate-300 active:scale-95"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
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
