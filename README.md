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
   - **System Settings > Privacy > Developer Tools**: Enable for FPM.
   - **System Settings > Privacy > Full Disk Access**: Enable for FPM.
4. **Open:** Right-click and select "Open" for the first time.

---

## 🛠 Setup & Run (Developers)

1. **Clone:** `git clone https://github.com/nguyenvuongnamhuy/forward-port-management.git`
2. **Xcode Config (Signing & Capabilities):**
   - **Remove App Sandbox**
   - **Remove Hardened Runtime**
3. **Permissions:** Grant **Developer Tools** & **Full Disk Access** for the build version.
4. **Build:** Press `Cmd + R`.

---

## 💻 Tech Stack

- **Language:** Swift 5.x / SwiftUI
- **Platform:** macOS 26.0+

---

**Data Storage:** `~/Library/Application Support/forwardPortManagementApp/`
