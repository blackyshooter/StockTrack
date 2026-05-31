import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showConfirm, showSuccess, showError } from "../../utils/alerts";

const initialForm = {
  code: "",
  name: "",
  description: "",
  categoryId: "",
  minStock: 0,
  active: true,
};

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get("/items"),
        api.get("/categories"),
      ]);

      setItems(itemsResponse.data);
      setCategories(categoriesResponse.data.filter((cat) => cat.active));
    } catch (err) {
      console.error("Error cargando artículos:", err);
      setError(err.response?.data?.message || "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      name: item.name || "",
      description: item.description || "",
      categoryId: item.categoryId || "",
      minStock: item.minStock || 0,
      active: item.active,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");

  try {
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || null,
      categoryId: Number(form.categoryId),
      minStock: Number(form.minStock),
      active: Boolean(form.active),
    };

    const categoryName =
      categories.find((cat) => cat.id === Number(form.categoryId))?.name || "Sin categoría";

    const result = await showConfirm({
      title: editingId ? "¿Actualizar artículo?" : "¿Crear artículo?",
      text: editingId
        ? `Se actualizará el artículo ${payload.name}. Categoría: ${categoryName}. Stock mínimo: ${payload.minStock}.`
        : `Se creará el artículo ${payload.name}. Código: ${payload.code}. Categoría: ${categoryName}. Stock mínimo: ${payload.minStock}.`,
      confirmButtonText: editingId ? "Sí, actualizar" : "Sí, crear",
    });

    if (!result.isConfirmed) {
      setSaving(false);
      return;
    }

    if (editingId) {
      await api.put(`/items/${editingId}`, payload);
      setSuccess("Artículo actualizado correctamente");
      showSuccess(`El artículo ${payload.name} fue actualizado correctamente`);
    } else {
      await api.post("/items", payload);
      setSuccess("Artículo creado correctamente");
      showSuccess(`El artículo ${payload.name} fue creado correctamente`);
    }

    resetForm();
    await loadData();
  } catch (err) {
    console.error("Error guardando artículo:", err);

    const message =
      err.response?.data?.message || "No se pudo guardar el artículo";

    setError(message);
    showError(message);
  } finally {
    setSaving(false);
  }
};

const handleToggleActive = async (item) => {
  const result = await showConfirm({
    title: item.active ? "¿Desactivar artículo?" : "¿Reactivar artículo?",
    text: item.active
      ? `El artículo ${item.name} quedará inactivo y no podrá usarse en nuevas operaciones.`
      : `El artículo ${item.name} volverá a estar disponible para nuevas operaciones.`,
    confirmButtonText: item.active ? "Sí, desactivar" : "Sí, reactivar",
    icon: "warning",
  });

  if (!result.isConfirmed) return;

  try {
    setError("");
    setSuccess("");

    await api.put(`/items/${item.id}`, {
      active: !item.active,
    });

    const message = item.active
      ? "Artículo desactivado correctamente"
      : "Artículo reactivado correctamente";

    setSuccess(message);
    showSuccess(message);

    await loadData();
  } catch (err) {
    console.error("Error cambiando estado:", err);

    const message =
      err.response?.data?.message || "No se pudo cambiar el estado";

    setError(message);
    showError(message);
  }
};

  if (loading) {
    return <p>Cargando artículos...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Artículos</h1>
          <p>Gestión de artículos tecnológicos para sucursales.</p>
        </div>

        <button className="secondary-button" onClick={loadData}>
          Actualizar
        </button>
      </div>

      <div className="form-card">
        <div className="card-header">
          <h2>{editingId ? "Editar artículo" : "Nuevo artículo"}</h2>
          <p>
            Registrá routers, switches, impresoras, UPS, periféricos u otros
            artículos.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit} className="grid-form">
          <div className="form-group">
            <label>Código</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Ej: RTR-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Router MikroTik"
              required
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Stock mínimo</label>
            <input
              name="minStock"
              type="number"
              min="0"
              value={form.minStock}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción breve del artículo"
              rows="3"
            />
          </div>

          {editingId && (
            <label className="check-field">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Artículo activo
            </label>
          )}

          <div className="form-actions">
            {editingId && (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancelar
              </button>
            )}

            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Guardando..."
                : editingId
                ? "Actualizar artículo"
                : "Crear artículo"}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Listado de artículos</h2>
          <p>Artículos activos e inactivos registrados en el sistema.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <small>{item.description || "Sin descripción"}</small>
                    </td>
                    <td>{item.category?.name || "-"}</td>
                    <td>{item.minStock}</td>
                    <td>
                      <span className={`status-pill ${item.active ? "active" : "inactive"}`}>
                        {item.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(item)}>Editar</button>
                        <button
                          className={item.active ? "danger-light" : "success-light"}
                          onClick={() => handleToggleActive(item)}
                        >
                          {item.active ? "Desactivar" : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No hay artículos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ItemsPage;