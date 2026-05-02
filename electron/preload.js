const { contextBridge, ipcRenderer } = require("electron");

// Expose IPC methods to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Storage operations
  loadData: () => ipcRenderer.invoke("storage:load"),
  saveData: (data) => ipcRenderer.invoke("storage:save", data),
  importConfig: (folderPath) =>
    ipcRenderer.invoke("storage:import", folderPath),
  exportConfig: (folderPath) =>
    ipcRenderer.invoke("storage:export", folderPath),
  saveSettings: (settings) =>
    ipcRenderer.invoke("storage:save-settings", settings),

  // Process operations
  startProcess: (data) => ipcRenderer.invoke("process:start", data),
  stopProcess: (commandId) => ipcRenderer.invoke("process:stop", commandId),

  // Event listeners (return cleanup functions)
  onLog: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on("log:new", listener);
    return () => ipcRenderer.removeListener("log:new", listener);
  },
  onProcessStatus: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on("process:status", listener);
    return () => ipcRenderer.removeListener("process:status", listener);
  },
  onProcessTerminated: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on("process:terminated", listener);
    return () => ipcRenderer.removeListener("process:terminated", listener);
  },

  // File dialog
  selectFolder: () => ipcRenderer.invoke("dialog:select-folder"),
});
