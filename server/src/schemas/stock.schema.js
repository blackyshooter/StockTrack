const { z } = require("zod");

const stockInSchema = z.object({
  itemId: z
    .number({
      required_error: "El artículo es obligatorio",
      invalid_type_error: "El artículo debe ser numérico",
    })
    .int()
    .positive("El artículo debe ser válido"),

  quantity: z
    .number({
      required_error: "La cantidad es obligatoria",
      invalid_type_error: "La cantidad debe ser numérica",
    })
    .int("La cantidad debe ser entera")
    .positive("La cantidad debe ser mayor a cero"),

  reference: z
    .string()
    .max(150, "La referencia no puede superar 150 caracteres")
    .optional()
    .nullable(),

  observation: z
    .string()
    .optional()
    .nullable(),
});

const assignStockSchema = z.object({
  itemId: z
    .number({
      required_error: "El artículo es obligatorio",
      invalid_type_error: "El artículo debe ser numérico",
    })
    .int()
    .positive("El artículo debe ser válido"),

  branchId: z
    .number({
      required_error: "La sucursal es obligatoria",
      invalid_type_error: "La sucursal debe ser numérica",
    })
    .int()
    .positive("La sucursal debe ser válida"),

  quantity: z
    .number({
      required_error: "La cantidad es obligatoria",
      invalid_type_error: "La cantidad debe ser numérica",
    })
    .int("La cantidad debe ser entera")
    .positive("La cantidad debe ser mayor a cero"),

  observation: z
    .string()
    .optional()
    .nullable(),
});

const releaseAssignmentSchema = z.object({
  observation: z
    .string()
    .optional()
    .nullable(),
});

module.exports = {
  stockInSchema,
  assignStockSchema,
  releaseAssignmentSchema,
};