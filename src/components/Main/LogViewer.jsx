import React, { useEffect, useRef } from "react";
import { Card, Button, List, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";

const { Text } = Typography;

function LogViewer() {
  const { logs, clearLogs } = useApp();
  const listRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Card
      title={<span className="gradient-text" style={{ fontWeight: 600 }}>Logs</span>}
      size="small"
      extra={
        <Button
          size="small"
          icon={<DeleteOutlined />}
          onClick={clearLogs}
          disabled={logs.length === 0}
          className="modern-button"
        >
          Clear
        </Button>
      }
      style={{ height: "100%" }}
      bodyStyle={{ padding: '12px' }}
      className="modern-card"
    >
      <div
        ref={listRef}
        style={{
          height: "calc(100vh - 162px)",
          overflow: "auto",
          paddingBottom: "12px",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#999", fontSize: 13 }}>
            No logs yet. Start a command to see logs here.
          </div>
        ) : (
          <List
            dataSource={logs}
            renderItem={(log) => (
              <List.Item style={{ padding: "6px 0", borderBottom: "none" }} className="fade-in">
                <div style={{ width: "100%" }}>
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {formatTimestamp(log.timestamp)}
                  </Text>
                  {" "}
                  <Text strong style={{ fontSize: "12px" }}>
                    {log.categoryName} - {log.commandName}
                  </Text>
                  <br />
                  <Text
                    style={{
                      color: log.isError ? "#ff4d4f" : "inherit",
                      fontSize: "12px",
                      wordBreak: "break-word",
                    }}
                  >
                    {log.message}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
}

export default LogViewer;
