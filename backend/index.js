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

const app = express();

/* ================= PORT ================= */

const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */

// ✅ CORS (Allow frontend access)
app.use(
  cors({
    origin: "*", // 🔥 change to Vercel URL later
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/visualize", visualizeRoutes);
app.use("/api/email", emailRoutes);

/* ================= ROOT ROUTE (IMPORTANT) ================= */

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