# Forward Port Management (FPM) 🚀

**Forward Port Management** is a native macOS utility to manage and execute port forwarding commands (SSH tunneling, Port mapping) via a clean GUI.

---

## 💻 Demonstration (Recorded during the v1.0.0 release)

https://github.com/user-attachments/assets/cf4eb91a-4417-4c2c-8cb1-e0213e07312b

---

## ✨ Key Features

- **Import/Export Config:** Backup and restore your categories and commands configuration.
- **Dark Mode:** Built-in dark mode support for comfortable viewing.
- **Category Management:** Group commands by projects.
- **Command Settings:** Save and manage custom scripts.
- **Control Panel:** Monitor and execute commands instantly with optional force kill for port conflicts.
- **Force Kill Toggle:** Automatically terminate existing processes before starting new connections to avoid "port already in use" errors.
- **Real-time Logging:** Monitor command execution with timestamped logs.

---

## 📥 Installation (End-Users)

1. **Download:** Get the latest `fpm.zip` from [Releases](https://github.com/nguyenvuongnamhuy/forward-port-management/releases).
2. **Setup:** Unzip and drag to **Applications**.
3. **Permissions (Required):**
   > **Note:** These permissions are required because the app executes system commands.
   - **System Settings > Privacy > Developer Tools**: Enable for FPM.
4. **Command-line Tools Setup:**
   > **Important:** Commands like `gcloud`, `alloydb-auth-proxy`, `cloud-sql-proxy`, etc., should be moved out of Downloads/Documents folders.
   >
   > **Recommended:** Install via Homebrew for automatic management, or place binaries in `/usr/local/bin` for system-wide access.
5. **Open:** Right-click and select "Open" for the first time.

---

## 🛠 Setup & Run (Developers)

1. **Clone:** `git clone https://github.com/nguyenvuongnamhuy/forward-port-management.git`
2. **Xcode Config (Signing & Capabilities):**
   - **Remove App Sandbox**
   - **Remove Hardened Runtime**
3. **Permissions (Required):**
   > **Note:** These permissions are required because the app executes system commands.
   - **System Settings > Privacy > Developer Tools**: Enable for FPM.
4. **Command-line Tools Setup:**
   > **Important:** Commands like `gcloud`, `alloydb-auth-proxy`, `cloud-sql-proxy`, etc., should be moved out of Downloads/Documents folders.
   >
   > **Recommended:** Install via Homebrew for automatic management, or place binaries in `/usr/local/bin` for system-wide access.
5. **Build:** Press `Cmd + R`.

---

## 💻 Tech Stack

- **Language:** Swift 5.x / SwiftUI
- **Platform:** macOS 26.0+

---

## 📋 Usage Guide

### Settings Tab (Gear Icon)
- **Appearance:** Toggle between light and dark mode.
- **Import Configuration:** Import categories and commands from a backup folder.
- **Backup Configuration:** Export your current setup for backup purposes.

### Category Tab (Folder Icon)
- Add new categories to organize your commands.
- Reorder categories using arrow buttons.
- Delete categories (associated commands will be removed).

### Command Tab (Terminal Icon)
- Add commands to specific categories.
- View all commands grouped by category.
- Reorder and delete commands as needed.

### Control Panel Tab (Slider Icon)
- **Force Kill:** Enable to automatically terminate existing processes before starting new connections (useful when experiencing port conflicts).
- **Toggle Commands:** Use the switch to start/stop port forwarding for each command.
- **Live Logging:** Monitor real-time command execution and error messages.

---

## 💾 Data Storage

Configuration files are stored in: `~/Library/Application Support/forwardPortManagementApp/`

- `categories.json` - Your category definitions
- `commands.json` - Your command definitions
- `settings.json` - Application settings (dark mode preference, etc.)
