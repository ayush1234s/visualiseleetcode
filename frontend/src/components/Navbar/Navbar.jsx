import { NavLink } from "react-router-dom";
import {
  Home,
  Brain,
  BookOpen,
  Calendar,
  Settings as SettingsIcon,
  Bell,
  CircleHelp,
  X,
  Sun,
  Moon,
  Laptop,
  Wifi,
  WifiOff,
  Activity,
  Radio,
  Smartphone,
} from "lucide-react";
import { createElement, useState, useRef, useEffect } from "react";

import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";
import useInternetStatus from "../../hooks/useInternetStatus";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Visualize", path: "/visualize", icon: Brain },
  { name: "Revision", path: "/revision", icon: BookOpen },
  { name: "Daily Contest", path: "/daily-contest", icon: Calendar },
  { name: "Profile", path: "/settings", icon: SettingsIcon },
  { name: "Help", path: "/help", icon: CircleHelp },
];

const mobileBottomNavItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Visualize", path: "/visualize", icon: Brain },
  { name: "Revision", path: "/revision", icon: BookOpen },
  { name: "Daily Contest", path: "/daily-contest", icon: Calendar },
  { name: "Profile", path: "/settings", icon: SettingsIcon },
];

// 🔥 USER ID (NO LOGIN)
const getUserId = () => {
  let uid = localStorage.getItem("userId");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("userId", uid);
  }
  return uid;
};

