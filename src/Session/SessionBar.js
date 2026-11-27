import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import CircularProgress from "@mui/material/CircularProgress";
import {
  MdRefresh,
  MdCheckCircleOutline,
  MdErrorOutline,
  MdWarningAmber,
  MdInfoOutline,
  MdDeleteOutline,
  MdClose,
  MdCloudDone,
  MdCloudOff,
} from "react-icons/md";
import moment from "moment";
import { useAuth } from "./AuthContext";
import statusService from "../services/statusService";

export default function SessionBar() {
  const { user, tokenRefreshTime, refreshToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusState, setStatusState] = useState(() => statusService.getState());
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  useEffect(() => {
    const unsubscribe = statusService.subscribe((state) => {
      setStatusState(state);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRefresh = async () => {
    if (!refreshToken) return;
    try {
      setIsRefreshing(true);
      statusService.info("Forced token refresh requested");
      await refreshToken();
      statusService.success("Token refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh token", err);
      statusService.error("Token refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedTime = tokenRefreshTime
    ? moment(tokenRefreshTime).format("YYYY.MM.DD HH:mm:ss")
    : "pending...";

  const current = statusState.current;
  const history = statusState.history;

  const renderStatusIcon = (type) => {
    switch (type) {
      case "pending":
        return <CircularProgress size={10} thickness={5} sx={{ color: "#1976d2", flexShrink: 0 }} />;
      case "success":
        return <MdCheckCircleOutline size={13} color="#2e7d32" style={{ flexShrink: 0 }} />;
      case "error":
        return <MdErrorOutline size={13} color="#d32f2f" style={{ flexShrink: 0 }} />;
      case "warn":
        return <MdWarningAmber size={13} color="#ed6c02" style={{ flexShrink: 0 }} />;
      case "info":
        return <MdInfoOutline size={13} color="#777" style={{ flexShrink: 0 }} />;
      default:
        return (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#9e9e9e",
              flexShrink: 0,
            }}
          />
        );
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case "pending":
        return "#1565c0";
      case "success":
        return "#555";
      case "error":
        return "#c62828";
      case "warn":
        return "#e65100";
      case "info":
        return "#777";
      default:
        return "#777";
    }
  };

  const renderStatusText = () => {
    if (!current) {
      return "Ready";
    }
    const timeStr = moment(current.timestamp).format("HH:mm:ss");
    const durStr = current.durationMs != null ? ` (${current.durationMs}ms)` : "";
    return `[${timeStr}] ${current.message}${durStr}`;
  };

  return (
    <Box
      className="session-debug-bar"
      data-testid="session-bar"
      sx={{
        backgroundColor: "#f5f6f8",
        borderBottom: "1px solid #e0e0e0",
        px: 2,
        py: "3px",
        minHeight: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "4px 12px",
        fontSize: "11px",
        color: "#616161",
        boxSizing: "border-box",
      }}
    >
      {/* Left: User Session + Online/Offline Status */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0, flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: isOnline ? "#4caf50" : "#ed6c02",
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: "11px", color: "#666" }}>
          Session:{" "}
          <strong style={{ color: "#444" }}>
            {user?.email || "Not signed in"}
          </strong>
        </Typography>

        <Box
          sx={{
            width: "1px",
            height: "12px",
            backgroundColor: "#d0d0d0",
            mx: 0.5,
            flexShrink: 0,
          }}
        />

        {isOnline ? (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "#2e7d32" }}>
            <MdCloudDone size={13} />
            <Typography sx={{ fontSize: "11px", color: "#2e7d32", fontWeight: 600 }}>
              Online
            </Typography>
          </Box>
        ) : (
          <Tooltip title="Offline mode — new tasks are queued locally until back online">
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                color: "#e65100",
                px: 0.75,
                py: "1px",
                borderRadius: "4px",
              }}
            >
              <MdCloudOff size={13} />
              <Typography sx={{ fontSize: "11px", color: "#e65100", fontWeight: 700 }}>
                OFFLINE
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Right: Live Operation Status + Divider + Token Refresh */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0, flexWrap: "wrap" }}>
        <Tooltip title="Click to view debug history" arrow>
          <Box
            data-testid="session-bar-status"
            onClick={(e) => setPopoverAnchor(e.currentTarget)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              px: 0.5,
              py: "1px",
              borderRadius: "3px",
              cursor: "pointer",
              maxWidth: { xs: "260px", sm: "420px" },
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            {renderStatusIcon(current?.type)}
            <Typography
              sx={{
                fontSize: "11px",
                color: getStatusColor(current?.type),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {renderStatusText()}
            </Typography>
          </Box>
        </Tooltip>

        {user && (
          <>
            <Box
              sx={{
                width: "1px",
                height: "12px",
                backgroundColor: "#d0d0d0",
                mx: 0.5,
                flexShrink: 0,
              }}
            />

            <Typography sx={{ fontSize: "11px", color: "#777" }} data-testid="token-refresh-info">
              Token refreshed: <span style={{ color: "#444" }}>{formattedTime}</span>
            </Typography>
            <Tooltip title="Force token refresh">
              <IconButton
                size="small"
                aria-label="Force token refresh"
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  p: "2px",
                  color: "#777",
                  "&:hover": { color: "#1976d2" },
                }}
              >
                <MdRefresh
                  size={14}
                  className={isRefreshing ? "session-bar-spin" : ""}
                />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Debug History Popover */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: "520px",
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "380px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            p: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            backgroundColor: "#f5f6f8",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>
              Debug Activity Log
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#888" }}>
              ({history.length} {history.length === 1 ? "entry" : "entries"})
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {history.length > 0 && (
              <IconButton
                size="small"
                onClick={() => statusService.clearHistory()}
                sx={{ p: 0.5, color: "#666" }}
                title="Clear log"
                aria-label="Clear log"
              >
                <MdDeleteOutline size={16} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => setPopoverAnchor(null)}
              sx={{ p: 0.5, color: "#666" }}
              title="Close"
              aria-label="Close"
            >
              <MdClose size={16} />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            backgroundColor: "#fafafa",
          }}
        >
          {history.length === 0 ? (
            <Typography sx={{ fontSize: "12px", color: "#999", p: 2, textAlign: "center" }}>
              No activity recorded yet
            </Typography>
          ) : (
            history.map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 0.75,
                  px: 1,
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  border: "1px solid #eeeeee",
                  fontSize: "11px",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
                  {renderStatusIcon(entry.type)}
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#888",
                      flexShrink: 0,
                    }}
                  >
                    {moment(entry.timestamp).format("HH:mm:ss")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: entry.type === "error" ? "#d32f2f" : "#000000",
                      wordBreak: "break-word",
                    }}
                  >
                    {entry.message}
                  </Typography>
                </Box>
                {entry.durationMs != null && (
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "#888",
                      flexShrink: 0,
                      backgroundColor: "#f0f0f0",
                      px: 0.5,
                      py: "1px",
                      borderRadius: "3px",
                    }}
                  >
                    {entry.durationMs}ms
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </Box>
  );
}
