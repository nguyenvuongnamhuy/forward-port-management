import React from "react";
import { Layout, Tabs } from "antd";
import { SettingOutlined, AppstoreOutlined } from "@ant-design/icons";
import MainTab from "../Main/MainTab";
import SettingsTab from "../Settings/SettingsTab";

const { Header, Content } = Layout;

function MainLayout({ isDarkMode, setIsDarkMode }) {
  const items = [
    {
      key: "main",
      label: (
        <span>
          <AppstoreOutlined /> Control Panel
        </span>
      ),
      children: <MainTab />,
    },
    {
      key: "settings",
      label: (
        <span>
          <SettingOutlined /> Settings
        </span>
      ),
      children: <SettingsTab isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />,
    },
  ];

  return (
    <Layout style={{ height: "100vh", background: isDarkMode ? "#0f172a" : "#f8fafc" }}>
      <Content style={{ padding: "16px" }}>
        <Tabs defaultActiveKey="main" items={items} />
      </Content>
    </Layout>
  );
}

export default MainLayout;
