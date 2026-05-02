const { spawn, exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// Store running processes
const runningProcesses = new Map();

// Send log to renderer
function sendLog(
  mainWindow,
  categoryName,
  commandName,
  message,
  isError = false,
) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("log:new", {
      categoryName,
      commandName,
      message,
      isError,
      timestamp: new Date().toISOString(),
    });
  }
}

// Send process status
function sendStatus(mainWindow, commandId, isRunning) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("process:status", {
      commandId,
      isRunning,
    });
  }
}

// Send process terminated
function sendTerminated(mainWindow, commandId, exitCode) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("process:terminated", {
      commandId,
      exitCode,
    });
  }
}

// Force kill existing processes
async function forceKillProcess(command) {
  try {
    // SAFETY: Only kill if command is long enough and looks valid
    // Short commands like "1", "abc" are too generic and dangerous
    if (!command || command.trim().length < 5) {
      // Skip force kill for very short commands to prevent killing unrelated processes
      return;
    }

    // Escape special characters for shell safety
    const escapedCommand = command.replace(/"/g, '\\"');

    // Use pkill to kill processes matching the command
    await execPromise(`pkill -9 -f "${escapedCommand}"`);
    // Wait for port to be released
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    // pkill returns error if no process found, which is fine
  }
}

// Start a command
async function startCommand(data, mainWindow) {
  const { commandId, command, categoryName, commandName } = data;

  try {
    // Check if already running
    if (runningProcesses.has(commandId)) {
      sendLog(
        mainWindow,
        categoryName,
        commandName,
        "⚠️ Already running",
        true,
      );
      return { success: false, error: "Already running" };
    }

    // Force kill existing processes
    sendLog(
      mainWindow,
      categoryName,
      commandName,
      "🔧 Force killing existing processes...",
    );
    await forceKillProcess(command);
    sendLog(
      mainWindow,
      categoryName,
      commandName,
      "✅ Existing processes killed.",
    );

    // Spawn new process
    const childProcess = spawn("/bin/zsh", ["-c", `${command} 2>&1`], {
      env: {
        ...process.env,
        PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin",
      },
    });

    // Handle errors FIRST (before storing process)
    childProcess.on("error", (error) => {
      runningProcesses.delete(commandId);
      sendLog(
        mainWindow,
        categoryName,
        commandName,
        `❌ Error: ${error.message}`,
        true,
      );
      sendTerminated(mainWindow, commandId, -1);
      sendStatus(mainWindow, commandId, false);
    });

    // Store process
    runningProcesses.set(commandId, childProcess);

    sendLog(
      mainWindow,
      categoryName,
      commandName,
      "🌐 Creating Tunnel Port...",
    );
    sendStatus(mainWindow, commandId, true);

    // Handle stdout
    childProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        sendLog(mainWindow, categoryName, commandName, output);
      }
    });

    // Handle stderr
    childProcess.stderr.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        sendLog(mainWindow, categoryName, commandName, output, true);
      }
    });

    // Handle process exit
    childProcess.on("exit", (code, signal) => {
      runningProcesses.delete(commandId);

      // Exit code 0, null, 143 (SIGTERM), or SIGTERM signal are normal exits
      const isNormalExit =
        code === 0 || code === null || code === 143 || signal === "SIGTERM";

      if (!isNormalExit) {
        // Special handling for common error codes
        let errorMessage;
        if (code === 127) {
          errorMessage = "❌ Command not found. Please check your command.";
        } else if (code === 126) {
          errorMessage = "❌ Command not executable. Please check permissions.";
        } else if (code === 1) {
          errorMessage = "⚠️ Command failed. Check the logs above for details.";
        } else {
          errorMessage = `⚠️ Process exited unexpectedly (Code: ${code})`;
        }

        sendLog(mainWindow, categoryName, commandName, errorMessage, true);
      } else {
        sendLog(
          mainWindow,
          categoryName,
          commandName,
          "✅ Stopped connection.",
        );
      }

      sendTerminated(mainWindow, commandId, code);
      sendStatus(mainWindow, commandId, false);
    });

    return { success: true };
  } catch (error) {
    console.error("Error starting command:", error);
    sendLog(
      mainWindow,
      categoryName,
      commandName,
      `❌ Failed to start: ${error.message}`,
      true,
    );
    return { success: false, error: error.message };
  }
}

// Stop a command
async function stopCommand(commandId, mainWindow) {
  try {
    const process = runningProcesses.get(commandId);

    if (!process) {
      return { success: false, error: "Process not found" };
    }

    // Kill main process and its children using process group
    try {
      // Kill the entire process group (negative PID)
      process.kill("SIGTERM");

      // Give it a moment to terminate gracefully
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force kill if still running
      if (!process.killed) {
        process.kill("SIGKILL");
      }
    } catch (error) {
      // Process might already be dead
      console.log("Process already terminated:", error.message);
    }

    // Remove from map
    runningProcesses.delete(commandId);

    return { success: true };
  } catch (error) {
    console.error("Error stopping command:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  startCommand,
  stopCommand,
};
