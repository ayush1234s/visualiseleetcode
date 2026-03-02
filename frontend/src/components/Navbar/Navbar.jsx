import { NavLink } from "react-router-dom";
import {
  Home,
  Brain,
  BookOpen,
  Calendar,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Visualize", path: "/visualize", icon: Brain },
  { name: "Revision", path: "/revision", icon: BookOpen },
  { name: "Daily Contest", path: "/daily-contest", icon: Calendar },
  { name: "Profile Settings", path: "/settings", icon: Settings },
  { name: "Help", path: "/help", icon: BookOpen },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="w-full flex justify-center pt-6 sticky top-0 z-50">
        <nav className="w-[95%] max-w-7xl backdrop-blur-xl bg-[#0d1117]/80 border border-[#30363d] 
                        rounded-2xl px-6 py-4 flex justify-between items-center
                        shadow-[0_8px_30px_rgba(0,0,0,0.6)]">

          {/* 🔥 ANIMATED LOGO */}
          <div className="flex items-center gap-3 text-white font-semibold text-lg cursor-pointer group">

            <div className="relative">
              <Brain
                className="w-7 h-7 text-[#58a6ff] 
                 animate-brainPulse
                 group-hover:scale-110 
                 transition duration-300"
              />

              {/* Glow Effect */}
              <div className="absolute inset-0 w-7 h-7 bg-[#58a6ff] blur-xl opacity-20 animate-glowPulse rounded-full"></div>
            </div>

            <span className="tracking-wide group-hover:text-[#58a6ff] transition duration-300">
              Visualize LC
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-4 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.path}>
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm 
                        transition-all duration-300 cursor-pointer
                        ${isActive
                          ? "bg-[#161b22] text-white border border-[#30363d] shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-[#161b22] hover:scale-105"
                        }`}
                    >
                      <Icon size={16} />
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}

            {/* DESKTOP BELL */}
            <div className="relative" ref={dropdownRef}>
              <Bell
                onClick={() => setBellOpen(!bellOpen)}
                className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition hover:scale-110"
              />

              {bellOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-[#161b22] border border-[#30363d]
                                rounded-xl shadow-2xl p-4 animate-fadeIn">
                  <p className="text-sm text-gray-300">
                    No new notifications.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE RIGHT SIDE */}
          <div className="md:hidden flex items-center gap-4 relative">

            <div ref={dropdownRef}>
              <Bell
                onClick={() => setBellOpen(!bellOpen)}
                className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition"
              />

              {bellOpen && (
                <div className="absolute right-0 top-10 w-60 bg-[#161b22] border border-[#30363d]
                                rounded-xl shadow-2xl p-4 animate-fadeIn">
                  <p className="text-sm text-gray-300">
                    No new notifications.
                  </p>
                </div>
              )}
            </div>

            {isOpen ? (
              <X onClick={() => setIsOpen(false)} className="cursor-pointer" />
            ) : (
              <Menu onClick={() => setIsOpen(true)} className="cursor-pointer" />
            )}
          </div>
        </nav>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="absolute top-24 w-[95%] max-w-7xl bg-[#161b22] border border-[#30363d]
                          rounded-2xl p-6 space-y-4 md:hidden shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                        ${isActive
                          ? "bg-[#0d1117] text-white"
                          : "text-gray-400 hover:text-white"
                        }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔥 CUSTOM ANIMATION STYLE */}
      <style>
        {`
          @keyframes brainSpin {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(8deg); }
            100% { transform: rotate(0deg); }
          }

          .animate-brainSpin {
            animation: brainSpin 3s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
}