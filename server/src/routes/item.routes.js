const express = require("express");

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/item.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validateSchema = require("../middlewares/validate.middleware");

const {
  createItemSchema,
  updateItemSchema,
} = require("../schemas/item.schema");

const router = express.Router();

router.get("/", authMiddleware, getItems);

router.get("/:id", authMiddleware, getItemById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(createItemSchema),
  createItem
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "OPERADOR"),
  validateSchema(updateItemSchema),
  updateItem
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteItem
);

module.exports = router;