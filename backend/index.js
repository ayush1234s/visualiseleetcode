// 🔥 Load environment variables
require("dotenv").config();

// 🔔 Start Reminder Scheduler (Cron Job)
require("./reminderScheduler");

const express = require("express");
const cors = require("cors");

const leetcodeRoutes = require("./routes/leetcodeRoutes");
const codeforcesRoutes = require("./routes/codeforcesRoutes");
const contestRoutes = require("./routes/contestRoutes");
const visualizeRoutes = require("./routes/visualizeRoutes");
const emailRoutes = require("./routes/emailRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* ================= PORT ================= */
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
// ✅ CORS (Allow all Vercel deployments and localhost)
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin === "https://visualiseleetcode.vercel.app"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json({ limit: "12mb" }));

/* ================= ROUTES ================= */
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/visualize", visualizeRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);

/* ================= ROOT ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 Visualize Leetcode Backend is Live!");
});

/* ================= HEALTH CHECK ================= */
app.get("/test", (req, res) => {
  res.send("Backend running ✅");
});

/* ================= SERVER START ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
