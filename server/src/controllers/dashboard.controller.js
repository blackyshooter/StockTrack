const prisma = require("../config/prisma");
const { getGeneralStock } = require("../services/stock.service");

const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalItems,
      activeItems,
      totalBranches,
      activeBranches,
      assignmentsByStatus,
      lastMovements,
      generalStock,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({
        where: {
          active: true,
        },
      }),
      prisma.branch.count(),
      prisma.branch.count({
        where: {
          active: true,
        },
      }),
      prisma.branchAssignment.groupBy({
        by: ["status"],
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.stockMovement.findMany({
        take: 8,
        include: {
          item: true,
          branch: true,
          user: true,
        },
        orderBy: {
          id: "desc",
        },
      }),
      getGeneralStock(),
    ]);

    const stockTotals = generalStock.reduce(
      (acc, item) => {
        acc.totalStock += item.stock.totalStock;
        acc.assignedStock += item.stock.assignedStock;
        acc.availableStock += item.stock.availableStock;

        if (item.lowStock) {
          acc.lowStockItems += 1;
        }

        return acc;
      },
      {
        totalStock: 0,
        assignedStock: 0,
        availableStock: 0,
        lowStockItems: 0,
      }
    );

    const activeAssignments = assignmentsByStatus
      .filter((assignment) =>
        ["RESERVADO", "ENVIADO"].includes(assignment.status)
      )
      .reduce((acc, assignment) => {
        acc.quantity += assignment._sum.quantity || 0;
        acc.count += assignment._count.id || 0;
        return acc;
      }, { quantity: 0, count: 0 });

    return res.json({
      items: {
        total: totalItems,
        active: activeItems,
      },
      branches: {
        total: totalBranches,
        active: activeBranches,
      },
      stock: stockTotals,
      assignments: {
        activeCount: activeAssignments.count,
        activeQuantity: activeAssignments.quantity,
        byStatus: assignmentsByStatus,
      },
      lastMovements,
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getDashboardSummary,
};