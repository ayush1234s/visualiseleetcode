const express = require("express");
const router = express.Router();

const { getAllContests } = require("../controllers/contestController");

router.get("/", getAllContests);

module.exports = router;