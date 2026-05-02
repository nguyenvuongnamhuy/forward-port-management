# FPM Redesign - Design Document

**Date:** 2026-05-02  
**Project:** Forward Port Management (FPM)  
**Author:** Design Session with User

---

## 1. Overview

This document outlines the design for rebuilding the Forward Port Management (FPM) application using Electron, React, and JavaScript. The original application was built with Swift/SwiftUI for macOS. This redesign simplifies the UI to 2 tabs while maintaining core functionality.

### Goals

- Rebuild FPM using Electron + React + JavaScript
- Simplify UI from 4 tabs to 2 tabs
- Maintain all essential features: category/command management, process control, logging
- Add drag-and-drop sorting for better UX
- Force kill by default (no checkbox needed)

### Non-Goals

- Cross-platform support (focus on macOS only for now)
- Advanced features beyond the original app
- TypeScript (keeping it simple with JavaScript)

---

## 2. Technology Stack

### Core Technologies

- **Electron** ^28.0.0 - Desktop app framework
- **React** ^18.2.0 - UI library
- **JavaScript** (ES6+) - Programming language
- **Ant Design** ^5.12.0 - UI component library
- **@dnd-kit** ^6.0.0 - Modern drag-and-drop (React 18 compatible)

### Build Tools

- **Vite** ^5.0.0 - Fast build tool and dev server
- **electron-builder** ^24.9.0 - Package and distribute app
- **concurrently** ^8.2.0 - Run multiple commands

### Development Tools

- **uuid** ^9.0.0 - Generate unique IDs
- Node.js built-in modules: `child_process`, `fs`, `path`

---

## 3. Architecture

### Electron Process Model

```
┌─────────────────────────────────────────┐
│         Main Process (Node.js)          │
│  - Window management                    │
│  - IPC event handling                   │
│  - Child process management             │
│  - File I/O (JSON storage)              │
│  - Process killing (pkill)              │
└──────────────┬──────────────────────────┘
               │ IPC Communication
               │ (ipcMain ↔ ipcRenderer)
┌──────────────┴──────────────────────────┐
│       Renderer Process (React)          │
│  - UI Components                        │
│  - State Management (Context API)       │
│  - Send commands via IPC                │
│  - Receive logs/status from main        │
└─────────────────────────────────────────┘
```

### Responsibilities

**Main Process:**

- Create and manage BrowserWindow
- Handle system operations (spawn/kill processes)
- Read/write JSON files for data persistence
- Listen to IPC events from renderer
- Forward process output to renderer

**Renderer Process:**

- Display UI with React components
- Manage application state (categories, commands, logs, settings)
- Send requests to main process via IPC
- Update UI when receiving events from main process

---

## 4. Project Structure

```
fpm/
├── package.json
├── electron/
│   ├── main.js                 # Main process entry point
│   ├── preload.js              # Preload script (IPC bridge)
│   └── handlers/
│       ├── processHandler.js   # Spawn/kill process logic
│       ├── storageHandler.js   # JSON file read/write
│       └── ipcHandlers.js      # Register all IPC handlers
├── src/                        # React application
│   ├── App.jsx                 # Root component
│   ├── index.jsx               # Entry point
│   ├── contexts/
│   │   └── AppContext.jsx      # Global state management
│   ├── components/
│   │   ├── Layout/
│   │   │   └── MainLayout.jsx  # Layout with tabs
│   │   ├── Settings/
│   │   │   └── SettingsTab.jsx # Settings tab
│   │   └── Main/
│   │       ├── MainTab.jsx     # Main tab (combined view)
│   │       ├── CategoryList.jsx
│   │       ├── CommandList.jsx
│   │       ├── LogViewer.jsx
│   │       └── CommandToggle.jsx
│   ├── utils/
│   │   └── ipc.js              # IPC helper functions
│   └── styles/
│       └── global.css
├── public/
│   └── index.html
└── data/                       # Created at runtime
    ├── categories.json
    ├── commands.json
    └── settings.json
```

---

## 5. Data Models

### Category

```javascript
{
  id: "uuid-string",           // Unique identifier
  name: "Project A",            // Display name
  order: 0                      // Sort order (0-based)
}
```

### Command

```javascript
{
  id: "uuid-string",           // Unique identifier
  name: "Database Proxy",       // Display name
  command: "gcloud sql proxy...", // Shell command to execute
  categoryId: "uuid-string",   // Parent category
  order: 0,                     // Sort order within category
  isRunning: false              // Runtime state (not persisted)
}
```

