import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { join } from "path";
import { fork, ChildProcess, spawnSync } from "child_process";
import * as fs from "fs";

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const isDev = !app.isPackaged;
const SERVER_PORT = 3001;
const VITE_PORT = 5173;

function runMigrations(serverCwd: string, prismaPath: string, dbPath: string) {
  const prismaCli = join(serverCwd, "node_modules", "prisma", "build", "index.js");
  const schemaPath = join(prismaPath, "schema.prisma");

  if (!fs.existsSync(prismaCli) || !fs.existsSync(schemaPath)) {
    console.warn("Skipping migrations: Prisma CLI or schema not found");
    return;
  }

  const result = spawnSync(
    process.execPath,
    [prismaCli, "migrate", "deploy", "--schema", schemaPath],
    {
      cwd: serverCwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DATABASE_URL: `file:${dbPath}`,
        PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
      },
      encoding: "utf-8",
    },
  );

  if (result.stdout?.trim()) {
    console.log("[Prisma]", result.stdout.trim());
  }
  if (result.stderr?.trim()) {
    console.error("[Prisma Error]", result.stderr.trim());
  }
  if (result.status !== 0) {
    throw new Error(`Prisma migration failed with exit code ${result.status ?? -1}`);
  }
}

function configureRuntimePaths() {
  const appDataRoot = join(app.getPath("appData"), "pinklet-pos");
  const userDataPath = join(appDataRoot, "user-data");
  const sessionDataPath = join(appDataRoot, "session-data");
  const cachePath = join(sessionDataPath, "Cache");
  const gpuCachePath = join(sessionDataPath, "GPUCache");

  fs.mkdirSync(userDataPath, { recursive: true });
  fs.mkdirSync(sessionDataPath, { recursive: true });
  fs.mkdirSync(cachePath, { recursive: true });
  fs.mkdirSync(gpuCachePath, { recursive: true });

  app.setPath("userData", userDataPath);
  app.setPath("sessionData", sessionDataPath);
  app.commandLine.appendSwitch("disk-cache-dir", cachePath);
  app.commandLine.appendSwitch("gpu-shader-disk-cache-dir", gpuCachePath);
}

configureRuntimePaths();

// ── Start Express server ──────────────────────────────────
function startServer() {
  if (isDev) {
    console.log("Dev mode — expecting server on port 3001");
    return;
  }

  // In production — server is bundled inside the app
  const serverPath = join(process.resourcesPath, "server/dist/index.js");
  const serverCwd = join(process.resourcesPath, "server");
  const dbDir = join(app.getPath("appData"), "pinklet-pos");
  const dbPath = join(dbDir, "pinklet.db");
  const prismaPath = join(process.resourcesPath, "server/prisma");

  fs.mkdirSync(dbDir, { recursive: true });

  console.log("Starting server from:", serverPath);
  console.log("Database path:", dbPath);

  console.log("Server exists:", fs.existsSync(serverPath));
  console.log("Server path:", serverPath);
  console.log("Prisma path:", prismaPath);

  try {
    runMigrations(serverCwd, prismaPath, dbPath);
  } catch (error) {
    console.error("Migration step failed:", error);
  }

  serverProcess = fork(serverPath, [], {
    cwd: serverCwd,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(SERVER_PORT),
      DATABASE_URL: `file:${dbPath}`,
      JWT_SECRET: "pinklet-pos-production-secret-2024",
      PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
    },
    stdio: "pipe",
  });

  serverProcess.stdout?.on("data", (data: Buffer) => {
    console.log("[Server]", data.toString().trim());
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    console.error("[Server Error]", data.toString().trim());
  });

  serverProcess.on("close", (code: number) => {
    console.log("Server exited with code", code);
  });
}

// ── Wait for server to be ready ───────────────────────────
async function waitForServer(maxAttempts = 20): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `http://localhost:${SERVER_PORT}/api/v1/auth/setup-status`,
      );
      if (response.ok) return true;
    } catch {
      // Not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

// ── Create main window ────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: "Pinklet POS",
    backgroundColor: "#FFF0F5",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // ← ADD THIS
    },
    // Custom titlebar look
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    icon: join(__dirname, "../assets/icon.png"),
    show: false, // Don't show until ready
  });

  // Show loading screen while server starts
  mainWindow.loadURL(
    'data:text/html,<html><body style="background:#FFF0F5;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;margin:0"><div style="text-align:center"><div style="font-size:48px;margin-bottom:16px">🎀</div><h2 style="color:#EE2D7C;margin:0 0 8px;font-size:24px;font-weight:800">Pinklet POS</h2><p style="color:rgba(9,9,9,0.45);margin:0;font-size:14px">Starting up...</p></div></body></html>',
  );

  mainWindow.show();

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${VITE_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    startServer();
    const serverReady = await waitForServer(30);

    if (!serverReady) {
      dialog.showErrorBox(
        "Startup Failed",
        "Could not start Pinklet POS server.\nPlease restart the application.",
      );
      app.quit();
      return;
    }

    // Load built renderer
    const rendererPath = join(process.resourcesPath, "renderer/dist/index.html");
    mainWindow.loadFile(rendererPath);
  }

  // Open external links in browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── App lifecycle ─────────────────────────────────────────
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // Kill server when app closes
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// ── IPC Handlers ──────────────────────────────────────────
ipcMain.handle("get-app-version", () => app.getVersion());

ipcMain.handle("get-user-data-path", () => app.getPath("userData"));

ipcMain.handle("show-save-dialog", async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle("show-open-dialog", async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
