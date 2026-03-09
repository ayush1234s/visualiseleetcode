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

import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

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

      const col = note.type === "reminder"
        ? "reminders"
        : "revisionTasks";

      await deleteDoc(doc(db, col, note.id));

    }

  };

  /* ================= CLOSE DROPDOWN ================= */

  useEffect(() => {

    const handler = (e) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setBellOpen(false);
      }

    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);

  }, []);

  /* ================= FORMAT TIME ================= */

  const formatTime = (timestamp) => {

    if (!timestamp) return "";

    const date = new Date(timestamp.toMillis());

    return date.toLocaleString();

  };

  return (
    <>
      <div className="w-full flex justify-center pt-6 sticky top-0 z-50">

        <nav className="w-[95%] max-w-7xl backdrop-blur-xl bg-[#0d1117]/80 border border-[#30363d] rounded-2xl px-6 py-4 flex justify-between items-center">

          {/* LOGO */}

          <div className="flex items-center gap-3 text-white font-semibold text-lg">
            <Brain className="w-7 h-7 text-[#58a6ff]" />
            <span>Visualize LC</span>
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
                      ${
                        isActive
                          ? "bg-[#161b22] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#161b22]"
                      }`}
                    >

                      <Icon size={16} />
                      {item.name}

                    </div>

                  )}

                </NavLink>

              );

            })}

            {/* 🔔 DESKTOP BELL */}

            <div className="relative" ref={dropdownRef}>

              <Bell
                onClick={handleBellClick}
                className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
              />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}

              {bellOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  lastSeen={lastSeen}
                  formatTime={formatTime}
                  removeAllMessages={removeAllMessages}
                />
              )}

            </div>

          </div>

          {/* MOBILE CONTROLS */}

          <div className="md:hidden flex items-center gap-4 relative">

            {/* MOBILE BELL */}

            <div className="relative" ref={dropdownRef}>

              <Bell
                onClick={handleBellClick}
                className="text-gray-400 cursor-pointer"
              />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}

              {bellOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  lastSeen={lastSeen}
                  formatTime={formatTime}
                  removeAllMessages={removeAllMessages}
                />
              )}

            </div>

            {/* MOBILE MENU TOGGLE */}

            {isOpen ? (
              <X
                onClick={() => setIsOpen(false)}
                className="text-white cursor-pointer"
              />
            ) : (
              <Menu
                onClick={() => setIsOpen(true)}
                className="text-white cursor-pointer"
              />
            )}

          </div>

        </nav>

        {/* MOBILE MENU */}

        {isOpen && (

          <div className="absolute top-24 w-[95%] max-w-7xl bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4 md:hidden shadow-2xl">

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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      ${
                        isActive
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
    </>
  );
}

/* ================= DROPDOWN ================= */

function NotificationDropdown({
  notifications,
  lastSeen,
  formatTime,
  removeAllMessages,
}) {

  return (

    <div className="absolute right-0 mt-4 w-80 max-h-96 overflow-y-auto bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-4">

      {notifications.length === 0 ? (

        <p className="text-sm text-gray-400">No messages</p>

      ) : (

        notifications.map((note) => {

          const createdTime = note.createdAt?.toMillis();
          const seen = createdTime < lastSeen;

          return (

            <div
              key={note.id}
              className="border-b border-[#30363d] pb-3 mb-3"
            >

              <p className="text-sm text-white font-medium">
                {note.type === "reminder"
                  ? "Reminder Alert"
                  : "Revision Added"}
              </p>

              <p className="text-xs text-gray-400">
                {note.questionTitle}
              </p>

              <p className="text-xs text-gray-500">
                {note.weekday
                  ? `Today: ${note.weekday}`
                  : `Days: ${note.weekdays?.join(", ")}`}
              </p>

              <p className="text-[11px] mt-1">
                {seen ? (
                  <span className="text-green-400">Seen</span>
                ) : (
                  <span className="text-yellow-400">New</span>
                )}
              </p>

              <p className="text-[10px] text-gray-500">
                {formatTime(note.createdAt)}
              </p>

            </div>

          );

        })

      )}

      {notifications.length > 0 && (

        <button
          onClick={removeAllMessages}
          className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
        >
          Remove All Messages
        </button>

      )}

    </div>

  );
}