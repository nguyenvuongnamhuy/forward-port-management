# FPM

Forward Port Management

A native desktop application for managing and executing port forwarding commands (SSH tunneling, Port mapping) via a clean GUI.

## ✨ Features

- **2-Tab Interface**: Simplified UI with Control Panel and Settings tabs
- **Resizable Panels**: Drag to resize Categories and Logs panels (min 40%/30%)
- **Category Management**: Organize commands by projects with collapse/expand (default collapsed)
- **Command Management**: Save and manage custom scripts
- **Drag & Drop Sorting**: Reorder categories and commands easily (using @dnd-kit)
- **Process Control**: Start/stop commands with automatic force kill
- **Real-time Logging**: Monitor command execution with timestamped logs
- **Dark Mode**: Built-in dark mode support
- **Import/Export**: Backup and restore your configuration
- **Compact UI**: Optimized spacing and sticky headers for better space utilization

## 🚀 Tech Stack

- **Electron** ^28.0.0 - Desktop app framework
- **React** ^18.2.0 - UI framework
- **Ant Design** ^5.12.0 - UI component library
- **@dnd-kit** ^6.0.0 - Modern drag-and-drop (React 18 compatible)
- **react-resizable-panels** - Resizable panel layouts
- **Vite** ^5.0.0 - Build tool

## 📦 Installation & Development

### Setup

```bash
npm install
```

### Run Development Mode

```bash
npm run dev
```

This will:

- Start Vite dev server on port 5173
- Launch Electron in development mode
- Enable hot reload for React components

### Build for Production

```bash
npm run package
```

This will:

- Build React app with Vite
- Package Electron app with electron-builder
- Output `.zip` file in `release/` directory

## 📦 Distribution & Installation

### For Developers: Building the App

1. **Build the app**:

   ```bash
   npm run package
   ```

2. **Find the output**:
   - Location: `release/fpm-<version>-arm64-mac.zip` (for Apple Silicon Macs)
   - File size: ~100-150 MB
   - **Note**: electron-builder creates architecture-specific builds (arm64 for M1/M2/M3 Macs)

3. **Distribute**:
   - Share the `.zip` file with users
   - Upload to cloud storage, GitHub releases, or your website

### For End Users: Installing the App

#### Step 1: Download

- Download `fpm-<version>-arm64-mac.zip` from your distribution source
- **Note**: The `-arm64` suffix indicates this is for Apple Silicon Macs (M1/M2/M3)

#### Step 2: Extract the ZIP

- Double-click the `.zip` file to extract it
- The **fpm.app** will be extracted to your Downloads folder

#### Step 3: Install

- Drag **fpm.app** to the **Applications** folder
- Wait for the copy to complete

#### Step 4: Remove Quarantine Attribute

Before launching, remove the macOS quarantine flag:

```bash
xattr -cr /Applications/fpm.app
```

**Why?** macOS marks downloaded apps as "quarantined" and may show "app is damaged" error. This command removes that flag.

#### Step 5: Launch

- Open **Applications** folder
- Double-click **fpm.app**
- The app should now open without issues

### Uninstalling

To remove the app:

1. Drag **fpm.app** from Applications to Trash
2. Delete config files (optional):
   ```bash
   rm -rf ~/Library/Application\ Support/fpm/
   ```

### System Requirements

- **macOS**: 10.13 (High Sierra) or later
- **RAM**: 512 MB minimum
- **Disk Space**: 200 MB
- **Permissions**: The app may request permission to execute commands

### Troubleshooting

**App won't open after installation**:

- Make sure you followed Step 4 (Remove Quarantine Attribute)
- Run the `xattr -cr /Applications/fpm.app` command if you haven't already

**"App is damaged" error**:

macOS may show: **"fpm.app is damaged and can't be opened. You should move it to the Trash."**

This happens because the app is not code-signed. To fix this:

1. **Remove quarantine attribute** (Recommended):

   ```bash
   xattr -cr /Applications/fpm.app
   ```

   Then try opening the app again.

2. **Alternative solutions**:
   - Re-download the `.zip` file (if download was corrupted)
   - If using Safari, try Chrome or Firefox
   - Make sure you extracted the `.zip` file before moving to Applications

**Note**: The `xattr -cr` command removes the quarantine flag that macOS adds to downloaded files. This is safe for apps you trust.

**Commands not executing**:

- Grant Terminal/Developer Tools permissions in System Settings
- Check that your commands are valid shell commands

**Config not saving**:

- Ensure the app has write permissions
- Check disk space availability

### Code Signing (For Official Distribution)

