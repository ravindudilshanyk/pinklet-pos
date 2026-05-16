import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#FFF0F5",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Topbar — full width at top */}
      <Topbar />

      {/* Below topbar — sidebar + content side by side */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Page content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
