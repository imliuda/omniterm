import React, { useState, useEffect } from "react";
import TerminalComponent, {
  cleanupTerminal,
} from "./components/assets/Terminal";
import StatusBar from "./components/StatusBar";
import RightToolbar from "./components/RightToolbar";
import Models from "./components/settings/models";
import AssetTree, { AssetTreeHandle } from "./components/assets/AssetTree";

// MUI components
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Typography,
} from "@mui/material";

// MUI icons
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import SettingsIcon from "@mui/icons-material/Settings";

// Tab data type
interface TabPane {
  key: string;
  label: string;
  content: string;
  closable: boolean;
  hostInfo: {
    ip: string;
    port: number;
    name: string;
  };
  assetId?: string; // Added: asset ID field
}

const App: React.FC = () => {
  // Main menu selection state
  const [selectedMenu, setSelectedMenu] = useState<"assets" | "settings">(
    "assets",
  );
  const [assetsVisible, setAssetsVisible] = useState<boolean>(true);

  // Removed legacy panel state variables
  const [activeTabKey, setActiveTabKey] = useState<string>("welcome");
  const [tabs, setTabs] = useState<TabPane[]>([
    {
      key: "welcome",
      label: "Welcome",
      content: "Please double-click a host in the left list to establish a connection.",
      closable: false,
      hostInfo: { ip: "", port: 0, name: "" },
    },
  ]);
  const [terminalStates, setTerminalStates] = useState<
    Map<string, { connected: boolean; connectionTime?: number }>
  >(new Map());
  const [appStats, setAppStats] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    version: "v1.0.0",
  });
  const assetTreeRef = React.useRef<AssetTreeHandle>(null);

  // Tab context menu state
  const [tabMenuAnchor, setTabMenuAnchor] = useState<HTMLElement | null>(null);
  const [tabMenuItems, setTabMenuItems] = useState<
    {
      key: string;
      label: string;
      icon?: React.ReactNode;
      danger?: boolean;
      onClick: () => void;
    }[]
  >([]);

  // App stats mock update
  useEffect(() => {
    const update = () =>
      setAppStats((p) => ({
        ...p,
        memoryUsage: Math.random() * 512 + 128,
        cpuUsage: Math.random() * 30 + 5,
      }));
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, []);

  // Close tab
  const handleTabClose = (targetKey: string) => {
    if (targetKey !== "welcome") cleanupTerminal(targetKey);
    const newTabs = tabs.filter((t) => t.key !== targetKey);
    setTabs(newTabs);
    if (activeTabKey === targetKey)
      setActiveTabKey(newTabs[newTabs.length - 1]?.key || "welcome");
  };

  // Build tab right-click context menu
  const buildTabContextMenu = (tabKey: string) => {
    const tab = tabs.find((t) => t.key === tabKey);
    if (!tab) return [] as any[];
    const items: any[] = [];
    if (tab.key !== "welcome") {
      items.push(
        {
          key: "reload",
          label: "Reconnect",
          icon: <RefreshIcon fontSize="small" />,
          onClick: () => {},
        },
        {
          key: "copy-info",
          label: "Copy Connection Info",
          icon: <ContentCopyIcon fontSize="small" />,
          onClick: () => {
            const info = `${tab.hostInfo.name} (${tab.hostInfo.ip}:${tab.hostInfo.port})`;
            navigator.clipboard.writeText(info);
          },
        },
        {
          key: "disconnect",
          label: "Disconnect",
          icon: <LinkOffIcon fontSize="small" />,
          onClick: () => {},
        },
      );
    }
    if (tab.closable)
      items.push({
        key: "close",
        label: "Close Tab",
        icon: <CloseIcon fontSize="small" />,
        onClick: () => handleTabClose(tabKey),
      });
    const otherClosable = tabs.filter((t) => t.key !== tabKey && t.closable);
    if (otherClosable.length > 0)
      items.push({
        key: "close-others",
        label: "Close Other Tabs",
        onClick: () => {
          otherClosable.forEach(
            (t) => t.key !== "welcome" && cleanupTerminal(t.key),
          );
          const nt = tabs.filter((t) => t.key === tabKey || !t.closable);
          setTabs(nt);
          if (!nt.find((t) => t.key === activeTabKey)) setActiveTabKey(tabKey);
        },
      });
    const closableAll = tabs.filter((t) => t.closable);
    if (closableAll.length > 0)
      items.push({
        key: "close-all",
        label: "Close All Tabs",
        onClick: () => {
          closableAll.forEach(
            (t) => t.key !== "welcome" && cleanupTerminal(t.key),
          );
          const nt = tabs.filter((t) => !t.closable);
          setTabs(nt);
          setActiveTabKey("welcome");
        },
      });
    return items;
  };

  // Terminal connection state helper
  const handleTerminalConnectionChange = (
    tabKey: string,
    connected: boolean,
  ) => {
    setTerminalStates((prev) => {
      const next = new Map(prev);
      const prevState = next.get(tabKey);
      next.set(tabKey, {
        connected,
        connectionTime: connected
          ? prevState?.connectionTime || Date.now()
          : prevState?.connectionTime,
      });
      return next;
    });
  };
  const getCurrentTerminalStatus = () => {
    const tab = tabs.find((t) => t.key === activeTabKey);
    if (!tab || tab.key === "welcome") return undefined;
    const state = terminalStates.get(activeTabKey) || { connected: false };
    return {
      name: tab.hostInfo.name,
      ip: tab.hostInfo.ip,
      port: tab.hostInfo.port,
      connected: state.connected,
      connectionTime: state.connectionTime,
    };
  };
  const getActiveConnectionsCount = () => {
    let c = 0;
    terminalStates.forEach((s) => {
      if (s.connected) c++;
    });
    return c;
  };

  // Responsive: trigger multiple resizes when assets panel visibility changes to ensure xterm sizing
  useEffect(() => {
    const trigger = () =>
      window.dispatchEvent(
        new CustomEvent("terminal-resize", {
          detail: { tabKey: activeTabKey },
        }),
      );
    if (selectedMenu === "assets") {
      [0, 60, 150].forEach((d) => setTimeout(trigger, d));
    }
  }, [selectedMenu, activeTabKey]);
  useEffect(() => {
    if (selectedMenu === "assets" && assetsVisible) {
      const trigger = () =>
        window.dispatchEvent(
          new CustomEvent("terminal-resize", {
            detail: { tabKey: activeTabKey },
          }),
        );
      [0, 80, 180].forEach((d) => setTimeout(trigger, d));
    }
  }, [assetsVisible, selectedMenu, activeTabKey]);

  // Listen for asset connect events (functional update avoids rebinding on tabs change)
  useEffect(() => {
    const handler = (e: Event) => {
      const { asset, node } = (e as CustomEvent).detail;
      const timestamp = Date.now();
      const rand = Math.floor(Math.random() * 10000);
      const key = `host-${asset.id}-${timestamp}-${rand}`;
      setTabs((prev) => {
        const same = prev.filter(
          (t) => t.assetId === asset.id && t.key !== "welcome",
        );
        const num = same.length + 1;
        const tabLabel = num === 1 ? asset.name : `${asset.name} (${num})`;
        const newTab: TabPane = {
          key,
          label: tabLabel,
          content: `Connecting to ${asset.name}...`,
          closable: true,
          hostInfo: {
            ip: node.ip || "",
            port: node.port || 0,
            name: asset.name,
          },
          assetId: asset.id,
        };
        return [...prev, newTab];
      });
      setActiveTabKey(key);
    };
    window.addEventListener("asset-connect", handler as any);
    return () => window.removeEventListener("asset-connect", handler as any);
  }, []);

  // Main render: left dock + content views
  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Main content area: Dock + right content */}
      <Box display="flex" flex={1} minHeight={0}>
        {/* Left Dock menu */}
        <Box
          width={40}
          sx={(theme) => ({
            bgcolor: theme.palette.background.default,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 1,
            gap: 1,
            borderRight: `1px solid ${theme.palette.divider}`,
          })}
        >
          <IconButton
            onClick={() => {
              if (selectedMenu !== "assets") {
                setSelectedMenu("assets");
                setAssetsVisible(true);
              } else {
                setAssetsVisible((v) => !v);
              }
            }}
            sx={(theme) => {
              const assetActive = selectedMenu === "assets";
              const assetShown = assetActive && assetsVisible;
              return {
                color: assetActive
                  ? assetShown
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary
                  : theme.palette.text.secondary,
                bgcolor: assetShown
                  ? theme.palette.action.selected
                  : "transparent",
                borderRadius: 6,
                transition: "background-color 0.15s, color 0.15s",
                "&:hover": { bgcolor: theme.palette.action.hover },
              };
            }}
            title={assetsVisible ? "Hide Assets List" : "Show Assets List"}
          >
            <DesktopMacIcon fontSize="small" />
          </IconButton>
          <Box flexGrow={1} />
          <IconButton
            onClick={() => setSelectedMenu("settings")}
            sx={(theme) => ({
              color:
                selectedMenu === "settings"
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              bgcolor:
                selectedMenu === "settings"
                  ? theme.palette.action.selected
                  : "transparent",
              borderRadius: 6,
              mt: "auto",
              transition: "background-color 0.15s, color 0.15s",
              "&:hover": { bgcolor: theme.palette.action.hover },
            })}
            title="Settings"
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* Right content area: assets + settings mounted together */}
        <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
          <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
            {/* Assets view */}
            <Box
              display={selectedMenu === "assets" ? "flex" : "none"}
              flex={1}
              flexDirection="column"
              minHeight={0}
            >
              <Box
                display="flex"
                height="100%"
                flexDirection="column"
                flex={1}
                minHeight={0}
              >
                <Box display="flex" height="100%" flex={1} minHeight={0}>
                  {assetsVisible && <AssetTree ref={assetTreeRef} />}
                  <Box
                    flex={1}
                    display="flex"
                    flexDirection="row"
                    minHeight={0}
                    sx={(theme) => ({
                      bgcolor: theme.palette.background.paper,
                    })}
                  >
                    <Box
                      flex={1}
                      display="flex"
                      flexDirection="column"
                      minHeight={0}
                    >
                      <Tabs
                        value={activeTabKey}
                        onChange={(_, v) => setActiveTabKey(v)}
                        variant="scrollable"
                        sx={{ minHeight: 40 }}
                      >
                        {tabs.map((tab) => (
                          <Tab
                            key={tab.key}
                            value={tab.key}
                            label={
                              <Box
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setTabMenuItems(buildTabContextMenu(tab.key));
                                  setTabMenuAnchor(e.currentTarget);
                                }}
                                display="flex"
                                alignItems="center"
                                gap={1}
                              >
                                <Typography variant="body2" noWrap>
                                  {tab.label}
                                </Typography>
                                {tab.closable && (
                                  <Box
                                    component="span"
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      handleTabClose(tab.key);
                                    }}
                                    sx={(theme) => ({
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 16,
                                      height: 16,
                                      cursor: "pointer",
                                      borderRadius: 1,
                                      color: theme.palette.text.secondary,
                                      "&:hover": {
                                        bgcolor: theme.palette.action.hover,
                                        color: theme.palette.text.primary,
                                      },
                                      "& svg": { fontSize: 14 },
                                    })}
                                  >
                                    <CloseIcon fontSize="inherit" />
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        ))}
                      </Tabs>
                      <Box
                        flex={1}
                        overflow="hidden"
                        display="flex"
                        minHeight={0}
                        position="relative"
                      >
                        {tabs.map((tab) => (
                          <Box
                            key={tab.key}
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              flexDirection: "column",
                              visibility:
                                tab.key === activeTabKey ? "visible" : "hidden",
                              pointerEvents:
                                tab.key === activeTabKey ? "auto" : "none",
                            }}
                            overflow="hidden"
                            minHeight={0}
                          >
                            {tab.key === "welcome" ? (
                              <Box
                                flex={1}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {tab.content}
                              </Box>
                            ) : (
                              <Box
                                flex={1}
                                display="flex"
                                flexDirection="column"
                                overflow="hidden"
                                minHeight={0}
                              >
                                <TerminalComponent
                                  tabKey={tab.key}
                                  assetId={tab.assetId || ""}
                                  hostInfo={tab.hostInfo}
                                  isActive={
                                    selectedMenu === "assets" &&
                                    activeTabKey === tab.key
                                  }
                                  onConnectionStateChange={(c) =>
                                    handleTerminalConnectionChange(tab.key, c)
                                  }
                                />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <RightToolbar tabs={tabs} activeTabKey={activeTabKey} />
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* Settings view */}
            <Box
              display={selectedMenu === "settings" ? "flex" : "none"}
              flex={1}
              flexDirection="column"
              overflow="hidden"
              minHeight={0}
            >
              <Models />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Global bottom status bar */}
      <StatusBar
        currentTerminal={getCurrentTerminalStatus()}
        totalTerminals={tabs.filter((t) => t.key !== "welcome").length}
        activeConnections={getActiveConnectionsCount()}
        appVersion={appStats.version}
        memoryUsage={appStats.memoryUsage}
        cpuUsage={appStats.cpuUsage}
      />

      {/* Tab context menu */}
      <MuiMenu
        open={Boolean(tabMenuAnchor)}
        anchorEl={tabMenuAnchor}
        onClose={() => setTabMenuAnchor(null)}
      >
        {tabMenuItems.map((item) => (
          <MenuItem
            key={item.key}
            onClick={() => {
              item.onClick();
              setTabMenuAnchor(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </MuiMenu>
    </Box>
  );
};

export default App;
