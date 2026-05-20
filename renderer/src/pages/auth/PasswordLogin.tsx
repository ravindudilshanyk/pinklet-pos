import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";

export default function PasswordLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const account = location.state?.account;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!account) {
    navigate("/auth");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const result = await authService.login({
        userId: account.id,
        password,
      });
      setAuth(result.user, result.token);
      navigate("/");
    } catch (err: unknown) {
      type ErrWithResponse = { response?: { data?: { error?: { message?: string } } } };
      const msg = ((err as ErrWithResponse)?.response?.data?.error?.message) ?? "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF0F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Back button — top left */}
      <button
        onClick={() => navigate("/auth")}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "white",
          border: "1px solid rgba(238,45,124,0.18)",
          borderRadius: "10px",
          padding: "8px 14px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#EE2D7C",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 2px 8px rgba(238,45,124,0.08)",
        }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="#EE2D7C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#090909",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Welcome to{" "}
          <span style={{ color: "#EE2D7C", fontWeight: 700 }}>Pinklet</span>{" "}
          <span style={{ color: "#090909" }}>|</span> POS System
        </h1>
        <p
          style={{
            marginTop: "10px",
            fontSize: "14px",
            color: "rgba(9,9,9,0.55)",
            margin: "10px 0 0",
          }}
        >
          Enter your password to continue
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 24px rgba(238,45,124,0.08)",
        }}
      >
        <form onSubmit={handleLogin}>
          {/* User info + password row */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Avatar + name */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(238,45,124,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "#EE2D7C",
                }}
              >
                {account.name.charAt(0).toUpperCase()}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#090909",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {account.name}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#EE2D7C",
                  margin: 0,
                  textTransform: "capitalize",
                }}
              >
                {account.role}
              </p>
            </div>

            {/* Vertical divider */}
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                backgroundColor: "rgba(9,9,9,0.08)",
              }}
            />

            {/* Password side */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Password input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  backgroundColor: "rgba(238,45,124,0.05)",
                  border: "1px solid rgba(238,45,124,0.18)",
                  borderRadius: "12px",
                  height: "50px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: 1,
                    padding: "0 16px",
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    fill="none"
                    stroke="rgba(9,9,9,0.35)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      color: "#090909",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "13px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={!password || loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor:
                    password && !loading ? "#EE2D7C" : "rgba(238,45,124,0.35)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: password && !loading ? "pointer" : "not-allowed",
                  fontFamily: "Inter, sans-serif",
                  transition: "background-color 0.2s",
                }}
              >
                {loading ? "Logging in..." : "Login to the System"}
              </button>

              {/* Forgot / Change password link */}
              {account?.role === 'owner' && (
                <button
                  onClick={() => navigate('/forgot-password')}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EE2D7C',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: '8px',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              )}

              {account?.role === 'cashier' && (
                <button
                  onClick={() => navigate('/forgot-password')}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EE2D7C',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    marginTop: '8px',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
