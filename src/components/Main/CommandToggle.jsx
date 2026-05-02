import React from "react";
import { Switch } from "antd";
import { useApp } from "../../contexts/AppContext";

function CommandToggle({ commandId }) {
  const { runningCommands, toggleCommand } = useApp();
  const isRunning = runningCommands.has(commandId);

  const handleToggle = (checked) => {
    toggleCommand(commandId, checked);
  };

  return (
    <Switch
      checked={isRunning}
      onChange={handleToggle}
      size="small"
    />
  );
}

export default CommandToggle;
