const prisma = require("../config/prisma");

const getStockResumeByItem = async (itemId) => {
  const movements = await prisma.stockMovement.groupBy({
    by: ["movementType"],
    where: {
      itemId,
    },
    _sum: {
      quantity: true,
    },
  });

  const totalIn =
    movements.find((m) => m.movementType === "INGRESO")?._sum.quantity || 0;

  const totalOut =
    movements.find((m) => m.movementType === "SALIDA")?._sum.quantity || 0;

  const activeAssignments = await prisma.branchAssignment.aggregate({
    where: {
      itemId,
      status: {
        in: ["RESERVADO", "ENVIADO"],
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const assignedStock = activeAssignments._sum.quantity || 0;
  const totalStock = totalIn - totalOut;
  const availableStock = totalStock - assignedStock;

  return {
    totalStock,
    assignedStock,
    availableStock,
  };
};

const getGeneralStock = async () => {
  const items = await prisma.item.findMany({
    where: {
      active: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const result = [];

  for (const item of items) {
    const stock = await getStockResumeByItem(item.id);

    result.push({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      minStock: item.minStock,
      active: item.active,
      category: item.category,
      stock,
      lowStock: stock.availableStock <= item.minStock,
    });
  }

  return result;
};

module.exports = {
  getStockResumeByItem,
  getGeneralStock,
};