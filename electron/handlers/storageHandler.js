const fs = require("fs").promises;
const path = require("path");
const os = require("os");

// Get storage directory
function getStorageDir() {
  const appSupport = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "fpm",
  );
  return appSupport;
}

// Ensure storage directory exists
async function ensureStorageDir() {
  const dir = getStorageDir();
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return dir;
}

// Load all data
async function loadAllData() {
  try {
    const dir = await ensureStorageDir();

    // Load categories
    let categories = [];
    try {
      const categoriesPath = path.join(dir, "categories.json");
      const categoriesData = await fs.readFile(categoriesPath, "utf-8");
      categories = JSON.parse(categoriesData);
    } catch {
      categories = [];
    }

    // Load commands
    let commands = [];
    try {
      const commandsPath = path.join(dir, "commands.json");
      const commandsData = await fs.readFile(commandsPath, "utf-8");
      commands = JSON.parse(commandsData);
    } catch {
      commands = [];
    }

    // Load settings
    let settings = { isDarkMode: false };
    try {
      const settingsPath = path.join(dir, "settings.json");
      const settingsData = await fs.readFile(settingsPath, "utf-8");
      settings = JSON.parse(settingsData);
    } catch {
      settings = { isDarkMode: false };
    }

    return { categories, commands, settings };
  } catch (error) {
    console.error("Error loading data:", error);
    return { categories: [], commands: [], settings: { isDarkMode: false } };
  }
}

// Save all data
async function saveAllData(data) {
  try {
    const dir = await ensureStorageDir();

    // Save categories
    if (data.categories) {
      const categoriesPath = path.join(dir, "categories.json");
      await fs.writeFile(
        categoriesPath,
        JSON.stringify(data.categories, null, 2),
        "utf-8",
      );
    }

    // Save commands
    if (data.commands) {
      const commandsPath = path.join(dir, "commands.json");
      await fs.writeFile(
        commandsPath,
        JSON.stringify(data.commands, null, 2),
        "utf-8",
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving data:", error);
    return { success: false, error: error.message };
  }
}

// Save settings
async function saveSettings(settings) {
  try {
    const dir = await ensureStorageDir();
    const settingsPath = path.join(dir, "settings.json");
    await fs.writeFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
      "utf-8",
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message };
  }
}

// Import config
async function importConfig(folderPath) {
  try {
    // Read categories
    let categories = [];
    try {
      const categoriesPath = path.join(folderPath, "categories.json");
      const categoriesData = await fs.readFile(categoriesPath, "utf-8");
      categories = JSON.parse(categoriesData);
    } catch (error) {
      return {
        success: false,
        error: "categories.json not found or invalid",
      };
    }

    // Read commands
    let commands = [];
    try {
      const commandsPath = path.join(folderPath, "commands.json");
      const commandsData = await fs.readFile(commandsPath, "utf-8");
      commands = JSON.parse(commandsData);
    } catch (error) {
      return { success: false, error: "commands.json not found or invalid" };
    }

    // Save imported data
    await saveAllData({ categories, commands });

    return { success: true, categories, commands };
  } catch (error) {
    console.error("Error importing config:", error);
    return { success: false, error: error.message };
  }
}

// Export config
async function exportConfig(folderPath) {
  try {
    // Create backup folder
    const backupPath = path.join(folderPath, "backup");
    await fs.mkdir(backupPath, { recursive: true });

    // Load current data
    const data = await loadAllData();

    // Write categories
    const categoriesPath = path.join(backupPath, "categories.json");
    await fs.writeFile(
      categoriesPath,
      JSON.stringify(data.categories, null, 2),
      "utf-8",
    );

    // Write commands
    const commandsPath = path.join(backupPath, "commands.json");
    await fs.writeFile(
      commandsPath,
      JSON.stringify(data.commands, null, 2),
      "utf-8",
    );

    return { success: true, path: backupPath };
  } catch (error) {
    console.error("Error exporting config:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  loadAllData,
  saveAllData,
  saveSettings,
  importConfig,
  exportConfig,
};
