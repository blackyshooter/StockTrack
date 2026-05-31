import { useEffect, useState } from "react";
import api from "../../api/axios";
import { showConfirm, showSuccess, showError } from "../../utils/alerts";

const initialStockInForm = {
  itemId: "",
  quantity: 1,
  reference: "",
  observation: "",
};

const initialAssignForm = {
  itemId: "",
  branchId: "",
  quantity: 1,
  observation: "",
};

const StockPage = () => {
  const [stock, setStock] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [stockInForm, setStockInForm] = useState(initialStockInForm);
  const [assignForm, setAssignForm] = useState(initialAssignForm);

  const [loading, setLoading] = useState(true);
  const [savingStockIn, setSavingStockIn] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [stockResponse, itemsResponse, branchesResponse, assignmentsResponse] =
        await Promise.all([
          api.get("/stock"),
          api.get("/items"),
          api.get("/branches"),
          api.get("/stock/assignments"),
        ]);

      setStock(stockResponse.data);
      setItems(itemsResponse.data.filter((item) => item.active));
      setBranches(branchesResponse.data.filter((branch) => branch.active));
      setAssignments(assignmentsResponse.data);
    } catch (err) {
      console.error("Error cargando stock:", err);
      setError(err.response?.data?.message || "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockInChange = (e) => {
    const { name, value } = e.target;

    setStockInForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;

    setAssignForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleStockInSubmit = async (e) => {
  e.preventDefault();

  try {
    setSavingStockIn(true);
    setError("");
    setSuccess("");

    const selectedItem = items.find(
      (item) => item.id === Number(stockInForm.itemId)
    );

    const payload = {
      itemId: Number(stockInForm.itemId),
      quantity: Number(stockInForm.quantity),
      reference: stockInForm.reference?.trim() || null,
      observation: stockInForm.observation?.trim() || null,
    };

    const result = await showConfirm({
      title: "¿Registrar ingreso de stock?",
      text: `Se ingresarán ${payload.quantity} unidad/es del artículo ${selectedItem?.name || "seleccionado"}.`,
      confirmButtonText: "Sí, registrar ingreso",
    });

    if (!result.isConfirmed) {
      setSavingStockIn(false);
      return;
    }

    await api.post("/stock/in", payload);

    setStockInForm(initialStockInForm);
    setSuccess("Ingreso de stock registrado correctamente");
    showSuccess(
      `Ingreso de ${payload.quantity} unidad/es del artículo ${selectedItem?.name || "seleccionado"} registrado correctamente`
    );

    await loadData();
  } catch (err) {
    console.error("Error registrando ingreso:", err);

    const message =
      err.response?.data?.message || "No se pudo registrar el ingreso";

    setError(message);
    showError(message);
  } finally {
    setSavingStockIn(false);
  }
};

const handleAssignSubmit = async (e) => {
  e.preventDefault();

  try {
    setSavingAssign(true);
    setError("");
    setSuccess("");

    const selectedItem = items.find(
      (item) => item.id === Number(assignForm.itemId)
    );

    const selectedBranch = branches.find(
      (branch) => branch.id === Number(assignForm.branchId)
    );

    const availableStock = getAvailableStock(assignForm.itemId);

    const payload = {
      itemId: Number(assignForm.itemId),
      branchId: Number(assignForm.branchId),
      quantity: Number(assignForm.quantity),
      observation: assignForm.observation?.trim() || null,
    };

    const result = await showConfirm({
      title: "¿Asignar stock a sucursal?",
      text: `Se asignarán ${payload.quantity} unidad/es de ${selectedItem?.name || "artículo seleccionado"} a ${selectedBranch?.name || "sucursal seleccionada"}. Stock disponible actual: ${availableStock}.`,
      confirmButtonText: "Sí, asignar stock",
    });

    if (!result.isConfirmed) {
      setSavingAssign(false);
      return;
    }

    await api.post("/stock/assign", payload);

    setAssignForm(initialAssignForm);
    setSuccess("Stock asignado correctamente");
    showSuccess(
      `Se asignaron ${payload.quantity} unidad/es de ${selectedItem?.name || "artículo seleccionado"} a ${selectedBranch?.name || "la sucursal seleccionada"}`
    );

    await loadData();
  } catch (err) {
    console.error("Error asignando stock:", err);

    const message =
      err.response?.data?.message || "No se pudo asignar el stock";

    setError(message);
    showError(message);
  } finally {
    setSavingAssign(false);
  }
};

const handleRelease = async (assignment) => {
  const result = await showConfirm({
    title: "¿Liberar asignación?",
    text: `Se liberarán ${assignment.quantity} unidad/es de ${assignment.item?.name} asignadas a ${assignment.branch?.name}.`,
    confirmButtonText: "Sí, liberar",
    icon: "warning",
  });

  if (!result.isConfirmed) return;

  try {
    setError("");
    setSuccess("");

    await api.post(`/stock/assignments/${assignment.id}/release`, {
      observation: "Liberado desde pantalla de stock",
    });

    setSuccess("Asignación liberada correctamente");
    showSuccess("La asignación fue liberada correctamente");

    await loadData();
  } catch (err) {
    console.error("Error liberando asignación:", err);

    const message =
      err.response?.data?.message || "No se pudo liberar la asignación";

    setError(message);
    showError(message);
  }
};


  const getAvailableStock = (itemId) => {
    const found = stock.find((row) => row.id === Number(itemId));
    return found?.stock?.availableStock ?? 0;
  };

  const activeAssignments = assignments.filter((assignment) =>
    ["RESERVADO", "ENVIADO"].includes(assignment.status)
  );

  if (loading) {
    return <p>Cargando stock...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Stock</h1>
          <p>Ingreso, disponibilidad y asignación de artículos a sucursales.</p>
        </div>

        <button className="secondary-button" onClick={loadData}>
          Actualizar
        </button>
      </div>

      {error && <div className="error-box page-message">{error}</div>}
      {success && <div className="success-box page-message">{success}</div>}

      <div className="two-column-grid">
        <div className="form-card">
          <div className="card-header">
            <h2>Registrar ingreso</h2>
            <p>Cargá nuevas cantidades disponibles para un artículo.</p>
          </div>

          <form onSubmit={handleStockInSubmit} className="stack-form">
            <div className="form-group">
              <label>Artículo</label>
              <select
                name="itemId"
                value={stockInForm.itemId}
                onChange={handleStockInChange}
                required
              >
                <option value="">Seleccionar artículo</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                name="quantity"
                value={stockInForm.quantity}
                onChange={handleStockInChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Referencia</label>
              <input
                name="reference"
                value={stockInForm.reference}
                onChange={handleStockInChange}
                placeholder="Ej: Compra inicial / Factura / Pedido"
              />
            </div>

            <div className="form-group">
              <label>Observación</label>
              <textarea
                name="observation"
                value={stockInForm.observation}
                onChange={handleStockInChange}
                rows="3"
                placeholder="Detalle opcional del ingreso"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={savingStockIn}>
                {savingStockIn ? "Registrando..." : "Registrar ingreso"}
              </button>
            </div>
          </form>
        </div>

        <div className="form-card">
          <div className="card-header">
            <h2>Asignar a sucursal</h2>
            <p>Reservá stock disponible para una sucursal específica.</p>
          </div>

          <form onSubmit={handleAssignSubmit} className="stack-form">
            <div className="form-group">
              <label>Artículo</label>
              <select
                name="itemId"
                value={assignForm.itemId}
                onChange={handleAssignChange}
                required
              >
                <option value="">Seleccionar artículo</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>

              {assignForm.itemId && (
                <small className="helper-text">
                  Disponible: {getAvailableStock(assignForm.itemId)}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Sucursal</label>
              <select
                name="branchId"
                value={assignForm.branchId}
                onChange={handleAssignChange}
                required
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                name="quantity"
                value={assignForm.quantity}
                onChange={handleAssignChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Observación</label>
              <textarea
                name="observation"
                value={assignForm.observation}
                onChange={handleAssignChange}
                rows="3"
                placeholder="Ej: Reservado para apertura"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={savingAssign}>
                {savingAssign ? "Asignando..." : "Asignar stock"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Stock general</h2>
          <p>Resumen por artículo: total, asignado y disponible.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Artículo</th>
                <th>Categoría</th>
                <th>Total</th>
                <th>Asignado</th>
                <th>Disponible</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {stock.length > 0 ? (
                stock.map((row) => (
                  <tr key={row.id}>
                    <td>{row.code}</td>
                    <td>
                      <strong>{row.name}</strong>
                      <br />
                      <small>{row.description || "Sin descripción"}</small>
                    </td>
                    <td>{row.category?.name || "-"}</td>
                    <td>{row.stock.totalStock}</td>
                    <td>{row.stock.assignedStock}</td>
                    <td>
                      <strong>{row.stock.availableStock}</strong>
                    </td>
                    <td>{row.minStock}</td>
                    <td>
                      {row.lowStock ? (
                        <span className="status-pill paused">Bajo stock</span>
                      ) : (
                        <span className="status-pill active">OK</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No hay stock registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Asignaciones activas</h2>
          <p>Stock actualmente comprometido para sucursales.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Sucursal</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {activeAssignments.length > 0 ? (
                activeAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.item?.name || "-"}</td>
                    <td>{assignment.branch?.name || "-"}</td>
                    <td>{assignment.quantity}</td>
                    <td>
                      <span className="status-pill planned">{assignment.status}</span>
                    </td>
                    <td>{assignment.user?.name || "-"}</td>
                    <td>{formatDatePY(assignment.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="danger-light"
                          onClick={() => handleRelease(assignment)}
                        >
                          Liberar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No hay asignaciones activas.
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

const formatDatePY = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("es-PY", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default StockPage;