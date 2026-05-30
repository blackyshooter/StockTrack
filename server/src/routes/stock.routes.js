const express = require("express");

const {
  registerStockIn,
  assignStockToBranch,
  releaseAssignment,
  getStockByItem,
  getStockGeneral,
  getAssignments,
  getMovements,
} = require("../controllers/stock.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateSchema = require("../middlewares/validate.middleware");

const {
  stockInSchema,
  assignStockSchema,
  releaseAssignmentSchema,
} = require("../schemas/stock.schema");

const router = express.Router();

router.get("/", authMiddleware, getStockGeneral);

router.get("/item/:itemId", authMiddleware, getStockByItem);

router.get("/assignments", authMiddleware, getAssignments);

router.get("/movements", authMiddleware, getMovements);

router.post(
  "/in",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(stockInSchema),
  registerStockIn
);

router.post(
  "/assign",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(assignStockSchema),
  assignStockToBranch
);

router.post(
  "/assignments/:id/release",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(releaseAssignmentSchema),
  releaseAssignment
);

module.exports = router;