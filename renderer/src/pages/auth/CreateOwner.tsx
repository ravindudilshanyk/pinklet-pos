import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";

export default function CreateOwner() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormComplete =
    form.name.trim() &&
    form.email.trim() &&
    form.otp.trim() &&
    form.password.trim() &&
    form.confirmPassword.trim() &&
    otpVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    try {
      setLoading(true);
      const result = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAuth(result.user, result.token);
      navigate("/auth", { replace: true });
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Registration failed");
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
      }}
    >
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
          As the beginning, create your shop owner account to continue.
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
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <Row>
            <Inner>
              <UserIcon />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                style={inputStyle}
              />
            </Inner>
          </Row>

          {/* Email + Send OTP */}
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
            <OTPButton
              onClick={() => setOtpSent(true)}
              disabled={!form.email}
              active={!!form.email}
            >
              {otpSent ? "Resend" : "Send OTP"}
            </OTPButton>
          </Row>

          {/* OTP + Verify OTP */}
          <Row>
            <Inner>
              <KeyIcon />
              <input
                type="text"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                placeholder="Enter OTP"
                disabled={!otpSent}
                style={{
                  ...inputStyle,
                  opacity: otpSent ? 1 : 0.5,
                  cursor: !otpSent ? "not-allowed" : "text",
                }}
              />
            </Inner>
            <OTPButton
              onClick={() => setOtpVerified(true)}
              disabled={!otpSent || !form.otp || otpVerified}
              active={otpSent && !!form.otp && !otpVerified}
            >
              {otpVerified ? "Verified ✓" : "Verify OTP"}
            </OTPButton>
          </Row>

          {/* Password */}
          <Row>
            <Inner>
              <LockIcon />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create password"
                style={inputStyle}
              />
            </Inner>
          </Row>

          {/* Confirm Password */}
          <Row>
            <Inner>
              <LockIcon />
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Re-enter password"
                style={inputStyle}
              />
            </Inner>
          </Row>

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
              marginBottom: "16px",
              fontFamily: "Inter, sans-serif",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Creating account..." : "Create Owner Account"}
          </button>

          {/* Login link */}
          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "rgba(9,9,9,0.55)",
              margin: 0,
            }}
          >
            Already have an owner account?{" "}
            <span
              onClick={() => navigate("/auth/owner-login")}
              style={{ color: "#EE2D7C", fontWeight: 600, cursor: "pointer" }}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "14px",
  color: "#090909",
  fontFamily: "Inter, sans-serif",
};

// ── Row — full field container ────────────────────────────

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

// ── Inner — icon + input area ─────────────────────────────

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

// ── OTP Button — fixed width, full height ─────────────────

function OTPButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "110px",
        flexShrink: 0,
        height: "100%",
        border: "none",
        borderLeft: "1px solid rgba(238,45,124,0.18)",
        backgroundColor: active ? "#EE2D7C" : "rgba(238,45,124,0.25)",
        color: "white",
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Inter, sans-serif",
        transition: "background-color 0.2s",
        whiteSpace: "nowrap",
        borderRadius: "0 12px 12px 0",
      }}
    >
      {children}
    </button>
  );
}

// ── Icons ─────────────────────────────────────────────────

function UserIcon() {
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
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
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

function KeyIcon() {
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
      <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
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