export default function Navbar() {
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const lastSeen = Number(localStorage.getItem("lastSeenNotification") || 0);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { online, quality, connectionInfo } = useInternetStatus();

  /* ================= LISTEN REVISION TASKS ================= */
  useEffect(() => {
    const userId = getUserId();
    const q = query(
      collection(db, "users", userId, "revisionTasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        type: "task",
        ...d.data(),
      }));
      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  /* ================= LISTEN REMINDERS ================= */
  useEffect(() => {
    const q = query(collection(db, "reminders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        type: "reminder",
        ...d.data(),
      }));
      setNotifications((prev) => [...list, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  /* ================= UNREAD COUNT ================= */
  useEffect(() => {
    const unread = notifications.filter(
      (item) => item.createdAt?.toMillis() > lastSeen
    );
    setUnreadCount(unread.length);
  }, [notifications, lastSeen]);

  /* ================= BELL CLICK ================= */
  const handleBellClick = () => {
    const now = Date.now();
    localStorage.setItem("lastSeenNotification", now);
    setUnreadCount(0);
    setBellOpen(!bellOpen);
  };

  /* ================= REMOVE ALL ================= */
  const removeAllMessages = async () => {
    for (let note of notifications) {
      const col = note.type === "reminder" ? "reminders" : "revisionTasks";
      await deleteDoc(doc(db, col, note.id));
    }
  };

  /* ================= CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= FORMAT TIME ================= */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.toMillis());
    return date.toLocaleString();
  };

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <>
      {/* ================= DESKTOP STICKY CAPSULE TOP BAR ================= */}
      <header className="hidden md:block sticky top-3 lg:top-4 z-50 w-full px-4 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <nav className="relative flex items-center justify-between px-5 lg:px-6 py-2.5 rounded-full bg-[#161b22]/90 backdrop-blur-xl border border-[#30363d]/80 shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition-all duration-300">
            
            {/* BRAND LOGO */}
            <NavLink
              to="/"
              className="flex items-center gap-3 group focus:outline-none shrink-0"
            >
              <div className="p-2 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-500/30 group-hover:border-blue-400 transition-all duration-300 shadow-sm">
                <Brain className="h-5 w-5 text-[#58a6ff] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-bold text-base lg:text-lg tracking-wide text-white group-hover:text-blue-400 transition-colors">
                Visualize <span className="text-blue-400">LC</span>
              </span>
            </NavLink>

            {/* NAV LINKS (CENTER PILLS) */}
            <div className="flex items-center gap-1 lg:gap-1.5 bg-[#0d1117]/60 p-1 rounded-full border border-[#30363d]/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-[#21262d] text-white border border-[#30363d] shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-[#21262d]/50"
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* RIGHT UTILITIES (NETWORK + THEME + NOTIFICATIONS) */}
            <div className="flex items-center gap-2 lg:gap-3 shrink-0" ref={dropdownRef}>

              <NetworkStatus online={online} quality={quality} connectionInfo={connectionInfo} />
              
              {/* THEME TOGGLE BUTTON */}
              <button
                type="button"
                onClick={cycleTheme}
                title={`Theme: ${theme} (Click to change)`}
                className="p-2 rounded-full border border-[#30363d] bg-[#0d1117]/80 hover:bg-[#21262d] text-gray-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
              >
                {theme === "light" ? (
                  <Sun size={17} className="text-yellow-400" />
                ) : theme === "dark" ? (
                  <Moon size={17} className="text-blue-400" />
                ) : (
                  <Laptop size={17} className="text-cyan-400" />
                )}
              </button>

              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleBellClick}
                  title="Notifications"
                  className="relative p-2 rounded-full border border-[#30363d] bg-[#0d1117]/80 hover:bg-[#21262d] text-gray-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1 rounded-full border-2 border-[#161b22] shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS DROPDOWN */}
                {bellOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 lg:w-96 z-50 animate-fadeIn">
                    <NotificationDropdown
                      notifications={notifications}
                      lastSeen={lastSeen}
                      formatTime={formatTime}
                      removeAllMessages={removeAllMessages}
                      onClose={() => setBellOpen(false)}
                      mobile={false}
                    />
                  </div>
                )}
              </div>

            </div>

          </nav>
        </div>
      </header>

      {/* ================= MOBILE TOP NAVBAR ================= */}
      <div className="w-full flex justify-center pt-2 sm:pt-3 md:hidden sticky top-0 z-50 px-3 pointer-events-none">
        <nav className="w-full pointer-events-auto backdrop-blur-2xl bg-[#0d1117]/85 border border-[#30363d] rounded-2xl px-3.5 py-2.5 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <NavLink to="/" className="flex items-center gap-2.5 text-white font-semibold text-base">
            <div className="p-1.5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm">
              <Brain className="w-4 h-4 text-[#58a6ff]" />
            </div>
            <span className="tracking-wide text-sm font-bold">Visualize <span className="text-blue-400">LC</span></span>
          </NavLink>

          {/* MOBILE RIGHT SIDE */}
          <div className="flex items-center gap-2 relative">
            <NetworkStatus online={online} quality={quality} connectionInfo={connectionInfo} compact />
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${theme}`}
              className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] text-gray-300"
            >
              {resolvedTheme === "light" ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-blue-400" />}
            </button>

            <NavLink to="/help">
              {({ isActive }) => (
                <div
                  className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/30"
                      : "bg-[#161b22] text-gray-300 border-[#30363d]"
                  }`}
                >
                  <CircleHelp className="w-4 h-4" />
                </div>
              )}
            </NavLink>

            {/* BELL */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={handleBellClick}
                className="relative p-2 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer"
              >
                <Bell className="w-4 h-4 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold px-1 rounded-full border border-[#0d1117]">
                    {unreadCount}
                  </span>
                )}
              </div>

              {bellOpen && (
                <div className="absolute right-0 top-12 w-[88vw] max-w-sm z-50 animate-fadeIn">
                  <NotificationDropdown
                    notifications={notifications}
                    lastSeen={lastSeen}
                    formatTime={formatTime}
                    removeAllMessages={removeAllMessages}
                    onClose={() => setBellOpen(false)}
                    mobile={true}
                  />
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md">
        <div className="backdrop-blur-2xl bg-[#0d1117]/90 border border-[#30363d] rounded-3xl px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.path}>
                  {({ isActive }) => (
                    <div className="flex flex-col items-center justify-center min-w-[56px] py-1">
                      <div
                        className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                          isActive
                            ? "bg-[#58a6ff]/15 text-[#58a6ff] shadow-[0_0_0_1px_rgba(88,166,255,0.15)]"
                            : "text-gray-400 hover:text-white hover:bg-[#161b22]"
                        }`}
                      >
                        <Icon size={19} />
                      </div>
                      <span
                        className={`text-[10px] mt-0.5 font-medium transition-all duration-300 text-center leading-tight ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {item.name === "Profile"
                          ? "Profile"
                          : item.name === "Daily Contest"
                          ? "Contest"
                          : item.name}
                      </span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function NetworkStatus({ online, quality, connectionInfo, compact = false }) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const label = !online
    ? "Offline"
    : quality === 0
    ? "Online"
    : quality >= 3
    ? "Strong connection"
    : quality === 2
    ? "Fair connection"
    : "Weak connection";
  const strength = !online
    ? 0
    : connectionInfo.downlink !== null
    ? Math.max(5, Math.min(100, Math.round((connectionInfo.downlink / (connectionInfo.downlink + 5)) * 100)))
    : quality > 0
    ? quality * 25
    : null;
  const accessType = connectionInfo.type === "wifi"
    ? "Wi-Fi"
    : connectionInfo.type === "cellular"
    ? "Mobile network"
    : connectionInfo.type === "ethernet"
    ? "Ethernet"
    : connectionInfo.type === "none"
    ? "No network"
    : "Not available";

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!popupRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={popupRef}>
      <button
        type="button"
        aria-label="Show internet connection details"
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`Internet: ${label}. Show connection details.`}
        onClick={() => setOpen((value) => !value)}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-2 transition hover:bg-[#21262d] ${
          online
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}
      >
        {online ? <Wifi size={compact ? 16 : 15} /> : <WifiOff size={16} />}
        <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
          {[1, 2, 3, 4].map((bar) => (
            <span key={bar} className={`w-[3px] rounded-t-sm ${online && (quality === 0 || bar <= quality) ? "bg-current" : "bg-current opacity-20"}`} style={{ height: `${4 + bar * 2}px` }} />
          ))}
        </span>
        {!compact && <span className="hidden text-[11px] font-medium lg:inline">{label}</span>}
      </button>

      {open && (
        <section role="dialog" aria-label="Internet connection details" className="fixed right-3 top-[4.5rem] z-[100] max-h-[min(76vh,36rem)] w-[calc(100vw-1.5rem)] max-w-sm overflow-y-auto rounded-2xl border border-[#30363d] bg-[#111821] p-4 text-white shadow-2xl animate-fadeIn sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:max-h-[min(70vh,36rem)] sm:w-80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Connection details</p>
              <p className="mt-1 text-xs text-gray-400">Live information available to this browser</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${online ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{online ? "Connected" : "Disconnected"}</span>
          </div>

          <div className="mt-4 rounded-xl border border-[#30363d] bg-[#0d1117] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-300"><Activity size={15} className="text-blue-400" />Estimated connection quality</div>
              <span className="text-sm font-bold tabular-nums text-white">{strength === null ? "—" : `${strength}/100`}</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#30363d]"><div className={`h-full rounded-full transition-all ${online ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-red-400"}`} style={{ width: `${strength ?? 0}%` }} /></div>
            <p className="mt-2 text-[10px] leading-4 text-gray-500">Estimate from browser-reported network speed/type, not a hardware Wi-Fi signal reading.</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <ConnectionMetric icon={Radio} label="Access type" value={accessType} />
            <ConnectionMetric icon={Activity} label="Network type" value={connectionInfo.effectiveType === "unknown" ? "Not reported" : connectionInfo.effectiveType.toUpperCase()} />
            <ConnectionMetric icon={Activity} label="Estimated speed" value={connectionInfo.downlink === null ? "Not reported" : `${connectionInfo.downlink} Mbps`} />
            <ConnectionMetric icon={Activity} label="Response time" value={connectionInfo.rtt === null ? "Not reported" : `${connectionInfo.rtt} ms`} />
          </div>

          <div className="mt-3 space-y-2 rounded-xl border border-[#30363d] bg-[#0d1117] p-3.5">
            <div className="flex items-start justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-gray-400"><Wifi size={14} />Wi-Fi name</span><span className="text-right text-gray-300">Hidden by browser</span></div>
            <div className="flex items-start justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-gray-400"><Radio size={14} />Wi-Fi band</span><span className="text-right text-gray-300">2.4 / 5 GHz not exposed</span></div>
            <div className="flex items-start justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-gray-400"><Smartphone size={14} />Mobile generation</span><span className="text-right text-gray-300">{connectionInfo.type === "cellular" ? "Not reported" : "Not available"}</span></div>
          </div>
          {connectionInfo.saveData && <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">Data Saver is enabled in your browser.</p>}
          <p className="mt-3 text-[10px] leading-4 text-gray-500">Wi-Fi name, 2.4/5 GHz band, and exact radio strength are private device details and aren’t shared with websites.</p>
        </section>
      )}
    </div>
  );
}

function ConnectionMetric({ icon: Icon, label, value }) {
  return <div className="min-w-0 rounded-xl border border-[#30363d] bg-[#0d1117] p-3"><div className="flex items-center gap-1.5 text-[10px] text-gray-500">{createElement(Icon, { size: 12 })}{label}</div><p className="mt-1.5 truncate text-xs font-semibold text-gray-200" title={value}>{value}</p></div>;
}

/* ================= DROPDOWN ================= */
function NotificationDropdown({
  notifications,
  lastSeen,
  formatTime,
  removeAllMessages,
  onClose,
  mobile,
}) {
  return (
    <div className="w-full max-h-96 overflow-y-auto bg-[#161b22]/95 backdrop-blur-2xl border border-[#30363d] rounded-2xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-semibold">Notifications</h3>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <span className="text-[11px] text-gray-400">
              {notifications.length} items
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded-lg p-1 text-gray-400 transition hover:bg-[#0d1117] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No messages</p>
        </div>
      ) : (
        notifications.map((note) => {
          const createdTime = note.createdAt?.toMillis();
          const seen = createdTime < lastSeen;

          return (
            <div
              key={note.id}
              className="border border-[#30363d] bg-[#0d1117]/70 rounded-xl p-3 mb-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white font-medium">
                    {note.type === "reminder"
                      ? "Reminder Alert"
                      : "Revision Added"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {note.questionTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 break-words">
                    {note.weekday
                      ? `Today: ${note.weekday}`
                      : `Days: ${note.weekdays?.join(", ")}`}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    {formatTime(note.createdAt)}
                  </p>
                </div>

                <div className="shrink-0">
                  {seen ? (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Seen
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {notifications.length > 0 && (
        <button
          onClick={removeAllMessages}
          className="w-full mt-2 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white text-sm py-2 rounded-xl font-medium"
        >
          Remove All Messages
        </button>
      )}
    </div>
  );
}