### Log Entry

```javascript
{
  id: "uuid-string",           // Unique identifier
  timestamp: "2026-05-02T14:30:00", // ISO timestamp
  categoryName: "Project A",    // Category name for display
  commandName: "Database Proxy", // Command name for display
  message: "🌐 Creating Tunnel Port...", // Log message
  isError: false                // Error flag for styling
}
```

### Settings

```javascript
{
  isDarkMode: false; // Dark mode preference
}
```

---

## 6. User Interface Design

### Tab Structure

The application has 2 main tabs:

1. **Settings Tab** - Configuration and data management
2. **Main Tab** - Combined category/command management and control panel

### Settings Tab

Modern card-based layout with three sections:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Appearance                                         │
│  ┌───────────────────────────────────────────────┐ │
│  │ ☀️ Light Mode                        [Switch] │ │
│  │ Easy on the eyes in low light                 │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Configuration                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📥 Import Configuration                       │ │
│  │ Load settings from a backup folder            │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📤 Export Configuration                       │ │
│  │ Save settings to a backup folder              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Updates                                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔄 Check for Updates              [Check]    │ │
│  │ Check if a new version is available           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**

- **Appearance**: Modern switch toggle with dynamic icon (Sun/Moon) and description
- **Configuration**: Card-style clickable items with hover effects
  - Import: Load settings from backup folder
  - Export: Save settings to backup folder
- **Updates**: Check for new versions from GitHub releases
  - Fetches latest release from GitHub API
  - Compares semantic versions automatically
  - Shows "Install Now" button when update available
  - Opens GitHub releases page in browser
  - Version auto-detected from package.json

### Main Tab Layout

Split view with categories/commands on the left and logs on the right:

```
┌─────────────────────────────────────────────────────┐
│  Main                                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │  Categories/Commands │  │   Log Viewer        │ │
│  │  (60% width)         │  │   (40% width)       │ │
│  │                      │  │                     │ │
│  │  📁 Project A   [⋮]  │  │  [Clear Logs]       │ │
│  │    ⚡ DB Proxy [ON]  │  │                     │ │
│  │    🔧 API Tunnel [OFF]│ │  14:30 Project A    │ │
│  │    [+ Add Command]   │  │  DB Proxy: 🌐...    │ │
│  │                      │  │                     │ │
│  │  📁 Project B   [⋮]  │  │  14:31 Project A    │ │
│  │    🔧 Redis [OFF]    │  │  DB Proxy: ✅...    │ │
│  │    [+ Add Command]   │  │                     │ │
│  │                      │  │  14:32 Project B    │ │
│  │  [+ Add Category]    │  │  Redis: 🛑...       │ │
│  └─────────────────────┘  └─────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Left Panel (Categories/Commands):**

- Collapsible category sections
- Drag handles for reordering categories
- Each category shows:
  - Category name with command count (e.g., "Project A (2/5)")
    - Running count in green (#52c41a) when > 0, gray (#999) when = 0
    - Total count in gray (#999)
  - Edit and Delete buttons (direct access, no dropdown)
  - List of commands
  - "Add Command" button
- Each command shows:
  - Command name
  - Toggle switch (ON/OFF)
  - Drag handle for reordering
  - Edit and Delete buttons (direct access)
- "Add Category" button at bottom

**Right Panel (Log Viewer):**

- Auto-scrolling log display
- Each log entry shows:
  - Timestamp
  - Category name
  - Command name
  - Message with emoji indicators
- "Clear Logs" button at top
- Color coding for errors (red text)

---

## 7. IPC Communication

### IPC Channels

**Renderer → Main (invoke/send):**

| Channel                 | Parameters                                          | Description                                    |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `storage:load`          | -                                                   | Load all data (categories, commands, settings) |
| `storage:save`          | `{ categories, commands }`                          | Save categories and commands                   |
| `storage:import`        | `{ folderPath }`                                    | Import config from folder                      |
| `storage:export`        | `{ folderPath }`                                    | Export config to folder                        |
| `storage:save-settings` | `{ settings }`                                      | Save settings                                  |
| `process:start`         | `{ commandId, command, categoryName, commandName }` | Start a command                                |
| `process:stop`          | `{ commandId }`                                     | Stop a command                                 |

**Main → Renderer (send):**

| Channel              | Parameters                                        | Description           |
| -------------------- | ------------------------------------------------- | --------------------- |
| `log:new`            | `{ categoryName, commandName, message, isError }` | New log entry         |
| `process:status`     | `{ commandId, isRunning }`                        | Process status update |
| `process:terminated` | `{ commandId, exitCode }`                         | Process ended         |

---

## 8. Data Flow

### Starting a Command

```
1. User clicks toggle switch to ON
   ↓
