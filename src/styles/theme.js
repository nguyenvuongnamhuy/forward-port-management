// Modern Design System Theme Configuration
export const modernTheme = {
  token: {
    // Primary Colors - Modern blue gradient
    colorPrimary: "#3b82f6",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#06b6d4",

    // Border & Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Typography
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Shadows - Modern elevation
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    boxShadowSecondary:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",

    // Motion
    motionDurationSlow: "0.3s",
    motionDurationMid: "0.2s",
    motionDurationFast: "0.1s",
  },
  components: {
    Card: {
      headerBg: "transparent",
      headerFontSize: 15,
      headerFontSizeSM: 14,
      paddingLG: 20,
      boxShadowTertiary:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    },
    Button: {
      controlHeight: 32,
      controlHeightSM: 28,
      controlHeightLG: 40,
      fontWeight: 500,
      primaryShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
    },
    Switch: {
      trackHeight: 20,
      trackHeightSM: 16,
      trackMinWidth: 36,
      trackMinWidthSM: 28,
    },
    Input: {
      controlHeight: 36,
      controlHeightSM: 32,
    },
    Tabs: {
      cardGutter: 4,
      horizontalItemPadding: "12px 16px",
      horizontalItemPaddingSM: "8px 12px",
    },
  },
};

export const modernDarkTheme = {
  ...modernTheme,
  token: {
    ...modernTheme.token,
    colorBgContainer: "#1f2937",
    colorBgElevated: "#111827",
    colorBorder: "#374151",
    colorText: "#f9fafb",
    colorTextSecondary: "#9ca3af",
  },
};
