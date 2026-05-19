import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    path: "/",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Make Bill",
    path: "/bill",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Pre-Orders',
    path: '/pre-orders',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Items",
    path: "/items",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Sales History",
    path: "/sales",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Customers",
    path: "/customers",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    path: "/reports",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/settings",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleSignOut = () => {
    clearAuth();
    navigate("/auth");
  };

  return (
    <div
      style={{
        width: collapsed ? "72px" : "200px",
        height: "100%",
        backgroundColor: "white",
        borderRight: "1px solid rgba(9,9,9,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        position: "relative",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Nav items */}
      <div
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? "0" : "12px",
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px" : "10px 12px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: isActive
                  ? "rgba(238,45,124,0.10)"
                  : isHovered
                    ? "rgba(238,45,124,0.05)"
                    : "transparent",
                color: isActive ? "#EE2D7C" : "rgba(9,9,9,0.55)",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "Inter, sans-serif",
                width: "100%",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  flexShrink: 0,
                  color: isActive ? "#EE2D7C" : "rgba(9,9,9,0.45)",
                }}
              >
                {item.icon}
              </div>

              {/* Label */}
              {!collapsed && (
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#EE2D7C" : "rgba(9,9,9,0.65)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Active indicator */}
              {isActive && !collapsed && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#EE2D7C",
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom — user + sign out */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid rgba(9,9,9,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: "1px solid rgba(9,9,9,0.06)",
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "rgba(9,9,9,0.35)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Collapse
            </span>
          )}

          {/* Collapse toggle — only in sidebar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "1px solid rgba(238,45,124,0.18)",
              backgroundColor: "rgba(238,45,124,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="#EE2D7C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              {collapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "12px",
              backgroundColor: "rgba(238,45,124,0.05)",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(238,45,124,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#EE2D7C",
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#090909",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#EE2D7C",
                  margin: 0,
                  textTransform: "capitalize",
                }}
              >
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && user && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(238,45,124,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "#EE2D7C",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? "0" : "12px",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px" : "10px 12px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "transparent",
            color: "rgba(9,9,9,0.45)",
            cursor: "pointer",
            width: "100%",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.06)";
            e.currentTarget.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(9,9,9,0.45)";
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0 }}
          >
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && (
            <span style={{ fontSize: "13px", fontWeight: 500 }}>Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );
}
