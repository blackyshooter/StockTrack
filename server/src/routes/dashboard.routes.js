const express = require("express");

const {
  getDashboardSummary,
} = require("../controllers/dashboard.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/summary", authMiddleware, getDashboardSummary);

module.exports = router;