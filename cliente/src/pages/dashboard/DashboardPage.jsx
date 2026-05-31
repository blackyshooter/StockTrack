import { useEffect, useState } from "react";
import api from "../../api/axios";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Error dashboard:", err);
      setError(
        err.response?.data?.message || "No se pudo cargar el dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general del sistema.</p>
        </div>

        <button className="secondary-button" onClick={loadDashboard}>
          Actualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Artículos activos</span>
          <strong>{summary?.items?.active || 0}</strong>
          <small>Total registrados: {summary?.items?.total || 0}</small>
        </div>

        <div className="stat-card">
          <span>Sucursales activas</span>
          <strong>{summary?.branches?.active || 0}</strong>
          <small>Total registradas: {summary?.branches?.total || 0}</small>
        </div>

        <div className="stat-card">
          <span>Stock total</span>
          <strong>{summary?.stock?.totalStock || 0}</strong>
          <small>Cantidad total ingresada</small>
        </div>

        <div className="stat-card">
          <span>Stock asignado</span>
          <strong>{summary?.stock?.assignedStock || 0}</strong>
          <small>Comprometido para sucursales</small>
        </div>

        <div className="stat-card">
          <span>Stock disponible</span>
          <strong>{summary?.stock?.availableStock || 0}</strong>
          <small>Disponible para nuevas asignaciones</small>
        </div>

        <div className="stat-card warning">
          <span>Bajo stock</span>
          <strong>{summary?.stock?.lowStockItems || 0}</strong>
          <small>Artículos bajo mínimo</small>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Últimos movimientos</h2>
          <p>Ingresos, asignaciones y liberaciones recientes.</p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Artículo</th>
                <th>Sucursal</th>
                <th>Cantidad</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {summary?.lastMovements?.length > 0 ? (
                summary.lastMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <span className={`badge ${movement.movementType?.toLowerCase()}`}>
                        {movement.movementType}
                      </span>
                    </td>
                    <td>{movement.item?.name || "-"}</td>
                    <td>{movement.branch?.name || "-"}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.user?.name || "-"}</td>
                    <td>{formatDatePY(movement.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No hay movimientos registrados.
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

export default DashboardPage;