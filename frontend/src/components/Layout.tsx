import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "../utils";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Loans", path: "/loans" },
    { name: "Simulation", path: "/simulation" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white min-h-[60px]">
        <div className="text-xl font-bold text-yellow-500">GoldTrack</div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-slate-300 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out z-50",
          "fixed inset-y-0 left-0 w-64", // Mobile fixed sidebar
          "md:static md:translate-x-0 md:min-h-screen md:w-64", // Desktop static sidebar
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full" // Mobile toggle state
        )}
      >
        <div className="flex items-center justify-between p-4 md:p-6 md:block">
          <div className="text-xl font-bold text-yellow-500 md:mb-8">
            GoldTrack
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-yellow-500 text-slate-900 font-bold shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p
                className="text-sm font-medium truncate text-slate-200"
                title={user?.email}
              >
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full px-2 py-2 rounded-lg hover:bg-slate-800"
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

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