The current build is **not code-signed**. For official distribution:

1. **Get Apple Developer Account** ($99/year)
2. **Create certificates** in Apple Developer Portal
3. **Update package.json**:
   ```json
   "build": {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```
4. **Notarize the app** for Gatekeeper
5. **Rebuild**: `npm run package`

With code signing, users won't see security warnings.

## 📁 Project Structure

```
fpm/
├── electron/                    # Electron main process
│   ├── main.js                 # Main process entry
│   ├── preload.js              # IPC bridge
│   └── handlers/               # IPC handlers
│       ├── ipcHandlers.js      # IPC registration
│       ├── storageHandler.js   # File I/O
│       └── processHandler.js   # Process management
├── src/                        # React application
│   ├── components/
│   │   ├── Layout/
│   │   │   └── MainLayout.jsx
│   │   ├── Main/
│   │   │   ├── MainTab.jsx
│   │   │   ├── CategoryList.jsx
│   │   │   ├── CommandList.jsx
│   │   │   ├── CommandToggle.jsx
│   │   │   └── LogViewer.jsx
│   │   └── Settings/
│   │       └── SettingsTab.jsx
│   ├── contexts/
│   │   └── AppContext.jsx      # State management
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── index.jsx
├── docs/                       # Documentation
│   ├── DESIGN.md              # Design specification
│   └── superpowers/specs/     # Implementation specs
├── dist/                       # Build output
└── data/                       # Runtime data storage
```

## 💾 Data Storage

Configuration files are stored in:

```
~/Library/Application Support/fpm/
```

Files:

- `categories.json` - Category definitions
- `commands.json` - Command definitions
- `settings.json` - Application settings

## 🎯 Key Features Explained

### Category Management

- Create, edit, delete categories
- Drag ⋮⋮ icon to reorder
- Click ▶/▼ to collapse/expand
- Organize commands by project

### Command Management

- Create, edit, delete commands
- Drag ⋮⋮ icon to reorder within category
- Toggle switch to start/stop
- Real-time process status

### Drag & Drop

- Uses @dnd-kit (React 18 compatible)
- 8px distance threshold to prevent accidental drags
- Visual feedback during drag
- Keyboard accessible (Tab → Space → Arrow keys)

### Process Control

- Spawns commands in separate processes
- Automatic force kill on stop (SIGKILL)
- Real-time stdout/stderr streaming
- Error handling and display
- **Safety**: Commands shorter than 5 characters skip force kill to prevent killing unrelated processes

## 📋 Project Status

**Status**: ✅ Complete - All core features implemented and tested

### Recent Updates (2026-05-02)

- **Drag-Drop Migration**: Migrated to @dnd-kit for React 18 compatibility
- **UI Improvements**: Direct action buttons (Edit/Delete), expandable categories, better hover effects
- **Bug Fixes**: Fixed StrictMode issues, process management, dark mode visibility

### Future Enhancements (Optional)

- Command templates/snippets
- Search/filter commands
- Keyboard shortcuts
- Command history
- Export logs to file

## 📚 Documentation

- **Design Specification**: [docs/DESIGN.md](docs/DESIGN.md) - Architecture and design decisions
- **Feature Specs**: [docs/superpowers/specs/](docs/superpowers/specs/) - Detailed implementation specs

## 🔧 Development Notes

### Why @dnd-kit instead of react-beautiful-dnd?

- `react-beautiful-dnd` has compatibility issues with React 18 and StrictMode
- `@dnd-kit` is modern, actively maintained, and React 18 compatible
- Better performance using CSS transforms
- Built-in accessibility support

### IPC Communication

All Electron IPC is exposed via `window.electronAPI`:

- `loadCategories()` / `saveCategories()`
- `loadCommands()` / `saveCommands()`
- `loadSettings()` / `saveSettings()`
- `spawnProcess()` / `killProcess()`
- `onProcessOutput()` / `onProcessError()` / `onProcessExit()`

### State Management

- All state managed in `AppContext`
- Use `useApp()` hook to access state and actions
- Automatic persistence to JSON files

## 🎨 UI/UX

- Clean, minimal interface with optimized spacing
- Resizable panels with visual feedback (hover effects on separator)
- Sticky headers for Categories and Logs (scroll content, not headers)
- Compact button sizes and consistent styling
- Categories default to collapsed state for cleaner initial view
- Responsive layout with proper scrolling
- Minimum window size (900x600) to prevent layout issues
- Dark mode support
- Ant Design components for consistency
- Real-time updates and feedback

## 📝 License

ISC

## 🙏 Credits

Built with Electron, React, and Ant Design.
