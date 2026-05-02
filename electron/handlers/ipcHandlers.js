const { dialog } = require("electron");
const {
  loadAllData,
  saveAllData,
  importConfig,
  exportConfig,
  saveSettings,
} = require("./storageHandler");
const { startCommand, stopCommand } = require("./processHandler");

function registerIpcHandlers(ipcMain, mainWindow) {
  // Storage handlers
  ipcMain.handle("storage:load", async () => {
    return await loadAllData();
  });

  ipcMain.handle("storage:save", async (event, data) => {
    return await saveAllData(data);
  });

  ipcMain.handle("storage:import", async (event, folderPath) => {
    return await importConfig(folderPath);
  });

  ipcMain.handle("storage:export", async (event, folderPath) => {
    return await exportConfig(folderPath);
  });

  ipcMain.handle("storage:save-settings", async (event, settings) => {
    return await saveSettings(settings);
  });

  // Process handlers
  ipcMain.handle("process:start", async (event, data) => {
    return await startCommand(data, mainWindow);
  });

  ipcMain.handle("process:stop", async (event, commandId) => {
    return await stopCommand(commandId, mainWindow);
  });

  // Dialog handlers
  ipcMain.handle("dialog:select-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });
}

module.exports = { registerIpcHandlers };
