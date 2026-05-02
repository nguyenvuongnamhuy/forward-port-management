import React, { useState } from "react";
import { Card, Switch, Button, Space, Typography, Divider, message } from "antd";
import { ImportOutlined, ExportOutlined, SunOutlined, MoonOutlined, ReloadOutlined, CheckCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { useApp } from "../../contexts/AppContext";
import packageJson from "../../../package.json";

const { Title, Text } = Typography;

const CURRENT_VERSION = packageJson.version;
const GITHUB_REPO = "nguyenvuongnamhuy/forward-port-management";

function SettingsTab({ isDarkMode, setIsDarkMode }) {
  const { importConfig, exportConfig } = useApp();
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const latestVer = data.tag_name.replace('v', '');
      setLatestVersion(latestVer);
      
      // Compare versions
      const isNewer = compareVersions(latestVer, CURRENT_VERSION) > 0;
      setUpdateAvailable(isNewer);
      
      if (isNewer) {
        message.success(`New version ${latestVer} is available!`);
      } else {
        message.info('You are using the latest version');
      }
    } catch (error) {
      message.error('Failed to check for updates');
      setUpdateAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  };

  const openGitHubRelease = () => {
    window.open(`https://github.com/${GITHUB_REPO}/releases/latest`, '_blank');
  };

  return (
    <div style={{ height: "calc(100vh - 10px)", padding: "0 6px" }}>
      <Card 
        size="small"
        bodyStyle={{ padding: '20px', height: 'calc(100vh - 105px)', overflow: 'auto' }}
        className="modern-card"
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Appearance */}
          <div>
            <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>Appearance</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 8,
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Space size={12}>
                {isDarkMode ? (
                  <MoonOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                ) : (
                  <SunOutlined style={{ fontSize: 18, color: '#faad14' }} />
                )}
                <div>
                  <Text strong style={{ fontSize: 14 }}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isDarkMode ? 'Easy on the eyes in low light' : 'Bright and clear interface'}
                  </Text>
                </div>
              </Space>
              <Switch
                checked={isDarkMode}
                onChange={setIsDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </div>
          </div>

          <Divider style={{ margin: "16px 0 12px 0" }} />

          {/* Configuration */}
          <div>
            <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>Configuration</Title>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {/* Import */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 8,
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={importConfig}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
              }}
              >
                <Space size={12}>
                  <ImportOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      Import Configuration
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Load settings from a backup folder
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Export */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 8,
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={exportConfig}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
              }}
              >
                <Space size={12}>
                  <ExportOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      Export Configuration
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Save settings to a backup folder
                    </Text>
                  </div>
                </Space>
              </div>
            </Space>
          </div>

          <Divider style={{ margin: "16px 0 12px 0" }} />

          {/* Updates */}
          <div>
            <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}>Updates</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 8,
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Space size={12}>
                {updateAvailable === true ? (
                  <DownloadOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
                ) : updateAvailable === false ? (
                  <CheckCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                ) : (
                  <ReloadOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                )}
                <div>
                  <Text strong style={{ fontSize: 14 }}>
                    {updateAvailable === true 
                      ? `New Version Available (${latestVersion})`
                      : updateAvailable === false 
                      ? 'Up to Date'
                      : 'Check for Updates'
                    }
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {updateAvailable === true 
                      ? 'A new version is ready to download'
                      : updateAvailable === false 
                      ? `You're using the latest version (${CURRENT_VERSION})`
                      : 'Check if a new version is available'
                    }
                  </Text>
                </div>
              </Space>
              {updateAvailable === true ? (
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={openGitHubRelease}
                  style={{ fontWeight: 500 }}
                >
                  Install Now
                </Button>
              ) : (
                <Button
                  size="small"
                  icon={<ReloadOutlined spin={checking} />}
                  onClick={checkForUpdates}
                  loading={checking}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Check'}
                </Button>
              )}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default SettingsTab;
