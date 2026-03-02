// 🔥 Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const leetcodeRoutes = require("./routes/leetcodeRoutes");
const codeforcesRoutes = require("./routes/codeforcesRoutes");
const contestRoutes = require("./routes/contestRoutes");
const visualizeRoutes = require("./routes/visualizeRoutes");


const app = express();

// ✅ Use PORT from .env
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/visualize", visualizeRoutes);

app.get("/test", (req, res) => {
  res.send("Backend running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});