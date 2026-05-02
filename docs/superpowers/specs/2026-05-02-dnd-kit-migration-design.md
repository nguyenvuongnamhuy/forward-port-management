# Drag-and-Drop Migration: react-beautiful-dnd → @dnd-kit

**Date:** 2026-05-02  
**Status:** Approved  
**Author:** Design Session with User

---

## Problem

The current drag-and-drop implementation using `react-beautiful-dnd` is not working. The library has compatibility issues with React 18 and StrictMode, causing errors like "Unable to find draggable" and "Cannot find droppable entry".

## Solution

Migrate to `@dnd-kit` - a modern, React 18-compatible drag-and-drop library with better performance and simpler API.

## Design

### 1. Dependencies

**Remove:**

- `react-beautiful-dnd@^13.1.1`

**Add:**

- `@dnd-kit/core@^6.0.0` - Core drag-and-drop functionality
- `@dnd-kit/sortable@^7.0.0` - Sortable list utilities
- `@dnd-kit/utilities@^3.2.0` - Helper utilities

### 2. Architecture

**CategoryList.jsx:**

```
DndContext (handles drag events)
├── SortableContext (manages sortable items)
│   └── SortableItem (each category)
│       ├── Drag Handle (⋮⋮ icon)
│       ├── Category Header
│       └── CommandList
```

**CommandList.jsx:**

```
DndContext (separate context per category)
├── SortableContext (manages commands)
│   └── SortableItem (each command)
│       ├── Drag Handle (⋮⋮ icon)
│       └── Command Content
```

### 3. Implementation Details

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

**Why these sensors:**

- `PointerSensor` with distance constraint prevents accidental drags when clicking
- `KeyboardSensor` enables accessibility (arrow keys to reorder)

**Drag Handle Implementation:**

```javascript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
  useSortable({ id: item.id });

// Apply listeners only to drag handle
<span {...listeners} {...attributes}>
  <HolderOutlined />
</span>;
```

**Visual Feedback:**

```javascript
const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
};
```

### 4. Event Handling

**onDragEnd for Categories:**

```javascript
function handleDragEnd(event) {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = categories.findIndex((c) => c.id === active.id);
  const newIndex = categories.findIndex((c) => c.id === over.id);

  const reordered = arrayMove(categories, oldIndex, newIndex);
  reorderCategories(reordered);
}
```

**onDragEnd for Commands:**

```javascript
function handleDragEnd(event) {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = commands.findIndex((c) => c.id === active.id);
  const newIndex = commands.findIndex((c) => c.id === over.id);

  const reordered = arrayMove(commands, oldIndex, newIndex);
  reorderCommands(categoryId, reordered);
}
```

### 5. UI/UX

**No changes to visual design:**

- Keep current layout and styling
- Keep drag handle icon (⋮⋮)
- Keep hover states and colors
- Keep spacing and borders

**Drag behavior:**

- 8px movement threshold before drag activates
- Opacity changes to 0.5 when dragging
- Smooth CSS transform animations
- Drop zones highlighted automatically by @dnd-kit

### 6. Accessibility

**Keyboard support:**

- Tab to focus on items
- Space to pick up item
- Arrow keys to move
- Space again to drop
- Escape to cancel

**Screen reader:**

- Proper ARIA labels from @dnd-kit
- Announces drag start/end
- Announces position changes

### 7. Migration Steps

1. Uninstall react-beautiful-dnd
2. Install @dnd-kit packages
3. Update CategoryList.jsx with new implementation
4. Update CommandList.jsx with new implementation
5. Test drag-and-drop functionality
6. Test keyboard navigation
7. Verify data persistence

### 8. Testing Checklist

- [ ] Drag categories up/down
- [ ] Drag commands within category
- [ ] Click events still work (toggle, edit, delete)
- [ ] Keyboard navigation works
- [ ] Order persists after drag
- [ ] No console errors
- [ ] Works with multiple categories
- [ ] Works with empty categories

### 9. Rollback Plan

If @dnd-kit doesn't work:

- Revert to simple up/down arrow buttons
- Remove all drag-and-drop dependencies
- Add ↑↓ buttons next to each item
- Use simple array index manipulation

---

## Success Criteria

1. Categories can be reordered by dragging
2. Commands can be reordered within their category
3. No conflicts with click events (toggle, edit, delete)
4. Order changes persist to JSON files
5. No console errors
6. Smooth animations during drag
