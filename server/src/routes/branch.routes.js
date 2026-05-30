const express = require("express");

const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branch.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateSchema = require("../middlewares/validate.middleware");

const {
  createBranchSchema,
  updateBranchSchema,
} = require("../schemas/branch.schema");

const router = express.Router();

router.get("/", authMiddleware, getBranches);

router.get("/:id", authMiddleware, getBranchById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(createBranchSchema),
  createBranch
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(updateBranchSchema),
  updateBranch
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteBranch
);

module.exports = router;