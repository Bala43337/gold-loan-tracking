import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "../utils";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Loans", path: "/loans" },
    { name: "Simulation", path: "/simulation" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white min-h-[60px] md:min-h-screen flex md:flex-col items-center md:items-start p-4">
        <div className="text-xl font-bold text-primary mb-0 md:mb-8 mr-8 md:mr-0">
          GoldTrack
        </div>
        <nav className="flex md:flex-col gap-2 w-full overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                location.pathname === item.path
                  ? "bg-primary text-slate-900 font-semibold"
                  : "hover:bg-slate-800"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800 w-full hidden md:block">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-full px-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 2.062-5M12 12h9"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
