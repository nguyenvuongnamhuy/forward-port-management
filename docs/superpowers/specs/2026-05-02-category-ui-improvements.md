# Category & Command UI Improvements

**Date:** 2026-05-02  
**Status:** Completed  
**Author:** Design Session with User

---

## Problem

Three UX issues with the current interface:

1. **Hidden Actions (Category):** Edit and Delete actions are hidden inside a dropdown menu (⋮ button), requiring extra clicks to access common operations.
2. **Hidden Actions (Command):** Same issue - Edit and Delete actions hidden in dropdown menu.
3. **Limited Expand Area:** Categories can only be expanded/collapsed by clicking the small arrow icon, making it harder to interact with.

## Solution

1. **Direct Action Buttons (Category & Command):** Replace the dropdown menu with two visible icon buttons (Edit and Delete) for faster access.
2. **Expanded Clickable Area (Category):** Allow clicking on the folder icon + category name to expand/collapse, while preserving text selection capability.

---

## Design

### 1. Replace Dropdown Menu with Direct Action Icons

**Current Layout:**

```
[Drag] [Arrow] [Folder] Category Name ............... [⋮ Dropdown]
```

**New Layout:**

```
[Drag] [Arrow] [Folder] Category Name ......... [✏️ Edit] [🗑️ Delete]
```

**Implementation Details:**

**Icons:**

- Edit: `EditOutlined` from `@ant-design/icons`
- Delete: `DeleteOutlined` from `@ant-design/icons`

**Component Structure:**

```jsx
// Remove Dropdown component
<Dropdown menu={{ items: getCategoryMenuItems() }} trigger={["click"]}>
  <Button type="text" size="small" icon={<MoreOutlined />} />
</Dropdown>

// Replace with direct buttons
<Button
  type="text"
  size="small"
  icon={<EditOutlined />}
  onClick={() => onEdit(category)}
  className="category-edit-btn"
  style={{ padding: '0 4px', minWidth: 24, height: 24 }}
/>
<Button
  type="text"
  size="small"
  icon={<DeleteOutlined />}
  onClick={() => onDelete(category)}
  className="category-delete-btn"
  style={{ padding: '0 4px', minWidth: 24, height: 24 }}
/>
```

**Styling:**

- Default color: `#999` (gray)
- Edit hover: `#1890ff` (blue) with `scale(1.1)`
- Delete hover: `#ff4d4f` (red) with `scale(1.1)`
- Transition: `0.2s ease`
- Size: 24x24px (same as current dropdown button)
- Spacing: 4px between buttons

**Behavior:**

- Edit button: Opens edit category modal
- Delete button: Shows confirmation modal
- No impact on drag functionality
- Buttons remain visible at all times

### 2. Expandable Category Row

**Clickable Areas for Expand/Collapse:**

```
[Drag] [Arrow ← click] [Folder + Text ← click] ......... [Edit] [Delete]
       └─────────────────────────────┘
              Expandable area
```

**Implementation Details:**

**Clickable Area:**

- Arrow icon: Keep existing onClick handler
- Add wrapper div around `FolderOutlined + category name`
- Wrapper has same onClick handler as arrow
- Total expandable area: arrow icon + folder icon + category name text

**Text Selection Support:**

```javascript
const [mouseDownPos, setMouseDownPos] = useState(null);

const handleMouseDown = (e) => {
  setMouseDownPos({ x: e.clientX, y: e.clientY });
};

const handleMouseUp = (e) => {
  if (!mouseDownPos) return;

  const deltaX = Math.abs(e.clientX - mouseDownPos.x);
  const deltaY = Math.abs(e.clientY - mouseDownPos.y);

  // If movement < 5px, treat as click (not drag/select)
  if (deltaX < 5 && deltaY < 5) {
    onToggleCollapse(category.id);
  }

  setMouseDownPos(null);
};
```

**Logic:**

- Track mouse position on mouseDown
- On mouseUp, calculate distance moved
- If moved < 5px: treat as click → expand/collapse
- If moved ≥ 5px: treat as text selection → don't expand
- This allows users to select text by dragging

**Visual Feedback:**

- Cursor: `pointer` when hovering over folder + text area
- Hover effect: text color changes to `#1890ff` (blue)
- Transition: `0.2s ease`
- Clear visual indication that area is clickable

**Accessibility:**

- Add `role="button"` to clickable area
- Add `aria-label="Expand or collapse category"`
- Keyboard support: Space/Enter to expand (if focused)
- Maintain existing keyboard navigation

### 3. Complete Component Structure

**Updated CategoryList.jsx - SortableCategory component:**

