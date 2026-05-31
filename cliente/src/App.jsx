import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ItemsPage from "./pages/items/ItemsPage";
import BranchesPage from "./pages/branches/BranchesPage";
import StockPage from "./pages/stock/StockPage";
import MovementsPage from "./pages/stock/MovementsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="movements" element={<MovementsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;