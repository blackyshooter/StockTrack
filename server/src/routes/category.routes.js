const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateSchema = require("../middlewares/validate.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../schemas/category.schema");

const router = express.Router();

router.get("/", authMiddleware, getCategories);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  validateSchema(createCategorySchema),
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  validateSchema(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteCategory
);

module.exports = router;