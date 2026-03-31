import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { PortalLayout } from "@/components/PortalLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { LoginPage } from "@/pages/LoginPage";
import { MyOrdersPage } from "@/pages/MyOrdersPage";
import { NewOrderPage } from "@/pages/NewOrderPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/pedido/nuevo" replace />} />
          <Route path="/pedido/nuevo" element={<NewOrderPage />} />
          <Route path="/mis-pedidos" element={<MyOrdersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
