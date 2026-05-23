import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const isFormComplete = form.email.trim() && form.password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const accounts = await authService.getAccounts();
      const owner = accounts.find((a: any) => a.role === "owner");
      if (!owner) return setError("No owner account found");
      const result = await authService.login({
        email: owner.email,
        password: form.password,
      });
      setAuth(result.user, result.token);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Incorrect email or password",
      );
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
          {showForgot
            ? "Enter your email to reset your password"
            : "Welcome back! Sign in to manage your shop"}
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 4px 24px rgba(238,45,124,0.08)",
        }}
      >
        {/* ── Normal Login ── */}
        {!showForgot && (
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <Row>
              <Inner>
                <MailIcon />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  style={inputStyle}
                />
              </Inner>
            </Row>

            {/* Password */}
            <Row>
              <Inner>
                <LockIcon />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  style={inputStyle}
                />
              </Inner>
            </Row>

            {/* Remember me + Forgot password */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                marginTop: "-4px",
              }}
            >
              {/* Remember me */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "rgba(9,9,9,0.60)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    border: rememberMe
                      ? "2px solid #EE2D7C"
                      : "2px solid rgba(9,9,9,0.20)",
                    backgroundColor: rememberMe ? "#EE2D7C" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  {rememberMe && (
                    <svg
                      width="11"
                      height="11"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                Remember me
              </label>

              {/* Forgot password */}
              <span
                onClick={() => {
                  setShowForgot(true);
                  setError("");
                }}
                style={{
                  fontSize: "13px",
                  color: "#EE2D7C",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </span>
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
                  marginBottom: "12px",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormComplete || loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor:
                  isFormComplete && !loading
                    ? "#EE2D7C"
                    : "rgba(238,45,124,0.35)",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                cursor: isFormComplete && !loading ? "pointer" : "not-allowed",
                fontFamily: "Inter, sans-serif",
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Login to the System"}
            </button>
          </form>
        )}

        {/* ── Forgot Password ── */}
        {showForgot && !forgotSent && (
          <div>
            <Row>
              <Inner>
                <MailIcon />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  style={inputStyle}
                  autoFocus
                />
              </Inner>
            </Row>

            <button
              onClick={() => {
                if (forgotEmail) setForgotSent(true);
              }}
              disabled={!forgotEmail}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: forgotEmail
                  ? "#EE2D7C"
                  : "rgba(238,45,124,0.35)",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                cursor: forgotEmail ? "pointer" : "not-allowed",
                marginBottom: "16px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Send Reset Link
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "rgba(9,9,9,0.55)",
                margin: 0,
              }}
            >
              <span
                onClick={() => setShowForgot(false)}
                style={{ color: "#EE2D7C", fontWeight: 600, cursor: "pointer" }}
              >
                ← Back to login
              </span>
            </p>
          </div>
        )}

        {/* ── Reset Email Sent ── */}
        {showForgot && forgotSent && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(238,45,124,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="#EE2D7C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#090909",
                marginBottom: "8px",
              }}
            >
              Reset link sent!
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(9,9,9,0.55)",
                marginBottom: "24px",
              }}
            >
              Check your email <strong>{forgotEmail}</strong> for the password
              reset link.
            </p>
            <span
              onClick={() => {
                setShowForgot(false);
                setForgotSent(false);
                setForgotEmail("");
              }}
              style={{
                color: "#EE2D7C",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back to login
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "14px",
  color: "#090909",
  fontFamily: "Inter, sans-serif",
};

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        backgroundColor: "rgba(238,45,124,0.05)",
        border: "1px solid rgba(238,45,124,0.18)",
        borderRadius: "12px",
        height: "50px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flex: 1,
        padding: "0 16px",
      }}
    >
      {children}
    </div>
  );
}

function MailIcon() {
  return (
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
      <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
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
  );
}
