import React from "react";
import { Spin } from "antd";
import { Panel, Group, Separator } from "react-resizable-panels";
import { useApp } from "../../contexts/AppContext";
import CategoryList from "./CategoryList";
import LogViewer from "./LogViewer";

function MainTab() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 96px)", overflow: "hidden" }}>
      <Group orientation="horizontal">
        <Panel defaultSize={58} minSize={400}>
          <div style={{ height: "100%", paddingRight: "6px" }}>
            <CategoryList />
          </div>
        </Panel>
        
        <Separator 
          style={{
            width: "12px",
            backgroundColor: "transparent",
            position: "relative",
          }}
          className="resize-handle"
        />
        
        <Panel defaultSize={42} minSize={300}>
          <div style={{ height: "100%", paddingLeft: "6px" }}>
            <LogViewer />
          </div>
        </Panel>
      </Group>
    </div>
  );
}

export default MainTab;
