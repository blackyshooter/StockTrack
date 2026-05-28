const express = require("express");
const { login } = require("../controllers/auth.controller");
const validateSchema = require("../middlewares/validate.middleware");
const { loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/login", validateSchema(loginSchema), login);

module.exports = router;