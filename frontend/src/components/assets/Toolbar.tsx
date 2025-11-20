import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material"; // Removed Drawer
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AiAssistant from "../ai-assitant/ai-assistant.tsx";

interface RightToolbarProps {
  style?: React.CSSProperties;
  tabs: any[];
  activeTabKey: string;
}

type ToolType =
  | "file-transfer"
  | "monitor"
  | "ai"
  | "tools"
  | "settings"
  | null;

interface DrawerState {
  open: boolean;
  type: ToolType;
  width: number;
}

const Toolbar: React.FC<RightToolbarProps> = ({
  style,
  tabs,
  activeTabKey,
}) => {
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    type: null,
    width: 400,
  });
  const [isResizing, setIsResizing] = useState(false);

  const toolButtons = [
    // { key: 'file-transfer', icon: <InsertDriveFileIcon fontSize="small" />, title: 'File Transfer', tooltip: 'File transfer tool' },
    // { key: 'monitor', icon: <MonitorIcon fontSize="small" />, title: 'Host Monitor', tooltip: 'Host monitor panel' },
    {
      key: "ai",
      icon: <SmartToyIcon fontSize="small" />,
      title: "AI Assistant",
      tooltip: "AI Intelligent Assistant",
    },
    // { key: 'tools', icon: <BuildIcon fontSize="small" />, title: 'Toolbox', tooltip: 'System toolbox' },
    // { key: 'settings', icon: <SettingsIcon fontSize="small" />, title: 'Settings', tooltip: 'Application settings' },
  ];

  const handleButtonClick = (type: ToolType) => {
    setDrawerState((prev) => ({
      open: prev.type === type ? !prev.open : true,
      type,
      width: prev.width,
    }));
  };

  const handleCloseDrawer = () =>
    setDrawerState((prev) => ({ ...prev, open: false }));

  const getDrawerTitle = () =>
    toolButtons.find((b) => b.key === drawerState.type)?.title || "";

  const getDrawerContent = () => {
    switch (drawerState.type) {
      case "file-transfer":
        return (
          <Box p={2}>
            <Typography variant="h6" fontSize={16}>
              File Transfer
            </Typography>
            <Box mt={2} fontSize={13} color="text.secondary">
              File transfer feature under development...
            </Box>
          </Box>
        );
      case "monitor":
        return (
          <Box p={2}>
            <Typography variant="h6" fontSize={16}>
              Host Monitor
            </Typography>
            <Box mt={2} fontSize={13} color="text.secondary">
              Host monitor panel under development...
            </Box>
          </Box>
        );
      case "ai":
        return (
          <Box height="100%" display="flex" flexDirection="column">
            <AiAssistant
              tabs={tabs}
              activeTabKey={activeTabKey}
              visible={drawerState.open && drawerState.type === "ai"}
            />
          </Box>
        );
      case "tools":
        return (
          <Box p={2}>
            <Typography variant="h6" fontSize={16}>
              System Toolbox
            </Typography>
            <Box mt={2} fontSize={13} color="text.secondary">
              Toolbox feature under development...
            </Box>
          </Box>
        );
      case "settings":
        return (
          <Box p={2}>
            <Typography variant="h6" fontSize={16}>
              Application Settings
            </Typography>
            <Box mt={2} fontSize={13} color="text.secondary">
              Settings page under development...
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="row"
      sx={{ pointerEvents: "auto" }}
    >
      {/* Dock */}
      <Box
        style={style}
        sx={(theme) => ({
          width: 40,
          height: "100%",
          background: theme.palette.background.default,
          borderLeft: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          flexShrink: 0,
          zIndex: 1300,
        })}
      >
        {toolButtons.map((button, index) => {
          const isActive = drawerState.type === button.key && drawerState.open;
          return (
            <IconButton
              key={button.key}
              title={button.tooltip}
              onClick={() => handleButtonClick(button.key as ToolType)}
              sx={(theme) => ({
                width: 32,
                height: 32,
                mb: index < toolButtons.length - 1 ? 1 : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                color: isActive
                  ? theme.palette.getContrastText(theme.palette.primary.main)
                  : theme.palette.text.secondary,
                backgroundColor: isActive
                  ? theme.palette.primary.main
                  : "transparent",
                transition: "color 0.15s, background-color 0.15s",
                "&:hover": {
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : theme.palette.action.hover,
                  color: isActive
                    ? theme.palette.getContrastText(theme.palette.primary.main)
                    : theme.palette.text.primary,
                },
              })}
            >
              {button.icon}
            </IconButton>
          );
        })}
      </Box>

      {/* Custom fixed panel replacing Drawer so background remains interactive */}
      {drawerState.open && (
        <Box
          sx={(theme) => ({
            position: "fixed",
            right: 40, // align with dock width
            top: 0,
            height: "calc(100% - 24px)",
            width: drawerState.width,
            display: "flex",
            flexDirection: "column",
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 0 8px rgba(0,0,0,0.15)"
                : "0 0 8px rgba(0,0,0,0.5)",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            zIndex: 1299, // just under dock so dock button remains on top
          })}
        >
          {/* Resize handle */}
          <Box
            sx={{
              position: "absolute",
              left: -4,
              top: 0,
              width: 8,
              height: "100%",
              cursor: "ew-resize",
              bgcolor: isResizing ? "rgba(24,144,255,0.3)" : "transparent",
              transition: isResizing ? "none" : "background-color 0.2s ease",
            }}
            onMouseDown={(e) => {
              setIsResizing(true);
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = drawerState.width;
              document.body.style.cursor = "ew-resize";
              document.body.style.userSelect = "none";
              const handleMove = (me: MouseEvent) => {
                me.preventDefault();
                const delta = startX - me.clientX;
                const newWidth = Math.max(300, Math.min(800, startWidth + delta));
                requestAnimationFrame(() =>
                  setDrawerState((prev) => ({ ...prev, width: newWidth })),
                );
              };
              const handleUp = () => {
                setIsResizing(false);
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
              };
              document.addEventListener("mousemove", handleMove, {
                passive: false,
              });
              document.addEventListener("mouseup", handleUp);
            }}
          />
          <Box
            px={1.5}
            py={1}
            sx={(theme) => ({
              borderBottom: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            })}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" fontSize={14}>
              {getDrawerTitle()}
            </Typography>
            <IconButton onClick={handleCloseDrawer} sx={{ ml: 1 }}>
              ✕
            </IconButton>
          </Box>
          <Box flex={1} overflow="auto">
            {getDrawerContent()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Toolbar;
