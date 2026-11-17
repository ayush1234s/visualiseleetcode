import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  BookOpen,
  Calendar,
  Mail,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  CheckCircle2,
} from "lucide-react";
import { SiLeetcode } from "react-icons/si";

// 🔥 USER ID (NO LOGIN)
const getUserId = () => {
  let uid = localStorage.getItem("userId");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("userId", uid);
  }
  return uid;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Revision() {
  const [questionNumber, setQuestionNumber] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [weekdays, setWeekdays] = useState(["Monday", "Wednesday", "Friday"]);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [revisionStatus, setRevisionStatus] = useState({});

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const loadTasks = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "users", getUserId(), "revisionTasks")
      );
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTasks(list);
    } catch (err) {
      console.warn("Could not load revision tasks:", err.message);
    }
  };

  const setEmailStatus = async (taskId, emailStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, emailStatus } : task
      )
    );

    try {
      await updateDoc(doc(db, "users", getUserId(), "revisionTasks", taskId), {
        emailStatus,
      });
    } catch (err) {
      console.warn("Could not save email status:", err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const fetchQuestion = async () => {
    if (!questionNumber) {
      toast.error("Enter a problem number first");
      return;
    }

    setFetchLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/visualize`,
        { questionNumber }
      );
      setQuestionTitle(res.data.question);
      toast.success("Question title found!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not fetch problem title.");
    } finally {
      setFetchLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter((d) => d !== day));
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  const getDeviceDescription = () => {
    if (typeof window === "undefined" || !navigator) return "Web Client";
    const ua = navigator.userAgent;
    let os = "Desktop";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad/i.test(ua)) os = "iOS";

    let browser = "Browser";
    if (/Edg/i.test(ua)) browser = "Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";

    return `${os} • ${browser}`;
  };

  const addRevisionTask = async () => {
    if (!questionNumber || !email || weekdays.length === 0) {
      toast.error("Please fill in problem number, email, and at least one day.");
      return;
    }

    setLoading(true);
    const createdAt = new Date();

    try {
      const docRef = await addDoc(
        collection(db, "users", getUserId(), "revisionTasks"),
        {
          questionNumber,
          questionTitle: questionTitle || `Problem #${questionNumber}`,
          weekdays,
          email,
          createdAt,
          emailStatus: "Active",
        }
      );

      toast.success("Problem scheduled for revision!");
      loadTasks();
      setLoading(false);

      // Trigger email sending in background (handles Vercel gracefully)
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URL}/api/email/send-revision-email`,
          {
            email,
            questionNumber,
            questionTitle: questionTitle || `Problem #${questionNumber}`,
            weekdays,
            createdAt,
            id: docRef.id,
            userId: getUserId(),
            deviceInfo: getDeviceDescription(),
          }
        )
        .then(async (res) => {
          if (res.data && res.data.success) {
            await setEmailStatus(docRef.id, "Delivered");
          } else {
            await setEmailStatus(docRef.id, "Active");
          }
          loadTasks();
        })
        .catch(async () => {
          // Keep as Active so user schedule is never blocked by Vercel outbound policies
          await setEmailStatus(docRef.id, "Active");
          loadTasks();
        });
    } catch (err) {
      toast.error("Failed to save task: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  const addToCalendar = () => {
    if (!questionNumber) {
      toast.error("Please enter a question number first");
      return;
    }

    setCalendarLoading(true);
    const titleText = questionTitle || `LeetCode #${questionNumber}`;
    const text = `Revise: ${titleText}`;
    const details = `Periodic LeetCode Revision for Problem #${questionNumber} on days: ${weekdays.join(", ")}`;

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      text
    )}&details=${encodeURIComponent(details)}`;

    window.open(calendarUrl, "_blank");
    toast.success("Opening Google Calendar...");
    setTimeout(() => setCalendarLoading(false), 1000);
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "users", getUserId(), "revisionTasks", id));
      toast.success("Task deleted");
      loadTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 overflow-x-hidden">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#30363d]/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="text-blue-400 w-6 h-6" />
            Revision Planner
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Build your algorithm retention by scheduling weekly problem reviews and tracking your practice habits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto text-xs bg-[#161b22] border border-[#30363d] px-3.5 py-1.5 rounded-xl">
          <span className="text-gray-400">Today:</span>
          <span className="text-white font-semibold">{today}</span>
        </div>
      </div>

      {/* ================= SCHEDULING FORM CARD ================= */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="text-blue-400" size={18} />
          Schedule a Problem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Question Number & Fetch */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              LeetCode Problem #
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="e.g. 15 for 3Sum"
                value={questionNumber}
                onChange={(e) => setQuestionNumber(e.target.value)}
                className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-gray-400 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                type="button"
                onClick={fetchQuestion}
                disabled={fetchLoading}
                className="px-3.5 py-2 rounded-xl border border-[#30363d] bg-[#21262d] hover:bg-[#161b22] text-gray-200 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Search size={13} />
                <span>{fetchLoading ? "Finding..." : "Fetch"}</span>
              </button>
            </div>

            {questionTitle && (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-blue-300 flex items-center gap-2 mt-2">
                <SiLeetcode className="text-[#ffa116] shrink-0" size={14} />
                <span className="font-medium truncate">{questionTitle}</span>
              </div>
            )}
          </div>

          {/* Email input */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Reminder Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-500" size={15} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-gray-400 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Days of Week Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-300 flex items-center justify-between mb-2">
            <span>Repeat on Days</span>
            <span className="text-[11px] text-gray-500">
              {weekdays.length} selected
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const isSelected = weekdays.includes(day);
              const isDayToday = day === today;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition cursor-pointer border flex items-center justify-between ${
                    isSelected
                      ? "bg-[#2d333b] hover:bg-[#21262d] text-white border-gray-500 shadow-sm"
                      : "bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white"
                  }`}
                >
                  <span>{day.substring(0, 3)}</span>
                  {isSelected ? (
                    <Check size={12} className="stroke-[3] text-emerald-400" />
                  ) : isDayToday ? (
                    <span className="text-[10px] text-blue-400 font-bold">•</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* BUTTONS: GREY WITHOUT HOVER, DARK GREY ON HOVER (NO BLUE) */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#30363d]/80">
          <button
            type="button"
            onClick={addRevisionTask}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 bg-[#21262d] hover:bg-[#161b22] text-gray-200 hover:text-white border border-[#30363d] hover:border-gray-500 font-medium px-5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Plus size={15} />
            <span>{loading ? "Scheduling..." : "Schedule Revision"}</span>
          </button>

          <button
            type="button"
            onClick={addToCalendar}
            disabled={calendarLoading}
            className="flex items-center justify-center gap-1.5 bg-[#0d1117] hover:bg-[#161b22] text-gray-300 hover:text-white border border-[#30363d] hover:border-gray-500 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            <span>{calendarLoading ? "Opening..." : "Add to Google Calendar ↗"}</span>
          </button>
        </div>
      </div>

      {/* ================= WEEKLY REVISION TRACKER ================= */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={18} />
            Weekly Practice Tracker
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Mark off questions as you review them each day.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-[#0d1117] rounded-xl border border-dashed border-[#30363d]">
            <p className="text-xs sm:text-sm text-gray-400">
              No problems scheduled yet. Add one above to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#21262d] border border-[#30363d] text-blue-400 font-mono font-bold text-xs rounded-md">
                      #{task.questionNumber}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate max-w-md">
                      {task.questionTitle}
                    </h3>
                  </div>

                  <a
                    href={`https://leetcode.com/problemset/all/?search=${task.questionNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline self-start sm:self-auto"
                  >
                    <span>Solve on LeetCode</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                {/* Weekday check boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const isAssigned = task.weekdays.includes(day);
                    const key = `${task.id}-${day}`;
                    const isCompleted = revisionStatus[key] === "Completed";
                    const isDayToday = day === today;

                    return (
                      <div
                        key={day}
                        className={`p-2 rounded-lg border text-xs flex flex-col justify-between gap-1 transition ${
                          !isAssigned
                            ? "bg-[#161b22]/30 border-transparent text-gray-600 opacity-50"
                            : isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : isDayToday
                            ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                            : "bg-[#161b22] border-[#30363d] text-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[11px]">{day.substring(0, 3)}</span>
                          {isAssigned && (
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => {
                                setRevisionStatus((prev) => ({
                                  ...prev,
                                  [key]: isCompleted ? "Pending" : "Completed",
                                }));
                              }}
                              className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          )}
                        </div>

                        <span className="text-[10px] font-medium">
                          {!isAssigned
                            ? "—"
                            : isCompleted
                            ? "Done ✓"
                            : isDayToday
                            ? "Today"
                            : "Scheduled"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SCHEDULES TABLE ================= */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white">
          Active Reminders
        </h2>

        {tasks.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-[#30363d]">
            <table className="min-w-[620px] w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0d1117] text-gray-400 font-semibold border-b border-[#30363d]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Alert</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#21262d]/40 transition">
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <span className="text-blue-400 font-mono font-semibold">#{task.questionNumber}</span>
                        <span className="truncate max-w-[220px]">{task.questionTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {task.weekdays?.map((d) => (
                          <span
                            key={d}
                            className="bg-[#0d1117] border border-[#30363d] px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {d.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                      {task.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          task.emailStatus === "Delivered" || task.emailStatus === "Success"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : task.emailStatus === "Failed"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {task.emailStatus || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
