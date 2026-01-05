# Forward Port Management (FPM) 🚀

**Forward Port Management** is a native macOS utility to manage and execute port forwarding commands (SSH tunneling, Port mapping) via a clean GUI.

---

## 💻 Demonstration

https://github.com/user-attachments/assets/cf4eb91a-4417-4c2c-8cb1-e0213e07312b

---

## ✨ Key Features

- **Category Management:** Group commands by projects.
- **Command Settings:** Save and manage custom scripts.
- **Control Panel:** Monitor and execute commands instantly.

---

## 📥 Installation (End-Users)

1. **Download:** Get the latest `.zip` from [Releases](https://github.com/nguyenvuongnamhuy/forward-port-management/releases).
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

**Data Storage:** `~/Library/Application Support/forwardPortManagementApp/`
