import React from "react";
import { ConfigProvider, theme } from "antd";
import { AppProvider } from "./contexts/AppContext";
import MainLayout from "./components/Layout/MainLayout";
import { modernTheme, modernDarkTheme } from "./styles/theme";

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <ConfigProvider
      theme={{
        ...modernTheme,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <MainLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConfigProvider>
  );
}

export default App;
