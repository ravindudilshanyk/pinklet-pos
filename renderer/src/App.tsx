import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/auth.service";
import CreateOwner from "@/pages/auth/CreateOwner";
import AccountSelect from "@/pages/auth/AccountSelect";
import Overview from "@/pages/Overview";
import MakeBill from "@/pages/MakeBill";
import Items from "@/pages/Items";
import SalesHistory from "@/pages/SalesHistory";
import Reports from "@/pages/Reports";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import PasswordLogin from "./pages/auth/PasswordLogin";
import OwnerLogin from "@/pages/auth/OwnerLogin";
import AppShell from "@/components/layout/AppShell";
import PreOrders from '@/pages/PreOrders'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ChangePassword from '@/pages/auth/ChangePassword'
import { AuthGuard } from "./router/guards";

const queryClient = new QueryClient();

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);

  useEffect(() => {
    authService.getSetupStatus().then((status) => {
      setOwnerExists(status.ownerExists);
    });
  }, []);

  if (ownerExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!ownerExists) {
    return (
      <Routes>
        <Route path="/auth/owner-login" element={<OwnerLogin />} />
        <Route path="*" element={<CreateOwner />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <AuthGuard>
          <Route path="/auth" element={<AccountSelect />} />
          <Route path="/auth/login" element={<PasswordLogin />} />
          <Route path="/auth/owner-login" element={<OwnerLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </AuthGuard>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Overview />} />
        <Route path="/bill" element={<MakeBill />} />
        <Route path="/pre-orders" element={<PreOrders />} />
        <Route path="/items" element={<Items />} />
        <Route path="/sales" element={<SalesHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
