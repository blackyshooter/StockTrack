import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showConfirm, showSuccess, showError } from "../../utils/alerts";

const initialForm = {
  code: "",
  name: "",
  status: "PLANIFICADA",
  active: true,
};

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/branches");
      setBranches(response.data);
    } catch (err) {
      console.error("Error cargando sucursales:", err);
      setError(err.response?.data?.message || "No se pudieron cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
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

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      code: branch.code || "",
      name: branch.name || "",
      status: branch.status || "PLANIFICADA",
      active: branch.active,
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
      status: form.status,
      active: Boolean(form.active),
    };

    const result = await showConfirm({
      title: editingId ? "¿Actualizar sucursal?" : "¿Crear sucursal?",
      text: editingId
        ? `Se actualizará la sucursal ${payload.name}. Estado: ${payload.status}.`
        : `Se creará la sucursal ${payload.name}. Código: ${payload.code}. Estado: ${payload.status}.`,
      confirmButtonText: editingId ? "Sí, actualizar" : "Sí, crear",
    });

    if (!result.isConfirmed) {
      setSaving(false);
      return;
    }

    if (editingId) {
      await api.put(`/branches/${editingId}`, payload);
      setSuccess("Sucursal actualizada correctamente");
      showSuccess(`La sucursal ${payload.name} fue actualizada correctamente`);
    } else {
      await api.post("/branches", payload);
      setSuccess("Sucursal creada correctamente");
      showSuccess(`La sucursal ${payload.name} fue creada correctamente`);
    }

    resetForm();
    await loadBranches();
  } catch (err) {
    console.error("Error guardando sucursal:", err);

    const message =
      err.response?.data?.message || "No se pudo guardar la sucursal";

    setError(message);
    showError(message);
  } finally {
    setSaving(false);
  }
};

const handleToggleActive = async (branch) => {
  const result = await showConfirm({
    title: branch.active ? "¿Desactivar sucursal?" : "¿Reactivar sucursal?",
    text: branch.active
      ? `La sucursal ${branch.name} quedará inactiva para nuevas asignaciones.`
      : `La sucursal ${branch.name} volverá a estar disponible para nuevas asignaciones.`,
    confirmButtonText: branch.active ? "Sí, desactivar" : "Sí, reactivar",
    icon: "warning",
  });

  if (!result.isConfirmed) return;

  try {
    setError("");
    setSuccess("");

    await api.put(`/branches/${branch.id}`, {
      active: !branch.active,
    });

    const message = branch.active
      ? "Sucursal desactivada correctamente"
      : "Sucursal reactivada correctamente";

    setSuccess(message);
    showSuccess(message);

    await loadBranches();
  } catch (err) {
    console.error("Error cambiando estado:", err);

    const message =
      err.response?.data?.message || "No se pudo cambiar el estado";

    setError(message);
    showError(message);
  }
};

  if (loading) {
    return <p>Cargando sucursales...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Sucursales</h1>
          <p>Gestión de sucursales para asignación de artículos.</p>
        </div>

        <button className="secondary-button" onClick={loadBranches}>
          Actualizar
        </button>
      </div>

      <div className="form-card">
        <div className="card-header">
          <h2>{editingId ? "Editar sucursal" : "Nueva sucursal"}</h2>
          <p>
            Registrá sucursales planificadas, activas, pausadas o canceladas.
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
              placeholder="Ej: SUC-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Sucursal San Lorenzo"
              required
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="PLANIFICADA">Planificada</option>
              <option value="ACTIVA">Activa</option>
              <option value="PAUSADA">Pausada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          {editingId && (
            <label className="check-field">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Sucursal activa
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
                ? "Actualizar sucursal"
                : "Crear sucursal"}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Listado de sucursales</h2>
          <p>Sucursales registradas para seguimiento de asignaciones.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.code}</td>
                    <td>
                      <strong>{branch.name}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${getBranchStatusClass(branch.status)}`}>
                        {branch.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${branch.active ? "active" : "inactive"}`}>
                        {branch.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(branch)}>Editar</button>
                        <button
                          className={branch.active ? "danger-light" : "success-light"}
                          onClick={() => handleToggleActive(branch)}
                        >
                          {branch.active ? "Desactivar" : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No hay sucursales registradas.
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

const getBranchStatusClass = (status) => {
  const map = {
    PLANIFICADA: "planned",
    ACTIVA: "active",
    PAUSADA: "paused",
    CANCELADA: "inactive",
  };

  return map[status] || "";
};

export default BranchesPage;