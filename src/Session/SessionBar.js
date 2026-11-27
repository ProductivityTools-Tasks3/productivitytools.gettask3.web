import React, { useState, useEffect } from "react";
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
        return <CircularProgress size={10} thickness={5} style={{ color: "#1976d2", flexShrink: 0 }} />;
      case "success":
        return <MdCheckCircleOutline size={13} color="#777" style={{ flexShrink: 0 }} />;
      case "error":
        return <MdErrorOutline size={13} color="#d32f2f" style={{ flexShrink: 0 }} />;
      case "warn":
        return <MdWarningAmber size={13} color="#ed6c02" style={{ flexShrink: 0 }} />;
      case "info":
        return <MdInfoOutline size={13} color="#777" style={{ flexShrink: 0 }} />;
      default:
        return <span className="session-bar-idle-dot" />;
    }
  };

  const getStatusClass = (type) => {
    switch (type) {
      case "pending":
        return "status-pending";
      case "error":
        return "status-error";
      case "warn":
        return "status-warn";
      default:
        return "status-default";
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
    <div className="session-debug-bar" data-testid="session-bar">
      {/* Left: User Session + Online/Offline Status */}
      <div className="session-bar-section">
        <span
          className={`session-bar-dot ${isOnline ? "is-online" : "is-offline"}`}
          aria-hidden="true"
        />
        <span className="session-bar-text">
          Session:{" "}
          <strong className="session-bar-strong">
            {user?.email || "Not signed in"}
          </strong>
        </span>

        <span className="session-bar-divider" aria-hidden="true" />

        {isOnline ? (
          <span className="session-bar-online">
            <MdCloudDone size={13} />
            <span>Online</span>
          </span>
        ) : (
          <Tooltip title="Offline mode — new tasks are queued locally until back online">
            <span className="session-bar-offline">
              <MdCloudOff size={13} />
              <span>OFFLINE</span>
            </span>
          </Tooltip>
        )}
      </div>

      {/* Right: Live Operation Status + Divider + Token Refresh */}
      <div className="session-bar-section session-bar-right">
        <Tooltip title="Click to view debug history" arrow>
          <button
            type="button"
            className="session-bar-status-btn"
            data-testid="session-bar-status"
            onClick={(e) => setPopoverAnchor(e.currentTarget)}
          >
            {renderStatusIcon(current?.type)}
            <span className={`session-bar-status-text ${getStatusClass(current?.type)}`}>
              {renderStatusText()}
            </span>
          </button>
        </Tooltip>

        {user && (
          <>
            <span className="session-bar-divider" aria-hidden="true" />

            <span className="session-bar-token-text" data-testid="token-refresh-info">
              Token refreshed: <span className="session-bar-token-time">{formattedTime}</span>
            </span>
            <Tooltip title="Force token refresh">
              <button
                type="button"
                className="session-bar-icon-btn"
                aria-label="Force token refresh"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <MdRefresh
                  size={13}
                  className={isRefreshing ? "session-bar-spin" : ""}
                />
              </button>
            </Tooltip>
          </>
        )}
      </div>

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
          className: "session-log-popover",
        }}
      >
        <div className="session-log-header">
          <div className="session-log-header-left">
            <span className="session-log-title">Debug Activity Log</span>
            <span className="session-log-count">
              ({history.length} {history.length === 1 ? "entry" : "entries"})
            </span>
          </div>
          <div className="session-log-header-actions">
            {history.length > 0 && (
              <button
                type="button"
                className="session-log-action-btn"
                onClick={() => statusService.clearHistory()}
                title="Clear log"
                aria-label="Clear log"
              >
                <MdDeleteOutline size={16} />
              </button>
            )}
            <button
              type="button"
              className="session-log-action-btn"
              onClick={() => setPopoverAnchor(null)}
              title="Close"
              aria-label="Close"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>

        <div className="session-log-body">
          {history.length === 0 ? (
            <div className="session-log-empty">No activity recorded yet</div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="session-log-entry">
                <div className="session-log-entry-main">
                  {renderStatusIcon(entry.type)}
                  <span className="session-log-time">
                    {moment(entry.timestamp).format("HH:mm:ss")}
                  </span>
                  <span
                    className={`session-log-msg ${entry.type === "error" ? "is-error" : ""}`}
                  >
                    {entry.message}
                  </span>
                </div>
                {entry.durationMs != null && (
                  <span className="session-log-duration">{entry.durationMs}ms</span>
                )}
              </div>
            ))
          )}
        </div>
      </Popover>
    </div>
  );
}
