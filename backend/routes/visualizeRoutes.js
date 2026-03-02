const express = require("express");
const router = express.Router();

const { visualizeQuestion } = require("../controllers/visualizeController");

// 🔹 POST route
router.post("/", visualizeQuestion);

// 🔹 TEMP TEST GET route (to verify mount)
router.get("/ping", (req, res) => {
  res.send("Visualize route working ✅");
});

module.exports = router;