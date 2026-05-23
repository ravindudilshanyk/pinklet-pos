// Minimal preload — no Node.js modules needed
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),
  showSaveDialog: (options: unknown) =>
    ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options: unknown) =>
    ipcRenderer.invoke("show-open-dialog", options),
  platform: process.platform,
});