2. Renderer: Disable toggle, show loading
   ↓
3. Renderer → Main: IPC 'process:start' with command details
   ↓
4. Main Process:
   a. Force kill existing processes: pkill -9 -f <command>
   b. Wait 500ms for port release
   c. Send log: "🔧 Force killing existing processes..."
   d. Send log: "✅ Existing processes killed."
   e. Spawn new process: child_process.spawn('/bin/zsh', ['-c', command])
   f. Send log: "🌐 Creating Tunnel Port..."
   g. Listen to stdout/stderr
   h. Forward output as logs
   ↓
5. Main → Renderer: 'log:new' events
   ↓
6. Main → Renderer: 'process:status' { isRunning: true }
   ↓
7. Renderer: Update UI (enable toggle, show as running)
   ↓
8. Process runs...
   ↓
9. On process exit:
   Main → Renderer: 'process:terminated' { exitCode }
   Main → Renderer: 'log:new' with exit message
   ↓
10. Renderer: Update UI (show as stopped)
```

### Stopping a Command

```
1. User clicks toggle switch to OFF
   ↓
2. Renderer: Disable toggle
   ↓
3. Renderer → Main: IPC 'process:stop' with commandId
   ↓
4. Main Process:
   a. Terminate main process: process.kill()
   b. Kill sub-processes: pkill -f <command>
   c. Send log: "🛑 Request cancelled."
   ↓
5. Main → Renderer: 'process:terminated'
   ↓
6. Renderer: Update UI (enable toggle, show as stopped)
```

### Drag and Drop Reordering

```
1. User drags category/command to new position
   ↓
2. @dnd-kit: onDragEnd callback
   ↓
3. Renderer: Calculate new order values using arrayMove
   ↓
4. Renderer: Update local state
   ↓
5. Renderer → Main: IPC 'storage:save' with updated data
   ↓
6. Main: Write to JSON files
   ↓
7. UI reflects new order immediately (optimistic update)
```

---

## 9. State Management

### AppContext Structure

```javascript
const AppContext = {
  // Data
  categories: [],
  commands: [],
  logs: [],
  settings: { isDarkMode: false },

  // Runtime state
  runningCommands: Set<commandId>,

  // Actions
  loadData: () => {},
  addCategory: (name) => {},
  updateCategory: (id, updates) => {},
  deleteCategory: (id) => {},
  reorderCategories: (newOrder) => {},

  addCommand: (categoryId, name, command) => {},
  updateCommand: (id, updates) => {},
  deleteCommand: (id) => {},
  reorderCommands: (categoryId, newOrder) => {},

  toggleCommand: (commandId, isOn) => {},

  addLog: (entry) => {},
  clearLogs: () => {},

  toggleDarkMode: () => {},
  importConfig: (folderPath) => {},
  exportConfig: (folderPath) => {}
}
```

### State Flow

1. **Initial Load:**
   - App mounts → `loadData()` → IPC 'storage:load'
   - Main returns data → Update context state
   - UI renders with data

2. **User Actions:**
   - User interacts → Call context action
   - Action updates local state (optimistic)
   - Action sends IPC to main process
   - Main persists to disk

3. **Process Events:**
   - Main sends IPC events → Context receives
   - Context updates state → UI re-renders

---

## 10. Drag and Drop Implementation

### Library: @dnd-kit

**Implementation uses @dnd-kit with the following components:**

- `DndContext` - Manages drag and drop state
- `SortableContext` - Provides sortable functionality
- `useSortable` - Hook for sortable items
- `arrayMove` - Utility to reorder arrays

**Sensors Configuration:**

```javascript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px movement before drag starts
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);
```

**Category Reordering:**

```javascript
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext
    items={categories.map((c) => c.id)}
    strategy={verticalListSortingStrategy}
  >
    {categories.map((category) => (
      <SortableCategory key={category.id} category={category} />
    ))}
  </SortableContext>
</DndContext>
```

**Command Reordering (within category):**

```javascript
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext
    items={commands.map((c) => c.id)}
    strategy={verticalListSortingStrategy}
  >
    {commands.map((command) => (
      <SortableCommand key={command.id} command={command} />
    ))}
  </SortableContext>
