import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = () => {
    return time.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = () => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        height: "64px",
        backgroundColor: "white",
        borderBottom: "1px solid rgba(9,9,9,0.06)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
        flexShrink: 0,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0,
          marginRight: "8px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#EE2D7C",
            letterSpacing: "-0.3px",
          }}
        >
          Pinklet
        </span>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "rgba(9,9,9,0.30)",
          }}
        >
          |
        </span>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(9,9,9,0.70)",
          }}
        >
          POS System
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "24px",
          backgroundColor: "rgba(9,9,9,0.08)",
          flexShrink: 0,
        }}
      />

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(238,45,124,0.04)",
          border: "1px solid rgba(238,45,124,0.12)",
          borderRadius: "12px",
          padding: "0 16px",
          height: "40px",
          flex: 1,
          maxWidth: "380px",
        }}
      >
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="rgba(9,9,9,0.35)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products from Name or Item Code"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontSize: "13px",
            color: "#090909",
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      {/* Greeting — center */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <span
          style={{
            fontSize: "14px",
            color: "rgba(9,9,9,0.65)",
            fontWeight: 400,
          }}
        >
          {greeting()},{" "}
        </span>
        <span style={{ fontSize: "14px", color: "#EE2D7C", fontWeight: 600 }}>
          {user?.name?.split(" ")[0]}...
        </span>
      </div>

      {/* Right side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Date + Time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#090909" }}>
            {formatDate()}
          </span>
          <span style={{ fontSize: "11px", color: "rgba(9,9,9,0.45)" }}>
            {formatTime()}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "rgba(9,9,9,0.08)",
          }}
        />

        {/* Sync button */}
        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: "1px solid rgba(238,45,124,0.12)",
            backgroundColor: "rgba(238,45,124,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(9,9,9,0.45)",
          }}
          title="Sync"
        >
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Online indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isOnline ? "#22c55e" : "#ef4444",
              boxShadow: isOnline
                ? "0 0 0 2px rgba(34,197,94,0.2)"
                : "0 0 0 2px rgba(239,68,68,0.2)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              color: "rgba(9,9,9,0.45)",
              fontWeight: 500,
            }}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Notification button */}
        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: "1px solid rgba(238,45,124,0.12)",
            backgroundColor: "rgba(238,45,124,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(9,9,9,0.45)",
            position: "relative",
          }}
          title="Notifications"
        >
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#EE2D7C",
              border: "1.5px solid white",
            }}
          />
        </button>
      </div>
    </div>
  );
}
