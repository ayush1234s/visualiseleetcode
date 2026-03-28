import { NavLink } from "react-router-dom";
import {
  Home,
  Brain,
  BookOpen,
  Calendar,
  Settings,
  Bell,
  CircleHelp,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";

import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

const desktopNavItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Visualize", path: "/visualize", icon: Brain },
  { name: "Revision", path: "/revision", icon: BookOpen },
  { name: "Daily Contest", path: "/daily-contest", icon: Calendar },
  { name: "Profile Settings", path: "/settings", icon: Settings },
  { name: "Help", path: "/help", icon: CircleHelp },
];

const mobileBottomNavItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Visualize", path: "/visualize", icon: Brain },
  { name: "Revision", path: "/revision", icon: BookOpen },
  { name: "Daily Contest", path: "/daily-contest", icon: Calendar },
  { name: "Profile Settings", path: "/settings", icon: Settings },
];

export default function Navbar() {
  const [bellOpen, setBellOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);

  const lastSeen = Number(localStorage.getItem("lastSeenNotification") || 0);

  /* ================= LISTEN REVISION TASKS ================= */
  useEffect(() => {
    const q = query(
      collection(db, "revisionTasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "task",
        ...doc.data(),
      }));

      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  /* ================= LISTEN REMINDERS ================= */
  useEffect(() => {
    const q = query(
      collection(db, "reminders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "reminder",
        ...doc.data(),
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
  }, [notifications]);

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

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <div className="w-full flex justify-center pt-4 md:pt-6 sticky top-0 z-50 px-3 md:px-0">
        <nav className="w-full md:w-[95%] max-w-7xl backdrop-blur-2xl bg-[#0d1117]/85 border border-[#30363d] rounded-2xl px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          
          {/* LOGO */}
          <div className="flex items-center gap-3 text-white font-semibold text-base md:text-lg">
            <div className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] shadow-md">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-[#58a6ff]" />
            </div>
            <span className="tracking-wide">Visualize LC</span>
          </div>

          {/* ================= DESKTOP NAV ================= */}
          <div className="hidden md:flex items-center gap-4 relative">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.name} to={item.path}>
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 border
                      ${
                        isActive
                          ? "bg-[#161b22] text-white border-[#58a6ff]/30 shadow-[0_0_0_1px_rgba(88,166,255,0.15)]"
                          : "text-gray-400 border-transparent hover:text-white hover:bg-[#161b22] hover:border-[#30363d]"
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
              <div
                onClick={handleBellClick}
                className="relative p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/30 transition-all duration-300 cursor-pointer"
              >
                <Bell className="w-5 h-5 text-gray-300 hover:text-white" />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold px-1.5 rounded-full border border-[#0d1117] shadow-lg">
                  {unreadCount}
                </span>
              )}

              {bellOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  lastSeen={lastSeen}
                  formatTime={formatTime}
                  removeAllMessages={removeAllMessages}
                  mobile={false}
                />
              )}
            </div>
          </div>

          {/* ================= MOBILE RIGHT SIDE ================= */}
          <div className="md:hidden flex items-center gap-2 relative">
            
            {/* HELP */}
            <NavLink to="/help">
              {({ isActive }) => (
                <div
                  className={`relative p-2.5 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    isActive
                      ? "bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/30"
                      : "bg-[#161b22] text-gray-300 border-[#30363d]"
                  }`}
                >
                  <CircleHelp className="w-5 h-5" />
                </div>
              )}
            </NavLink>

            {/* BELL */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={handleBellClick}
                className="relative p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer"
              >
                <Bell className="w-5 h-5 text-gray-300" />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold px-1 rounded-full border border-[#0d1117]">
                  {unreadCount}
                </span>
              )}

              {bellOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  lastSeen={lastSeen}
                  formatTime={formatTime}
                  removeAllMessages={removeAllMessages}
                  mobile={true}
                />
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md">
        <div className="backdrop-blur-2xl bg-[#0d1117]/90 border border-[#30363d] rounded-3xl px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.name} to={item.path}>
                  {({ isActive }) => (
                    <div className="flex flex-col items-center justify-center min-w-[56px] py-1">
                      <div
                        className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition-all duration-300
                        ${
                          isActive
                            ? "bg-[#58a6ff]/15 text-[#58a6ff] shadow-[0_0_0_1px_rgba(88,166,255,0.15)]"
                            : "text-gray-400 hover:text-white hover:bg-[#161b22]"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <span
                        className={`text-[10px] mt-1 font-medium transition-all duration-300 text-center leading-tight ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {item.name === "Profile Settings"
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

      {/* MOBILE SPACE */}
      <div className="h-20 md:hidden" />
    </>
  );
}

/* ================= DROPDOWN ================= */

function NotificationDropdown({
  notifications,
  lastSeen,
  formatTime,
  removeAllMessages,
  mobile,
}) {
  return (
    <div
      className={`absolute ${
        mobile ? "right-0 top-14 w-[88vw] max-w-sm" : "right-0 mt-4 w-80"
      } max-h-96 overflow-y-auto bg-[#161b22]/95 backdrop-blur-2xl border border-[#30363d] rounded-2xl shadow-2xl p-4`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <span className="text-[11px] text-gray-400">
            {notifications.length} items
          </span>
        )}
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
          className="w-full mt-2 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white text-sm py-2.5 rounded-xl font-medium"
        >
          Remove All Messages
        </button>
      )}
    </div>
  );
}