const { z } = require("zod");

const branchStatusEnum = z.enum([
  "PLANIFICADA",
  "ACTIVA",
  "CANCELADA",
  "PAUSADA",
]);

const createBranchSchema = z.object({
  code: z
    .string()
    .min(1, "El código de sucursal es obligatorio")
    .max(50, "El código no puede superar 50 caracteres"),

  name: z
    .string()
    .min(1, "El nombre de la sucursal es obligatorio")
    .max(150, "El nombre no puede superar 150 caracteres"),

  status: branchStatusEnum.default("PLANIFICADA"),
});

const updateBranchSchema = z.object({
  code: z
    .string()
    .min(1, "El código de sucursal es obligatorio")
    .max(50, "El código no puede superar 50 caracteres")
    .optional(),

  name: z
    .string()
    .min(1, "El nombre de la sucursal es obligatorio")
    .max(150, "El nombre no puede superar 150 caracteres")
    .optional(),

  status: branchStatusEnum.optional(),

  active: z
    .boolean({
      invalid_type_error: "El estado activo debe ser verdadero o falso",
    })
    .optional(),
});

module.exports = {
  createBranchSchema,
  updateBranchSchema,
};