</DndContext>
```

**Constraints:**

- Categories can only be reordered within the category list
- Commands can only be reordered within their parent category
- No cross-category command dragging (use edit to change category)
- 8px distance threshold prevents accidental drags
- Keyboard accessible (Tab → Space → Arrow keys)

---

## 11. Error Handling

### Process Errors

**Port Already in Use:**

- Solution: Force kill by default before starting
- Log: "🔧 Force killing existing processes..."
- Wait 500ms for port release
- Then start new process

**Command Not Found:**

- Catch spawn error
- Log: "❌ Command not found: <command>"
- Show error in UI with red text

**Process Crashes:**

- Listen to process exit event
- If exit code !== 0:
  - Log: "⚠️ Something went wrong (Code: X)"
- Update UI to show stopped state

### Data Errors

**JSON Parse Error:**

- On import: Show error toast "Invalid configuration file"
- On load: Use empty defaults, log error

**File Not Found:**

- On import: Show error toast "Configuration files not found"
- On load: Create new files with defaults

**Write Errors:**

- Show error toast "Failed to save configuration"
- Keep UI state, allow retry

### UI Errors

**IPC Timeout:**

- If no response after 5 seconds
- Show error toast "Operation timed out"
- Re-enable UI controls

**Invalid Input:**

- Validate before sending to main process
- Show inline validation errors
- Disable submit until valid

---

## 12. Data Persistence

### Storage Location

**macOS:** `~/Library/Application Support/fpm/`

**Files:**

- `categories.json` - Category definitions
- `commands.json` - Command definitions
- `settings.json` - Application settings

### File Format

**categories.json:**

```json
[
  {
    "id": "uuid-1",
    "name": "Project A",
    "order": 0
  },
  {
    "id": "uuid-2",
    "name": "Project B",
    "order": 1
  }
]
```

**commands.json:**

```json
[
  {
    "id": "uuid-1",
    "name": "Database Proxy",
    "command": "gcloud sql proxy...",
    "categoryId": "uuid-1",
    "order": 0
  }
]
```

**settings.json:**

```json
{
  "isDarkMode": false
}
```

### Save Strategy

- **Auto-save:** After every change (add/edit/delete/reorder)
- **Debounced:** 300ms delay to batch rapid changes
- **Atomic writes:** Write to temp file, then rename
- **Error recovery:** Keep previous version on write failure

### Import/Export

**Import:**

1. User selects folder
2. Validate JSON files exist
3. Parse and validate structure
4. Backup current data
5. Replace with imported data
6. Save to storage
7. Reload UI

**Export:**

1. User selects destination folder
2. Create `backup` subfolder
3. Write formatted JSON files
4. Show success message with path

---

## 13. UI/UX Details

### Loading States

- **Starting command:** Toggle shows spinner, disabled
- **Stopping command:** Toggle shows spinner, disabled
- **Loading data:** Show skeleton screens
- **Importing/Exporting:** Show modal with progress

### Confirmations

- **Delete category:** "Delete category and all its commands?"
- **Delete command:** "Delete this command?"
- **Import config:** "This will replace your current configuration. Continue?"

### Notifications

Use Ant Design's `message` component:

- **Success:** Green toast, 3 seconds
- **Error:** Red toast, 5 seconds
- **Info:** Blue toast, 3 seconds

### Keyboard Shortcuts

- `Cmd+,` - Open Settings tab
- `Cmd+1` - Switch to Main tab
- `Cmd+K` - Clear logs
- `Cmd+I` - Import config
- `Cmd+E` - Export config

### Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly log messages

---

## 14. Development Workflow

### Setup

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs:

- Vite dev server (port 5173)
- Electron in development mode
- Hot reload for React components

### Build

```bash
npm run build
```

Steps:

1. Vite builds React app to `dist/`
2. electron-builder packages app
3. Output: `release/fpm-<version>-arm64-mac.zip`

### Project Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"electron .\"",
    "build": "vite build && electron-builder",
    "preview": "vite preview"
  }
}
```

---

## 15. Testing Strategy

### Manual Testing Checklist

**Category Management:**

- [ ] Add category
- [ ] Edit category name
- [ ] Delete category (with confirmation)
- [ ] Drag-drop reorder categories
- [ ] Delete category with commands (cascade delete)

**Command Management:**