```jsx
function SortableCategory({
  category,
  onEdit,
  onDelete,
  isCollapsed,
  onToggleCollapse,
}) {
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "rgba(0, 0, 0, 0.02)" : "transparent",
  };

  const handleToggle = () => {
    onToggleCollapse(category.id);
  };

  const handleMouseDown = (e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (!mouseDownPos) return;

    const deltaX = Math.abs(e.clientX - mouseDownPos.x);
    const deltaY = Math.abs(e.clientY - mouseDownPos.y);

    if (deltaX < 5 && deltaY < 5) {
      handleToggle();
    }

    setMouseDownPos(null);
  };

  return (
    <div ref={setNodeRef} style={style} className="category-item">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: isCollapsed ? 0 : 8,
        }}
      >
        {/* Drag handle - unchanged */}
        <span
          {...listeners}
          {...attributes}
          style={{
            cursor: "move",
            marginRight: 6,
            display: "flex",
            alignItems: "center",
            color: "#999",
            fontSize: 12,
          }}
        >
          <HolderOutlined />
        </span>

        {/* Arrow icon - unchanged */}
        <span
          onClick={handleToggle}
          style={{
            cursor: "pointer",
            marginRight: 6,
            display: "flex",
            alignItems: "center",
            color: "#666",
            fontSize: 12,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#3b82f6";
            e.currentTarget.style.transform = "scale(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#666";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isCollapsed ? <RightOutlined /> : <DownOutlined />}
        </span>

        {/* Folder + Name - NEW: clickable to expand */}
        <div
          onClick={handleToggle}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          role="button"
          aria-label="Expand or collapse category"
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            cursor: "pointer",
            userSelect: "text",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1890ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "inherit";
          }}
        >
          <FolderOutlined
            style={{ marginRight: 6, fontSize: 14, color: "#1890ff" }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{category.name}</span>
        </div>

        {/* Action buttons - NEW: direct buttons instead of dropdown */}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(category)}
          className="category-edit-btn"
          style={{
            padding: "0 4px",
            minWidth: 24,
            height: 24,
            marginLeft: 4,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1890ff";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "inherit";
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(category)}
          className="category-delete-btn"
          style={{
            padding: "0 4px",
            minWidth: 24,
            height: 24,
            marginLeft: 4,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ff4d4f";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "inherit";
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
      </div>

      {/* Commands - unchanged */}
      {!isCollapsed && <CommandList categoryId={category.id} />}
    </div>
  );
}
```

### 4. Import Changes

**Remove:**

```javascript
import { Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
```

**Add:**

```javascript
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
```

**Keep all existing imports:**

- React, useState
- Card, Button, Input, Modal, Form (from antd)
- PlusOutlined, FolderOutlined, HolderOutlined, DownOutlined, RightOutlined
- All @dnd-kit imports
- useApp hook
- CommandList component

---

## Impact Analysis

### Files Modified

- `src/components/Main/CategoryList.jsx` - Category improvements (dropdown → direct buttons, expandable area)
- `src/components/Main/CommandList.jsx` - Command improvements (dropdown → direct buttons)

### No Changes Required

- `src/components/Main/CommandToggle.jsx` - Not affected
- `src/contexts/AppContext.jsx` - No data structure changes
- `electron/handlers/*` - No backend changes
- Data persistence logic - No changes

### Backward Compatibility

- No data migration needed
- No breaking changes to existing functionality
- All existing features remain intact

---

## Testing Checklist

### Functionality Tests

- [ ] Edit button opens edit modal with correct category data
- [ ] Delete button shows confirmation modal
- [ ] Confirmation modal deletes category and all commands
- [ ] Click on arrow icon expands/collapses category
- [ ] Click on folder icon expands/collapses category
- [ ] Click on category name expands/collapses category
- [ ] Text selection works by dragging over category name
- [ ] Drag handle still works for reordering categories
- [ ] No conflicts between drag-to-reorder and click-to-expand

### Visual Tests

- [ ] Edit button shows blue color on hover
- [ ] Delete button shows red color on hover
- [ ] Both buttons scale up (1.1x) on hover
- [ ] Folder + name area shows pointer cursor on hover
- [ ] Folder + name area text turns blue on hover
- [ ] Transitions are smooth (0.2s ease)
- [ ] Layout doesn't break with long category names
- [ ] Buttons align properly on the right side

### Edge Cases

- [ ] Works with empty categories (no commands)
- [ ] Works with many categories (scrolling)
- [ ] Works with very long category names
- [ ] Text selection works with single-word names
- [ ] Text selection works with multi-word names
- [ ] No console errors or warnings

### Accessibility Tests

- [ ] Keyboard navigation works (Tab to focus)
- [ ] Space/Enter on folder+name area expands category
- [ ] Screen reader announces clickable area properly
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards

---

## Success Criteria

1. **Faster Access:** Edit and Delete actions are immediately visible and accessible with one click
2. **Better UX:** Larger clickable area for expanding categories improves usability
3. **Text Selection:** Users can still select and copy category names by dragging
4. **No Regressions:** All existing functionality (drag-drop, modals, data persistence) works correctly
5. **Visual Polish:** Hover effects and transitions provide clear feedback
6. **Accessibility:** Keyboard navigation and screen readers work properly

---

## Rollback Plan

If issues arise:

1. Revert `CategoryList.jsx` to previous version
2. Restore dropdown menu implementation
3. Remove new click handlers
4. All data remains intact (no data changes)

---

## Future Enhancements (Out of Scope)

- Keyboard shortcuts for edit/delete (e.g., E for edit, Del for delete)
- Inline editing of category name (double-click to edit)
- Undo/redo for delete operations
- Bulk operations (select multiple categories)
