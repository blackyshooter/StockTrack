const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

module.exports = {
  loginSchema,
};