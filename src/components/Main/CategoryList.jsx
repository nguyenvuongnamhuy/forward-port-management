import React, { useState } from "react";
import { Card, Button, Input, Modal, Form } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, HolderOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApp } from "../../contexts/AppContext";
import CommandList from "./CommandList";

function SortableCategory({ category, onEdit, onDelete, isCollapsed, onToggleCollapse }) {
  const { commands, runningCommands } = useApp();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  // Calculate command counts for this category
  const categoryCommands = commands.filter((cmd) => cmd.categoryId === category.id);
  const totalCommands = categoryCommands.length;
  const runningCount = categoryCommands.filter((cmd) => runningCommands.has(cmd.id)).length;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
  };

  const handleToggle = () => {
    onToggleCollapse(category.id);
  };

  const handleNameClick = (e) => {
    // Only toggle if not selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length === 0) {
      handleToggle();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="category-item">
      <div style={{ display: "flex", alignItems: "center", marginBottom: isCollapsed ? 0 : 8 }}>
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
            cursor: 'pointer',
            marginRight: 6,
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            fontSize: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isCollapsed ? <RightOutlined /> : <DownOutlined />}
        </span>

        {/* Folder + Name - NEW: clickable to expand */}
        <div
          onClick={handleNameClick}
          role="button"
          aria-label="Expand or collapse category"
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            cursor: 'pointer',
            userSelect: 'text',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit';
          }}
        >
          <FolderOutlined style={{ marginRight: 6, fontSize: 14, color: '#1890ff' }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {category.name}
            <span style={{ marginLeft: 4, fontWeight: 400 }}>
              (
              <span style={{ color: runningCount > 0 ? '#52c41a' : '#999' }}>
                {runningCount}
              </span>
              <span style={{ color: '#999' }}>/</span>
              <span style={{ color: '#999' }}>{totalCommands}</span>
              )
            </span>
          </span>
        </div>

        {/* Action buttons - NEW: direct buttons instead of dropdown */}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(category)}
          className="category-edit-btn"
          style={{
            padding: '0 4px',
            minWidth: 24,
            height: 24,
            marginLeft: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1890ff';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(category)}
          className="category-delete-btn"
          style={{
            padding: '0 4px',
            minWidth: 24,
            height: 24,
            marginLeft: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff4d4f';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>
      {!isCollapsed && <CommandList categoryId={category.id} />}
    </div>
  );
}

function CategoryList() {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  // Initialize with all categories collapsed
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    return new Set(categories.map(cat => cat.id));
  });
  const [form] = Form.useForm();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddCategory = (values) => {
    addCategory(values.name);
    setIsAddModalOpen(false);
    form.resetFields();
  };

  const handleEditCategory = (values) => {
    updateCategory(editingCategory.id, { name: values.name });
    setEditingCategory(null);
    form.resetFields();
  };

  const handleDeleteCategory = (category) => {
    Modal.confirm({
      title: "Delete Category",
      content: `Delete category "${category.name}" and all its commands?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => deleteCategory(category.id),
    });
  };

  const handleToggleCollapse = (categoryId) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
    const newIndex = sortedCategories.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(sortedCategories, oldIndex, newIndex);
    reorderCategories(reordered);
  };

  return (
    <>
      <Card
        title={<span className="gradient-text" style={{ fontWeight: 600 }}>Categories & Commands</span>}
        size="small"
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
            }}
          >
            Add Category
          </Button>
        }
        style={{ height: "100%" }}
        bodyStyle={{ padding: '0' }}
        className="modern-card"
      >
        <div style={{ height: 'calc(100vh - 176px)', overflow: 'auto', padding: '12px' }}>
        {sortedCategories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#999", fontSize: 13 }}>
            No categories yet. Click "Add Category" to get started.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedCategories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onEdit={setEditingCategory}
                  onDelete={handleDeleteCategory}
                  isCollapsed={collapsedCategories.has(category.id)}
                  onToggleCollapse={handleToggleCollapse}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
        </div>
      </Card>

      <Modal
        title="Add Category"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddCategory} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter a category name" }]}
          >
            <Input placeholder="e.g., Project A" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Category"
        open={!!editingCategory}
        onCancel={() => {
          setEditingCategory(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        afterOpenChange={(open) => {
          if (open && editingCategory) {
            form.setFieldsValue({ name: editingCategory.name });
          }
        }}
      >
        <Form form={form} onFinish={handleEditCategory} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter a category name" }]}
          >
            <Input placeholder="e.g., Project A" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default CategoryList;
