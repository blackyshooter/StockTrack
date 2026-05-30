const prisma = require("../config/prisma");

const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.json(branches);
  } catch (error) {
    console.error("Error al listar sucursales:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    return res.json(branch);
  } catch (error) {
    console.error("Error al obtener sucursal:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const createBranch = async (req, res) => {
  try {
    const { code, name, status } = req.body;

    const branch = await prisma.branch.create({
      data: {
        code,
        name,
        status,
      },
    });

    return res.status(201).json({
      message: "Sucursal creada correctamente",
      data: branch,
    });
  } catch (error) {
    console.error("Error al crear sucursal:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una sucursal con ese código",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const updateBranch = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      message: "Sucursal actualizada correctamente",
      data: branch,
    });
  } catch (error) {
    console.error("Error al actualizar sucursal:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una sucursal con ese código",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.json({
      message: "Sucursal desactivada correctamente",
      data: branch,
    });
  } catch (error) {
    console.error("Error al desactivar sucursal:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};