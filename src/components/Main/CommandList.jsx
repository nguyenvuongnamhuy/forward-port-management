import React, { useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, HolderOutlined } from "@ant-design/icons";
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
import CommandToggle from "./CommandToggle";

function SortableCommand({ command, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: command.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 6,
    padding: 8,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    gap: 8,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
  };

  return (
    <div ref={setNodeRef} style={style} className="command-item">
      <span
        {...listeners}
        {...attributes}
        style={{
          cursor: "move",
          display: "flex",
          alignItems: "center",
          color: "#999",
          fontSize: 12,
        }}
      >
        <HolderOutlined />
      </span>
      <ThunderboltOutlined style={{ color: "#1890ff", fontSize: 13 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, marginBottom: 2, fontSize: 13 }}>
          {command.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#999",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {command.command}
        </div>
      </div>
      <CommandToggle commandId={command.id} />
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={() => onEdit(command)}
        className="command-edit-btn"
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
        onClick={() => onDelete(command)}
        className="command-delete-btn"
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
  );
}

function CommandList({ categoryId }) {
  const { commands, addCommand, updateCommand, deleteCommand, reorderCommands } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
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

  const categoryCommands = commands
    .filter((cmd) => cmd.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);

  const handleAddCommand = (values) => {
    addCommand(categoryId, values.name, values.command);
    setIsAddModalOpen(false);
    form.resetFields();
  };

  const handleEditCommand = (values) => {
    updateCommand(editingCommand.id, {
      name: values.name,
      command: values.command,
    });
    setEditingCommand(null);
    form.resetFields();
  };

  const handleDeleteCommand = (command) => {
    Modal.confirm({
      title: "Delete Command",
      content: `Delete command "${command.name}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => deleteCommand(command.id),
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categoryCommands.findIndex((c) => c.id === active.id);
    const newIndex = categoryCommands.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(categoryCommands, oldIndex, newIndex);
    reorderCommands(categoryId, reordered);
  };

  return (
    <div>
      {categoryCommands.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryCommands.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {categoryCommands.map((command) => (
              <SortableCommand
                key={command.id}
                command={command}
                onEdit={(cmd) => {
                  setEditingCommand(cmd);
                  form.setFieldsValue({
                    name: cmd.name,
                    command: cmd.command,
                  });
                }}
                onDelete={handleDeleteCommand}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {categoryCommands.length === 0 && (
        <div style={{ textAlign: "center", padding: "12px", color: "#999", fontSize: 12 }}>
          No commands in this category
        </div>
      )}

      <Button
        type="default"
        size="middle"
        icon={<PlusOutlined style={{ fontSize: 14 }} />}
        onClick={() => setIsAddModalOpen(true)}
        block
        style={{
          marginTop: 12,
          height: '40px',
          borderRadius: '8px',
          border: '2px dashed #3b82f6',
          color: '#3b82f6',
          fontWeight: 500,
          fontSize: 13,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)';
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Add Command
      </Button>

      <Modal
        title="Add Command"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddCommand} layout="vertical">
          <Form.Item
            name="name"
            label="Command Name"
            rules={[{ required: true, message: "Please enter a command name" }]}
          >
            <Input placeholder="e.g., Database Proxy" />
          </Form.Item>
          <Form.Item
            name="command"
            label="Command"
            rules={[{ required: true, message: "Please enter a command" }]}
          >
            <Input.TextArea
              placeholder="e.g., gcloud sql proxy..."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Command"
        open={!!editingCommand}
        onCancel={() => {
          setEditingCommand(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleEditCommand} layout="vertical">
          <Form.Item
            name="name"
            label="Command Name"
            rules={[{ required: true, message: "Please enter a command name" }]}
          >
            <Input placeholder="e.g., Database Proxy" />
          </Form.Item>
          <Form.Item
            name="command"
            label="Command"
            rules={[{ required: true, message: "Please enter a command" }]}
          >
            <Input.TextArea
              placeholder="e.g., gcloud sql proxy..."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CommandList;
