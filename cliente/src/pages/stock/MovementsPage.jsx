import { useEffect, useState } from "react";
import api from "../../api/axios";

const initialFilters = {
  itemId: "",
  branchId: "",
  type: "",
};

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.itemId) params.itemId = filters.itemId;
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.type) params.type = filters.type;

      const [movementsResponse, itemsResponse, branchesResponse] =
        await Promise.all([
          api.get("/stock/movements", { params }),
          api.get("/items"),
          api.get("/branches"),
        ]);

      setMovements(movementsResponse.data);
      setItems(itemsResponse.data);
      setBranches(branchesResponse.data);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
      setError(
        err.response?.data?.message || "No se pudieron cargar los movimientos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const clearFilters = async () => {
    setFilters(initialFilters);

    try {
      setLoading(true);
      setError("");

      const [movementsResponse, itemsResponse, branchesResponse] =
        await Promise.all([
          api.get("/stock/movements"),
          api.get("/items"),
          api.get("/branches"),
        ]);

      setMovements(movementsResponse.data);
      setItems(itemsResponse.data);
      setBranches(branchesResponse.data);
    } catch (err) {
      console.error("Error limpiando filtros:", err);
      setError("No se pudieron limpiar los filtros");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando movimientos...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Movimientos</h1>
          <p>Historial de ingresos, asignaciones y liberaciones de stock.</p>
        </div>

        <button className="secondary-button" onClick={loadData}>
          Actualizar
        </button>
      </div>

      {error && <div className="error-box page-message">{error}</div>}

      <div className="form-card">
        <div className="card-header">
          <h2>Filtros</h2>
          <p>Buscá movimientos por artículo, sucursal o tipo de operación.</p>
        </div>

        <form onSubmit={handleSearch} className="filters-grid">
          <div className="form-group">
            <label>Artículo</label>
            <select
              name="itemId"
              value={filters.itemId}
              onChange={handleFilterChange}
            >
              <option value="">Todos los artículos</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sucursal</label>
            <select
              name="branchId"
              value={filters.branchId}
              onChange={handleFilterChange}
            >
              <option value="">Todas las sucursales</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Todos los tipos</option>
              <option value="INGRESO">Ingreso</option>
              <option value="ASIGNACION">Asignación</option>
              <option value="LIBERACION">Liberación</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="button" className="secondary-button" onClick={clearFilters}>
              Limpiar
            </button>

            <button type="submit" className="primary-button">
              Buscar
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Historial de movimientos</h2>
          <p>{movements.length} movimiento/s encontrado/s.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Artículo</th>
                <th>Sucursal</th>
                <th>Cantidad</th>
                <th>Referencia</th>
                <th>Observación</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movements.length > 0 ? (
                movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <span className={`badge ${movement.movementType?.toLowerCase()}`}>
                        {movement.movementType}
                      </span>
                    </td>
                    <td>
                      <strong>{movement.item?.name || "-"}</strong>
                      <br />
                      <small>{movement.item?.code || ""}</small>
                    </td>
                    <td>{movement.branch?.name || "-"}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.reference || "-"}</td>
                    <td>{movement.observation || "-"}</td>
                    <td>{movement.user?.name || "-"}</td>
                    <td>{formatDatePY(movement.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No hay movimientos para los filtros seleccionados.
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

export default MovementsPage;