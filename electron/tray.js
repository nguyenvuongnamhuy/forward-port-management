const { Tray, Menu, nativeImage, app } = require("electron");
const path = require("path");
const { loadAllData } = require("./handlers/storageHandler");
const {
  startCommand,
  stopCommand,
  getRunningCommandIds,
} = require("./handlers/processHandler");

let tray = null;
let mainWindowRef = null;

function createTrayIcon() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "assets", "tray-icon-Template.png")
  );
  icon.setTemplateImage(true);
  return icon;
}

// Update the count shown next to the icon in the menu bar
function updateTrayTitle() {
  if (!tray) return;
  const count = getRunningCommandIds().length;
  tray.setTitle(count > 0 ? String(count) : "");
  tray.setToolTip(
    count > 0 ? `FPM — ${count} running` : "FPM — no commands running"
  );
}

function showMainWindow() {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.show();
    mainWindowRef.focus();
  }
}

// Rebuild the menu from current config + process state on every open,
// so it always reflects edits made in the app window
async function buildMenu() {
  const { categories, commands } = await loadAllData();
  const running = new Set(getRunningCommandIds());
  const items = [];

  items.push({
    label:
      running.size > 0
        ? `${running.size} command${running.size === 1 ? "" : "s"} running`
        : "No commands running",
    enabled: false,
  });
  items.push({ type: "separator" });

  categories
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((category) => {
      const categoryCommands = commands
        .filter((cmd) => cmd.categoryId === category.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      if (categoryCommands.length === 0) return;

      items.push({ label: category.name, enabled: false });
      categoryCommands.forEach((cmd) => {
        const isRunning = running.has(cmd.id);
        items.push({
          label: cmd.name,
          type: "checkbox",
          checked: isRunning,
          click: async () => {
            if (isRunning) {
              await stopCommand(cmd.id, mainWindowRef);
            } else {
              await startCommand(
                {
                  commandId: cmd.id,
                  command: cmd.command,
                  categoryName: category.name,
                  commandName: cmd.name,
                },
                mainWindowRef
              );
            }
            updateTrayTitle();
          },
        });
      });
      items.push({ type: "separator" });
    });

  items.push({
    label: running.size > 0 ? `Stop All (${running.size})` : "Stop All",
    enabled: running.size > 0,
    click: async () => {
      await Promise.all(
        getRunningCommandIds().map((id) => stopCommand(id, mainWindowRef))
      );
      updateTrayTitle();
    },
  });
  items.push({ type: "separator" });
  items.push({
    label: "Open FPM",
    click: showMainWindow,
  });
  items.push({
    label: "Quit FPM",
    click: () => {
      app.isQuitting = true;
      app.quit();
    },
  });

  return Menu.buildFromTemplate(items);
}

async function popUpMenu() {
  const menu = await buildMenu();
  tray.popUpContextMenu(menu);
}

function createTray(mainWindow) {
  mainWindowRef = mainWindow;
  tray = new Tray(createTrayIcon());
  updateTrayTitle();

  // No permanent context menu: rebuild fresh each time it opens
  tray.on("click", popUpMenu);
  tray.on("right-click", popUpMenu);

  return tray;
}

module.exports = { createTray, updateTrayTitle };
