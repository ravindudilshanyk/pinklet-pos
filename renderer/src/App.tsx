import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
import AppShell from "@/components/layout/AppShell";
import PreOrders from '@/pages/PreOrders'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ChangePassword from '@/pages/auth/ChangePassword'

const queryClient = new QueryClient();

function AppRoutes() {
  const { token } = useAuthStore()
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null)

  useEffect(() => {
    let isActive = true

    authService
      .getSetupStatus()
      .then(({ setupComplete }) => {
        if (isActive) {
          setSetupComplete(setupComplete)
        }
      })
      .catch(() => {
        if (isActive) {
          setSetupComplete(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  // Loading
  if (setupComplete === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F5', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EE2D7C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>🎀</div>
          <p style={{ color: 'rgba(9,9,9,0.45)', fontSize: '14px' }}>Starting Pinklet POS...</p>
        </div>
      </div>
    )
  }

  // No owner yet — show setup
  if (!setupComplete) {
    return (
      <Routes>
        <Route path="/create-owner" element={<CreateOwner />} />
        <Route path="*" element={<Navigate to="/create-owner" replace />} />
      </Routes>
    )
  }

  // Owner exists but not logged in
  if (!token) {
    return (
      <Routes>
        <Route path="/auth" element={<AccountSelect />} />
        <Route path="/auth/login" element={<PasswordLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  // Logged in — show main app
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
  )
}

export default function App() {
  const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  )
}