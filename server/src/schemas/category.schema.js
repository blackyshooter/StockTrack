const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar 100 caracteres"),

  description: z
    .string()
    .max(255, "La descripción no puede superar 255 caracteres")
    .optional()
    .nullable(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};