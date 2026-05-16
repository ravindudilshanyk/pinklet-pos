import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";

interface Account {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export default function AccountSelect() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ownerAccounts = accounts.filter((a) => a.role === "owner");
  const cashierAccounts = accounts.filter((a) => a.role === "cashier");

  useEffect(() => {
    authService.getAccounts().then(setAccounts);
  }, []);

  const handleSelectAccount = (account: Account) => {
    setSelected(account);
    setPassword("");
    setError("");
    navigate("/auth/login", { state: { account } });
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-neutral">
          Welcome to <span className="text-primary font-bold">Pinklet</span>
          <span className="text-neutral mx-2">|</span>
          POS System
        </h1>
        <p className="text-neutral-60 mt-2 text-sm">
          Select a user to continue
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-2xl">
        {/* Owner Account */}
        {ownerAccounts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-center text-base font-semibold text-primary mb-4">
              Owner Account
            </h2>
            <div className="flex justify-center">
              {ownerAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-primary-t80 bg-primary-t95 hover:border-primary hover:bg-primary-t90 transition-all w-36"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-t80 flex items-center justify-center text-primary font-bold text-2xl">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-sm text-neutral">
                    {account.name}
                  </p>
                  <p className="text-xs text-primary font-medium">Owner</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {cashierAccounts.length > 0 && (
          <div className="border-t border-neutral-10 my-6" />
        )}

        {/* Cashier Accounts */}
        {cashierAccounts.length > 0 && (
          <div>
            <h2 className="text-center text-base font-semibold text-primary mb-4">
              Cashier Accounts
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {cashierAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-primary-t80 bg-primary-t95 hover:border-primary hover:bg-primary-t90 transition-all w-32"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-t80 flex items-center justify-center text-primary font-bold text-xl">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-xs text-neutral text-center">
                    {account.name}
                  </p>
                  <p className="text-xs text-primary font-medium">Cashier</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
