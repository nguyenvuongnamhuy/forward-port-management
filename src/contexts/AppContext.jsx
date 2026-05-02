import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [commands, setCommands] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ isDarkMode: false });
  const [runningCommands, setRunningCommands] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Setup IPC event listeners
    const cleanupLog = window.electronAPI.onLog((logData) => {
      addLog(logData);
    });

    const cleanupStatus = window.electronAPI.onProcessStatus((data) => {
      setRunningCommands((prev) => {
        const newSet = new Set(prev);
        if (data.isRunning) {
          newSet.add(data.commandId);
        } else {
          newSet.delete(data.commandId);
        }
        return newSet;
      });
    });

    const cleanupTerminated = window.electronAPI.onProcessTerminated((data) => {
      setRunningCommands((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.commandId);
        return newSet;
      });
    });

    // Cleanup function
    return () => {
      if (cleanupLog) cleanupLog();
      if (cleanupStatus) cleanupStatus();
      if (cleanupTerminated) cleanupTerminated();
    };
  }, []);

  // Load all data
  async function loadData() {
    try {
      setLoading(true);
      const data = await window.electronAPI.loadData();
      setCategories(data.categories || []);
      setCommands(data.commands || []);
      setSettings(data.settings || { isDarkMode: false });
    } catch (error) {
      message.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Save data
  async function saveData() {
    try {
      await window.electronAPI.saveData({ categories, commands });
    } catch (error) {
      message.error("Failed to save data");
      console.error(error);
    }
  }

  // Category actions
  function addCategory(name) {
    const newCategory = {
      id: uuidv4(),
      name,
      order: categories.length,
    };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    window.electronAPI.saveData({ categories: newCategories, commands });
    message.success("Category added");
  }

  function updateCategory(id, updates) {
    const newCategories = categories.map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    setCategories(newCategories);
    window.electronAPI.saveData({ categories: newCategories, commands });
  }

  function deleteCategory(id) {
    const newCategories = categories.filter((cat) => cat.id !== id);
    const newCommands = commands.filter((cmd) => cmd.categoryId !== id);
    setCategories(newCategories);
    setCommands(newCommands);
    window.electronAPI.saveData({
      categories: newCategories,
      commands: newCommands,
    });
    message.success("Category deleted");
  }

  function reorderCategories(newOrder) {
    const reordered = newOrder.map((cat, index) => ({ ...cat, order: index }));
    setCategories(reordered);
    window.electronAPI.saveData({ categories: reordered, commands });
  }

  // Command actions
  function addCommand(categoryId, name, command) {
    const commandsInCategory = commands.filter(
      (cmd) => cmd.categoryId === categoryId
    );
    const newCommand = {
      id: uuidv4(),
      name,
      command,
      categoryId,
      order: commandsInCategory.length,
    };
    const newCommands = [...commands, newCommand];
    setCommands(newCommands);
    window.electronAPI.saveData({ categories, commands: newCommands });
    message.success("Command added");
  }

  function updateCommand(id, updates) {
    const newCommands = commands.map((cmd) =>
      cmd.id === id ? { ...cmd, ...updates } : cmd
    );
    setCommands(newCommands);
    window.electronAPI.saveData({ categories, commands: newCommands });
  }

  function deleteCommand(id) {
    // Stop if running
    if (runningCommands.has(id)) {
      stopCommand(id);
    }
    const newCommands = commands.filter((cmd) => cmd.id !== id);
    setCommands(newCommands);
    window.electronAPI.saveData({ categories, commands: newCommands });
    message.success("Command deleted");
  }

  function reorderCommands(categoryId, newOrder) {
    const otherCommands = commands.filter(
      (cmd) => cmd.categoryId !== categoryId
    );
    const reordered = newOrder.map((cmd, index) => ({ ...cmd, order: index }));
    const newCommands = [...otherCommands, ...reordered];
    setCommands(newCommands);
    window.electronAPI.saveData({ categories, commands: newCommands });
  }

  // Process control
  async function toggleCommand(commandId, isOn) {
    if (isOn) {
      await startCommand(commandId);
    } else {
      await stopCommand(commandId);
    }
  }

  async function startCommand(commandId) {
    const command = commands.find((cmd) => cmd.id === commandId);
    const category = categories.find((cat) => cat.id === command.categoryId);

    if (!command || !category) return;

    try {
      await window.electronAPI.startProcess({
        commandId: command.id,
        command: command.command,
        categoryName: category.name,
        commandName: command.name,
      });
    } catch (error) {
      message.error("Failed to start command");
      console.error(error);
    }
  }

  async function stopCommand(commandId) {
    try {
      await window.electronAPI.stopProcess(commandId);
    } catch (error) {
      message.error("Failed to stop command");
      console.error(error);
    }
  }

  // Log actions
  function addLog(logEntry) {
    setLogs((prev) => [...prev, { ...logEntry, id: uuidv4() }]);
  }

  function clearLogs() {
    setLogs([]);
    message.success("Logs cleared");
  }

  // Settings actions
  async function toggleDarkMode() {
    const newSettings = { ...settings, isDarkMode: !settings.isDarkMode };
    setSettings(newSettings);
    await window.electronAPI.saveSettings(newSettings);
  }

  async function importConfig() {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (!folderPath) return;

      const result = await window.electronAPI.importConfig(folderPath);
      if (result.success) {
        await loadData();
        message.success("Configuration imported successfully");
      } else {
        message.error(result.error || "Failed to import configuration");
      }
    } catch (error) {
      message.error("Failed to import configuration");
      console.error(error);
    }
  }

  async function exportConfig() {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (!folderPath) return;

      const result = await window.electronAPI.exportConfig(folderPath);
      if (result.success) {
        message.success(`Configuration exported to ${result.path}`);
      } else {
        message.error(result.error || "Failed to export configuration");
      }
    } catch (error) {
      message.error("Failed to export configuration");
      console.error(error);
    }
  }

  const value = {
    // State
    categories,
    commands,
    logs,
    settings,
    runningCommands,
    loading,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    addCommand,
    updateCommand,
    deleteCommand,
    reorderCommands,

    toggleCommand,
    clearLogs,

    toggleDarkMode,
    importConfig,
    exportConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
