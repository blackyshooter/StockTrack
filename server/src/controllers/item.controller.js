const prisma = require("../config/prisma");

const getItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        category: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json(items);
  } catch (error) {
    console.error("Error al listar artículos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getItemById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    return res.json(item);
  } catch (error) {
    console.error("Error al obtener artículo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const createItem = async (req, res) => {
  try {
    const { code, name, description, categoryId, minStock } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.active) {
      return res.status(400).json({
        message: "La categoría seleccionada no existe o está inactiva",
      });
    }

    const item = await prisma.item.create({
      data: {
        code,
        name,
        description,
        categoryId,
        minStock,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      message: "Artículo creado correctamente",
      data: item,
    });
  } catch (error) {
    console.error("Error al crear artículo:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe un artículo con ese código",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const updateItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: req.body.categoryId },
      });

      if (!category || !category.active) {
        return res.status(400).json({
          message: "La categoría seleccionada no existe o está inactiva",
        });
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
      },
    });

    return res.json({
      message: "Artículo actualizado correctamente",
      data: item,
    });
  } catch (error) {
    console.error("Error al actualizar artículo:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe un artículo con ese código",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.json({
      message: "Artículo desactivado correctamente",
      data: item,
    });
  } catch (error) {
    console.error("Error al desactivar artículo:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};