- [ ] Add command to category
- [ ] Edit command name and script
- [ ] Delete command (with confirmation)
- [ ] Drag-drop reorder commands within category
- [ ] Move command to different category (via edit)

**Process Control:**

- [ ] Start command (force kill + spawn)
- [ ] Stop command (terminate + pkill)
- [ ] Start multiple commands simultaneously
- [ ] Handle port conflicts
- [ ] Handle command not found errors
- [ ] Handle process crashes

**Logging:**

- [ ] View real-time logs
- [ ] Auto-scroll to bottom
- [ ] Clear logs
- [ ] Error logs show in red
- [ ] Timestamp format correct

**Settings:**

- [ ] Toggle dark mode
- [ ] Import valid config
- [ ] Import invalid config (error handling)
- [ ] Export config
- [ ] Settings persist across restarts

**Data Persistence:**

- [ ] Changes save automatically
- [ ] Data persists after app restart
- [ ] Handle corrupted JSON files

---

## 16. Future Enhancements (Out of Scope)

These features are not included in the initial version but could be added later:

- **Cross-platform support:** Windows and Linux builds
- **Command templates:** Pre-defined command templates
- **Environment variables:** Support for env vars in commands
- **Command history:** Track command execution history
- **Search/filter:** Search categories and commands
- **Themes:** Custom color themes beyond dark/light
- **Backup scheduling:** Automatic periodic backups
- **Command groups:** Run multiple commands together
- **Status indicators:** Visual indicators for connection health
- **Notifications:** System notifications for events

---

## 17. Security Considerations

### Command Execution

- Commands run in user's shell context
- No sandboxing (same as original Swift app)
- User responsible for command safety
- Display full command before execution

### Data Storage

- JSON files stored in user's Application Support
- No encryption (local files only)
- No network communication
- No telemetry or analytics

### Permissions

**macOS Permissions Required:**

- Developer Tools (for executing commands)
- File system access (for import/export)

---

## 18. Migration from Swift Version

### Data Migration

The Swift version stores data in:
`~/Library/Application Support/forwardPortManagementApp/`

The Electron version will use:
`~/Library/Application Support/fpm/`

**Migration steps:**

1. User exports config from Swift app
2. User imports config into Electron app
3. Data structure is compatible (same JSON format)

### Feature Parity

| Feature        | Swift App        | Electron App              |
| -------------- | ---------------- | ------------------------- |
| Categories     | ✅               | ✅                        |
| Commands       | ✅               | ✅                        |
| Control Panel  | ✅               | ✅ (merged into Main tab) |
| Settings       | ✅               | ✅                        |
| Dark Mode      | ✅               | ✅                        |
| Import/Export  | ✅               | ✅                        |
| Force Kill     | ✅ Checkbox      | ✅ Always on              |
| Drag-drop Sort | ❌ Arrow buttons | ✅ Drag-drop              |
| Real-time Logs | ✅               | ✅                        |

---

## 19. Success Criteria

The redesign is successful if:

1. **Functional parity:** All core features from Swift app work correctly
2. **Simplified UI:** 2-tab interface is intuitive and efficient
3. **Performance:** Commands start/stop within 1 second
4. **Stability:** No crashes during normal operation
5. **Data integrity:** No data loss during save/load operations
6. **User experience:** Drag-drop sorting is smooth and responsive
7. **Build success:** Can build .zip file for distribution

---

## 20. Implementation Plan Overview

The implementation will follow these phases:

1. **Project Setup:** Initialize Electron + React + Vite project
2. **Main Process:** Implement IPC handlers and process management
3. **Data Layer:** Implement storage handlers (read/write JSON)
4. **UI Components:** Build React components (Settings, Main tabs)
5. **State Management:** Implement AppContext with all actions
6. **Drag-Drop:** Integrate @dnd-kit for drag-and-drop functionality
7. **Styling:** Apply Ant Design theme and custom styles
8. **Testing:** Manual testing of all features
9. **Build:** Configure electron-builder for macOS (ZIP output)
10. **Documentation:** Update README with new instructions

Detailed implementation steps will be created in a separate implementation plan document.

---

## Conclusion

This design provides a complete blueprint for rebuilding the FPM application using Electron, React, and JavaScript. The simplified 2-tab interface maintains all essential functionality while improving user experience with drag-and-drop sorting and always-on force kill. The architecture is straightforward, leveraging Electron's IPC for clean separation between UI and system operations.
