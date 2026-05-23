import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import itemsRoutes from "./routes/items.routes";
import billingRoutes from "./routes/billing.routes";
import customersRoutes from "./routes/customers.routes";
import salesRoutes from "./routes/sales.routes";
import reportsRoutes from "./routes/reports.routes";
import settingsRoutes from "./routes/settings.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  (require("cors") as typeof cors)({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/items", itemsRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✓ Pinklet server running on port ${PORT}`);

  // Auto-backup on startup
  autoBackupOnStartup();
});

function autoBackupOnStartup() {
  try {
    const DB_PATH = path.join(__dirname, "../prisma/pinklet.db");
    const BACKUP_DIR = path.join(__dirname, "../backups");

    if (!fs.existsSync(DB_PATH)) return;
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const backupPath = path.join(BACKUP_DIR, `auto-startup-${timestamp}.db`);

    fs.copyFileSync(DB_PATH, backupPath);

    // Keep only last 7 startup backups
    const startupBackups = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("auto-startup-"))
      .sort()
      .reverse();

    if (startupBackups.length > 7) {
      startupBackups.slice(7).forEach((f) => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      });
    }

    console.log(`✓ Auto-backup created: ${path.basename(backupPath)}`);
  } catch (err) {
    console.warn("Auto-backup failed (non-critical):", err);
  }
}

export default app;
