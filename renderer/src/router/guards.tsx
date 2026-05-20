import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import api from "@/services/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const token = useAuthStore((s) => s.token);

  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get("/auth/setup-status")
      .then((res) => {
        setSetupComplete(res.data.data.setupComplete);
      })
      .catch(() => {
        setSetupComplete(false);
      });
  }, []);

  // Loading state
  if (setupComplete === null) {
    return null;
  }

  // First-time setup
  if (!setupComplete) {
    return <Navigate to="/create-owner" replace />;
  }

  // Not logged in
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Authorized
  return <>{children}</>;
}