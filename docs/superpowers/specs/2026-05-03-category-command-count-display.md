# Category Command Count Display

**Date:** 2026-05-03  
**Status:** Completed  
**Author:** Design Session with User

---

## Problem

Users cannot quickly see how many commands are in each category or how many are currently running without expanding the category. This makes it difficult to get an overview of the system state at a glance.

## Solution

Display command counts inline with the category name in the format: **Category Name (running/total)**

Example: **Project A (2/5)** means 2 commands are running out of 5 total commands.

---

## Design

### Visual Format

**Display Pattern:**

```
Category Name (running/total)
```

**Examples:**

- `Project A (2/5)` - 2 commands running, 5 total
- `Project B (0/3)` - No commands running, 3 total
- `Project C (5/5)` - All 5 commands running
- `Empty Category (0/0)` - No commands in category

### Color Scheme

**Running count (first number):**

- Green `#52c41a` when > 0 (indicates active commands)
- Gray `#999` when = 0 (no active commands)

**Separator and total (/ and second number):**

- Gray `#999` (neutral, informational)

**Visual Examples:**

- `Project A (2/5)` - "2" is green, "/5" is gray
- `Project B (0/3)` - "0/3" all gray
- `Project C (5/5)` - "5" is green, "/5" is gray

### Layout Position

```
[Drag] [Arrow] [Folder] Category Name (2/5) ......... [Edit] [Delete]
                                      ^^^^^^
                                      Added here
```

The count appears immediately after the category name with a small left margin (4px) to separate it visually.

---

## Implementation

### File Changes

**Only one file needs modification:**

- `src/components/Main/CategoryList.jsx`

### Component Logic

**In SortableCategory component:**

1. **Import useApp hook** (already imported)
2. **Access commands and runningCommands from context**
3. **Calculate counts:**

   ```javascript
   const { commands, runningCommands } = useApp();

   // Filter commands for this category
   const categoryCommands = commands.filter(
     (cmd) => cmd.categoryId === category.id,
   );
   const totalCommands = categoryCommands.length;
   const runningCount = categoryCommands.filter((cmd) =>
     runningCommands.has(cmd.id),
   ).length;
   ```

4. **Render count inline with category name:**
   ```jsx
   <span style={{ fontSize: 14, fontWeight: 500 }}>
     {category.name}
     <span style={{ marginLeft: 4, fontWeight: 400 }}>
       (
       <span style={{ color: runningCount > 0 ? "#52c41a" : "#999" }}>
         {runningCount}
       </span>
       <span style={{ color: "#999" }}>/</span>
       <span style={{ color: "#999" }}>{totalCommands}</span>)
     </span>
   </span>
   ```

### Styling Details

**Typography:**

- Category name: `fontSize: 14px`, `fontWeight: 500` (unchanged)
- Count display: `fontSize: 14px`, `fontWeight: 400` (slightly lighter)
- Left margin: `4px` (spacing between name and count)

**Colors:**

- Running count (active): `#52c41a` (Ant Design green-6)
- Running count (zero): `#999` (gray)
- Separator and total: `#999` (gray)

**Behavior:**

- Count updates automatically when commands are toggled on/off
- Count updates when commands are added/deleted
- No user interaction needed - purely informational display

---

## Data Flow

1. **AppContext** provides:
   - `commands` array - all commands with their `categoryId`
   - `runningCommands` Set - IDs of currently running commands

2. **CategoryList** component:
   - Receives category data via props
   - Accesses global commands and runningCommands from context
   - Filters commands by categoryId
   - Counts running commands by checking runningCommands Set
   - Renders count inline with category name

3. **Real-time updates:**
   - When user toggles a command → `runningCommands` updates → count re-renders
   - When user adds/deletes command → `commands` updates → count re-renders
   - React's state management handles all updates automatically

---

## Edge Cases

### Empty Category (0/0)

- Display: `Category Name (0/0)`
- Color: All gray (no green since no commands exist)
- Behavior: Normal, no special handling needed

### All Commands Running (5/5)

- Display: `Category Name (5/5)`
- Color: "5" is green, "/5" is gray
- Visual feedback: User can see all commands are active

### Long Category Names

- Count wraps naturally with the text
- No truncation needed - existing layout handles overflow
- Edit/Delete buttons remain on the right

### Performance

- Filtering is O(n) per category, acceptable for typical use (< 100 commands)
- No memoization needed unless performance issues arise
- React re-renders only when commands or runningCommands change

---

## Testing Checklist

### Functionality

- [ ] Count displays correctly for categories with commands
- [ ] Count shows (0/0) for empty categories
- [ ] Running count updates when toggling commands on
- [ ] Running count updates when toggling commands off
- [ ] Total count updates when adding commands
- [ ] Total count updates when deleting commands
- [ ] Count updates when moving commands between categories

### Visual

- [ ] Running count is green when > 0
- [ ] Running count is gray when = 0
- [ ] Separator (/) is always gray
- [ ] Total count is always gray
- [ ] Spacing (4px) looks good between name and count
- [ ] Font weight (400) is readable but not too bold
- [ ] Colors match Ant Design theme

### Edge Cases

- [ ] Works with empty categories (0/0)
- [ ] Works with all commands running (5/5)
- [ ] Works with long category names
- [ ] Works with single-digit counts (1/2)
- [ ] Works with double-digit counts (12/15)
- [ ] No layout breaks or overflow issues

### Integration

- [ ] Doesn't interfere with drag-and-drop
- [ ] Doesn't interfere with expand/collapse
- [ ] Doesn't interfere with edit/delete buttons
- [ ] Doesn't affect text selection of category name
- [ ] No console errors or warnings

---

## Success Criteria

1. **At-a-glance visibility:** Users can see command counts without expanding categories
2. **Status awareness:** Green color clearly indicates active commands
3. **Accurate counts:** Numbers update in real-time as commands are toggled
4. **Clean integration:** Fits naturally into existing UI without disruption
5. **No regressions:** All existing functionality continues to work

---

## Impact Analysis

### Files Modified

- `src/components/Main/CategoryList.jsx` - Add command count display

### No Changes Required

- `src/components/Main/CommandList.jsx` - Not affected
- `src/components/Main/CommandToggle.jsx` - Not affected
- `src/contexts/AppContext.jsx` - No data structure changes
- `electron/handlers/*` - No backend changes
- Data persistence - No changes

### Backward Compatibility

- No data migration needed
- No breaking changes
- All existing features remain intact
- Pure UI enhancement

---

## Future Enhancements (Out of Scope)

- Tooltip on hover showing "2 running / 5 total commands"
- Click on count to toggle all commands on/off
- Visual indicator (icon) next to count for better recognition
- Animation when count changes
- Filter/search by command count
