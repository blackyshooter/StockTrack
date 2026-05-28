const prisma = require("../config/prisma");

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.json(categories);
  } catch (error) {
    console.error("Error al listar categorías:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      message: "Categoría creada correctamente",
      data: category,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      message: "Categoría actualizada correctamente",
      data: category,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.json({
      message: "Categoría desactivada correctamente",
      data: category,
    });
  } catch (error) {
    console.error("Error al desactivar categoría:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};