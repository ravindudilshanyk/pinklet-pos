import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "../../prisma/pinklet.db");
const BACKUP_DIR = path.join(__dirname, "../../backups");

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

export const backupController = {
  downloadBackup: async (req: Request, res: Response) => {
    try {
      if (!fs.existsSync(DB_PATH)) {
        return sendError(res, "Database file not found", "NOT_FOUND", 404);
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      const filename = `pinklet-backup-${timestamp}.db`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", "application/octet-stream");

      const fileStream = fs.createReadStream(DB_PATH);
      fileStream.pipe(res);
    } catch {
      sendError(res, "Failed to create backup", "BACKUP_ERROR", 500);
    }
  },

  createAutoBackup: async (req: Request, res: Response) => {
    try {
      ensureBackupDir();

      if (!fs.existsSync(DB_PATH)) {
        return sendError(res, "Database not found", "NOT_FOUND", 404);
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      const backupPath = path.join(
        BACKUP_DIR,
        `pinklet-backup-${timestamp}.db`,
      );

      fs.copyFileSync(DB_PATH, backupPath);

      // Keep only last 10 backups
      const backups = fs
        .readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith(".db"))
        .sort()
        .reverse();

      if (backups.length > 10) {
        backups.slice(10).forEach((f) => {
          fs.unlinkSync(path.join(BACKUP_DIR, f));
        });
      }

      sendSuccess(res, {
        filename: `pinklet-backup-${timestamp}.db`,
        path: backupPath,
        size: fs.statSync(backupPath).size,
      });
    } catch {
      sendError(res, "Failed to create backup", "BACKUP_ERROR", 500);
    }
  },

  listBackups: async (req: Request, res: Response) => {
    try {
      ensureBackupDir();

      const backups = fs
        .readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith(".db"))
        .map((f) => {
          const stat = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            filename: f,
            size: stat.size,
            createdAt: stat.mtime,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      sendSuccess(res, backups);
    } catch {
      sendError(res, "Failed to list backups", "LIST_ERROR", 500);
    }
  },

  restoreBackup: async (req: Request, res: Response) => {
    try {
      if (!req.body.filename) {
        return sendError(res, "Filename required", "VALIDATION_ERROR", 400);
      }

      const backupPath = path.join(BACKUP_DIR, req.body.filename);

      if (!fs.existsSync(backupPath)) {
        return sendError(res, "Backup file not found", "NOT_FOUND", 404);
      }

      // Create safety backup of current DB before restoring
      const safetyTimestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      const safetyPath = path.join(
        BACKUP_DIR,
        `pre-restore-safety-${safetyTimestamp}.db`,
      );
      fs.copyFileSync(DB_PATH, safetyPath);

      // Restore
      fs.copyFileSync(backupPath, DB_PATH);

      sendSuccess(res, {
        message: "Database restored successfully. Please restart the server.",
      });
    } catch {
      sendError(res, "Failed to restore backup", "RESTORE_ERROR", 500);
    }
  },
};
