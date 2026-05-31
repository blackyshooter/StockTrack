import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">ST</span>
          <div>
            <h2>StockTrack</h2>
            <p>Mesa de Ayuda</p>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/items">Artículos</NavLink>
          <NavLink to="/branches">Sucursales</NavLink>
          <NavLink to="/stock">Stock</NavLink>
          <NavLink to="/movements">Movimientos</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <small>{user?.role}</small>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;