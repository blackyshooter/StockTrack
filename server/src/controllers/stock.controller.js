const prisma = require("../config/prisma");
const {
  getStockResumeByItem,
  getGeneralStock,
} = require("../services/stock.service");

const registerStockIn = async (req, res) => {
  try {
    const { itemId, quantity, reference, observation } = req.body;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.active) {
      return res.status(400).json({
        message: "El artículo no existe o está inactivo",
      });
    }

    const movement = await prisma.stockMovement.create({
      data: {
        itemId,
        movementType: "INGRESO",
        quantity,
        reference,
        observation,
        userId: req.user?.id,
      },
      include: {
        item: true,
        user: true,
      },
    });

    const stock = await getStockResumeByItem(itemId);

    return res.status(201).json({
      message: "Ingreso de stock registrado correctamente",
      data: movement,
      stock,
    });
  } catch (error) {
    console.error("Error al registrar ingreso de stock:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const assignStockToBranch = async (req, res) => {
  try {
    const { itemId, branchId, quantity, observation } = req.body;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.active) {
      return res.status(400).json({
        message: "El artículo no existe o está inactivo",
      });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || !branch.active) {
      return res.status(400).json({
        message: "La sucursal no existe o está inactiva",
      });
    }

    const stock = await getStockResumeByItem(itemId);

    if (stock.availableStock < quantity) {
      return res.status(400).json({
        message: "Stock disponible insuficiente",
        stock,
      });
    }

    const assignment = await prisma.branchAssignment.create({
      data: {
        itemId,
        branchId,
        quantity,
        status: "RESERVADO",
        observation,
        userId: req.user?.id,
      },
      include: {
        item: true,
        branch: true,
        user: true,
      },
    });

    await prisma.stockMovement.create({
      data: {
        itemId,
        branchId,
        movementType: "ASIGNACION",
        quantity,
        reference: `Asignación a sucursal ${branch.code}`,
        observation,
        userId: req.user?.id,
      },
    });

    const updatedStock = await getStockResumeByItem(itemId);

    return res.status(201).json({
      message: "Stock asignado correctamente a la sucursal",
      data: assignment,
      stock: updatedStock,
    });
  } catch (error) {
    console.error("Error al asignar stock:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const releaseAssignment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { observation } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const assignment = await prisma.branchAssignment.findUnique({
      where: { id },
      include: {
        item: true,
        branch: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Asignación no encontrada",
      });
    }

    if (!["RESERVADO", "ENVIADO"].includes(assignment.status)) {
      return res.status(400).json({
        message: "La asignación ya no se encuentra activa",
      });
    }

    const updatedAssignment = await prisma.branchAssignment.update({
      where: { id },
      data: {
        status: "LIBERADO",
        observation: observation || assignment.observation,
      },
      include: {
        item: true,
        branch: true,
        user: true,
      },
    });

    await prisma.stockMovement.create({
      data: {
        itemId: assignment.itemId,
        branchId: assignment.branchId,
        movementType: "LIBERACION",
        quantity: assignment.quantity,
        reference: `Liberación de asignación ${assignment.id}`,
        observation,
        userId: req.user?.id,
      },
    });

    const stock = await getStockResumeByItem(assignment.itemId);

    return res.json({
      message: "Asignación liberada correctamente",
      data: updatedAssignment,
      stock,
    });
  } catch (error) {
    console.error("Error al liberar asignación:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getStockByItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);

    if (Number.isNaN(itemId)) {
      return res.status(400).json({
        message: "ID de artículo inválido",
      });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        message: "Artículo no encontrado",
      });
    }

    const stock = await getStockResumeByItem(itemId);

    return res.json({
      item,
      stock,
    });
  } catch (error) {
    console.error("Error al consultar stock:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    const { branchId, itemId, status } = req.query;

    const where = {};

    if (branchId) {
      where.branchId = Number(branchId);
    }

    if (itemId) {
      where.itemId = Number(itemId);
    }

    if (status) {
      where.status = status;
    }

    const assignments = await prisma.branchAssignment.findMany({
      where,
      include: {
        item: true,
        branch: true,
        user: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.json(assignments);
  } catch (error) {
    console.error("Error al listar asignaciones:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getMovements = async (req, res) => {
  try {
    const { branchId, itemId, type } = req.query;

    const where = {};

    if (branchId) {
      where.branchId = Number(branchId);
    }

    if (itemId) {
      where.itemId = Number(itemId);
    }

    if (type) {
      where.movementType = type;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        item: true,
        branch: true,
        user: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.json(movements);
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getStockGeneral = async (req, res) => {
  try {
    const stock = await getGeneralStock();

    return res.json(stock);
  } catch (error) {
    console.error("Error al consultar stock general:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  registerStockIn,
  assignStockToBranch,
  releaseAssignment,
  getStockByItem,
  getStockGeneral,
  getAssignments,
  getMovements,
};