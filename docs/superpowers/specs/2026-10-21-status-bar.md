# macOS Menu Bar Status Item

**Date:** 2026-10-21
**Status:** Completed
**Author:** Design Session with User

---

## Problem

FPM manages long-running port-forwarding processes, but the app window must be open (and in the foreground) to:

1. See how many commands are currently running — counts are only visible per-category (`Project A (2/5)`).
2. Start/stop a command — no quick control without switching windows.
3. Stop everything at once — each command must be toggled off individually.

The user asked for a status bar in the **macOS menu bar** (where the Wi-Fi/battery icons sit), so FPM state is glanceable and controllable even when the window is closed or unfocused.

## Solution

An Electron `Tray` status item in the macOS menu bar:

- **⇄ glyph icon** (template image, adapts to light/dark menu bar and Retina) with the **live running count** rendered as text next to it (hidden when idle).
- **Context menu** rebuilt fresh on every open from `loadAllData()` + current process state — always in sync with edits made in the app window:
  - Header label: `2 commands running` / `No commands running`
  - Per category (sorted by `order`): disabled section label + one **checkbox item per command** — checked = running; clicking toggles the process
  - **Stop All (N)** — disabled when nothing is running
  - **Open FPM** — shows/focuses the window
  - **Quit FPM** — real quit (bypasses close-to-hide)

---

## Alternatives Considered

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| **macOS menu bar tray item** | Glanceable + controllable without the window; exactly what was asked; no renderer changes | Main-process work only | ✅ Chosen |
| In-window footer status bar (VS Code style) | Trivial to build from AppContext | Invisible when window closed/unfocused — misses the point of tunnels running in background | Rejected (built, then reverted after clarification) |
| Menu bar icon only (no menu) | Minimal | Not actionable | Subsumed |

---

## Design

### Menu Bar Appearance

```
Light:   …   [⇄ 2]        Dark:   …   [⇄ 2]        Idle:   …   [⇄]
```

- Icon: 16×16 (plus `@2x` 32×32) black RGBA PNG loaded via `nativeImage` + `setTemplateImage(true)` — macOS tints it for light/dark menu bars automatically.
- Count: `tray.setTitle(String(runningCount))`, empty string when 0 running.
- Tooltip: `FPM — N running` / `FPM — no commands running`.

### Menu Structure

```
┌────────────────────────────┐
│ 2 commands running         │  (disabled)
├────────────────────────────┤
│ Project A                  │  (disabled section label)
│   ✓ Database Proxy         │  (checkbox; checked = running)
│   ☐ API Tunnel             │
├────────────────────────────┤
│ Project B                  │
│   ☐ Redis                  │
├────────────────────────────┤
│ Stop All (2)               │  (disabled when 0 running)
├────────────────────────────┤
│ Open FPM                   │
│ Quit FPM                   │
└────────────────────────────┘
```

### State Sync

- `processHandler.js` now exposes `getRunningCommandIds()` and `onProcessStateChange(cb)`; `notifyStateChange()` fires at every mutation of `runningProcesses` (start set, error delete, exit delete, stop delete).
- `main.js` wires `onProcessStateChange(updateTrayTitle)` so the count updates the moment any process starts/stops/crashes — regardless of whether it was triggered from the app UI, the tray, or the process dying on its own.
- The menu is **not** registered permanently via `setContextMenu`. Both `click` and `right-click` rebuild it via `loadAllData()` + `popUpContextMenu(menu)`, so config edits in the renderer are always reflected (no IPC needed to signal edits).

### Window Behavior (tray-app convention)

- Closing the window **hides** it; the app stays alive in the menu bar (and Dock).
- `Open FPM` / Dock `activate` re-shows it.
- Real quit only via tray `Quit FPM` or `Cmd+Q` (`before-quit` sets `app.isQuitting` so the close handler lets the window die).

---

## Implementation

### Files Changed

| File | Change |
| --- | --- |
| `electron/tray.js` | **New** — tray creation, icon, count title, dynamic menu |
| `electron/assets/tray-icon-Template.png` / `@2x.png` | **New** — ⇄ template icons |
| `electron/assets/generate-tray-icon.js` | **New** — regenerates the icons (`node generate-tray-icon.js`) |
| `electron/handlers/processHandler.js` | Add `getRunningCommandIds`, `onProcessStateChange`, `notifyStateChange` at the 4 process-map mutation sites |
| `electron/main.js` | Create tray; hook title updates to process state; close-to-hide; `before-quit` flag; `activate` re-shows hidden window |

### No Changes Required

- Renderer (`src/**`) — the app UI already reacts to `process:status` / `process:terminated` events, so toggles started/stopped from the menu bar reflect instantly in the window.
- IPC contracts — tray reuses existing `startCommand`/`stopCommand`/`loadAllData` modules directly in-process.
- Data persistence — no schema changes.

---

## Testing Checklist

### Menu Bar Item

- [ ] Icon appears in the menu bar on launch (light and dark menu bar, Retina)
- [ ] Count appears next to icon when a command starts; disappears when all stop
- [ ] Count updates when a process crashes or exits on its own
- [ ] Tooltip reflects state

### Menu

- [ ] Menu reflects current categories/commands, sorted by order; empty categories hidden
- [ ] Checkboxes match running state on open
- [ ] Clicking a stopped command starts it; window UI toggle flips to ON
- [ ] Clicking a running command stops it; window UI toggle flips to OFF
- [ ] Stop All stops everything and disables itself when idle
- [ ] Adding/editing commands in the app, then reopening the menu, shows the changes
- [ ] Config with no commands shows header + Stop All (disabled) + Open/Quit only

### Window Behavior

- [ ] Red close button hides the window; app keeps running (menu bar count still live)
- [ ] Open FPM re-shows and focuses the window
- [ ] Dock click re-shows the window
- [ ] Quit FPM fully exits (process gone from Activity Monitor)
- [ ] Cmd+Q quits even when window is hidden

---

## Future Enhancements (Out of Scope)

- Per-command uptime in the menu
- Start All / category-level start-stop
- Dock icon badge with running count
- Hidden-window notification on process crash
