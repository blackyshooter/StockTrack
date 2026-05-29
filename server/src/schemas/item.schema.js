const { z } = require("zod");

const createItemSchema = z.object({
  code: z
    .string()
    .min(1, "El código es obligatorio")
    .max(50, "El código no puede superar 50 caracteres"),

  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar 150 caracteres"),

  description: z
    .string()
    .optional()
    .nullable(),

  categoryId: z
    .number({
      required_error: "La categoría es obligatoria",
      invalid_type_error: "La categoría debe ser numérica",
    })
    .int("La categoría debe ser un número entero")
    .positive("La categoría debe ser válida"),

  minStock: z
    .number({
      invalid_type_error: "El stock mínimo debe ser numérico",
    })
    .int("El stock mínimo debe ser entero")
    .min(0, "El stock mínimo no puede ser negativo")
    .default(0),
});

const updateItemSchema = z.object({
  code: z
    .string()
    .min(1, "El código es obligatorio")
    .max(50, "El código no puede superar 50 caracteres")
    .optional(),

  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar 150 caracteres")
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),

  categoryId: z
    .number({
      invalid_type_error: "La categoría debe ser numérica",
    })
    .int("La categoría debe ser un número entero")
    .positive("La categoría debe ser válida")
    .optional(),

  minStock: z
    .number({
      invalid_type_error: "El stock mínimo debe ser numérico",
    })
    .int("El stock mínimo debe ser entero")
    .min(0, "El stock mínimo no puede ser negativo")
    .optional(),

  active: z
    .boolean({
      invalid_type_error: "El estado activo debe ser verdadero o falso",
    })
    .optional(),
});

module.exports = {
  createItemSchema,
  updateItemSchema,
};