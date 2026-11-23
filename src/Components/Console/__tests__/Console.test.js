import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Console from "../index";
import apiService from "../../../services/apiService";
import { signInWithGoogle, logout } from "../../../Session/firebase";
import { useAuth } from "../../../Session/AuthContext";

jest.mock("../../../services/apiService", () => ({
  GetTree: jest.fn(),
  getLast7DaysTree: jest.fn().mockResolvedValue(null),
  updateElement: jest.fn().mockResolvedValue({}),
  addElement: jest.fn().mockResolvedValue(123),
  finish: jest.fn().mockResolvedValue({}),
  unDone: jest.fn().mockResolvedValue({}),
  start: jest.fn().mockResolvedValue({}),
  changeType: jest.fn().mockResolvedValue(true),
  setInboxName: jest.fn().mockResolvedValue({}),
  clearInboxName: jest.fn().mockResolvedValue({}),
}));

jest.mock("../../../Session/firebase", () => ({
  signInWithGoogle: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../../../Session/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Console top bar and inbox buttons", () => {
  const mockTree = {
    elementId: 1,
    name: "Root",
    status: "New",
    type: "TaskBag",
    inboxName: null,
    created: "2024-01-10T10:00:00",
    elements: [
      {
        elementId: 10,
        parentId: 1,
        name: "Work Folder",
        status: "New",
        type: "TaskBag",
        inboxName: null,
        created: "2024-02-20T12:30:00",
        elements: [
          {
            elementId: 101,
            parentId: 10,
            name: "Deep Inbox Task",
            status: "New",
            type: "Task",
            inboxName: "DeepInbox",
            created: "2024-03-05T09:15:00",
            elements: [],
          },
        ],
      },
      {
        elementId: 20,
        parentId: 1,
        name: "Personal Folder",
        status: "InProgress",
        type: "TaskBag",
        inboxName: null,
        created: "2024-04-12T16:45:00",
        elements: [
          {
            elementId: 201,
            parentId: 20,
            name: "Personal Child Task",
            status: "New",
            type: "Task",
            inboxName: "PersonalInbox",
            created: "2024-05-18T11:20:00",
            elements: [],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.history.pushState({}, "", "/");
    apiService.GetTree.mockResolvedValue(mockTree);
    apiService.addElement.mockResolvedValue(123);
    useAuth.mockReturnValue({ user: null, loading: false });
  });

  it("renders inbox buttons on the left and Login, Logout, and Refresh buttons on the right when logged out", async () => {
    render(<Console />);

    await waitFor(() => {
      expect(screen.getByText("DeepInbox")).toBeInTheDocument();
      expect(screen.getByText("PersonalInbox")).toBeInTheDocument();
    });

    const refreshBtn = screen.getByText("Refresh");
    expect(refreshBtn).toBeInTheDocument();
    expect(refreshBtn.closest(".top-bar-right")).toBeInTheDocument();

    const loginBtn = screen.getByText("Login");
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn.closest(".top-bar-right")).toBeInTheDocument();

    const logoutBtn = screen.getByText("Logout");
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn.closest(".top-bar-right")).toBeInTheDocument();
  });

  it("does not render login button when user is logged in", async () => {
    useAuth.mockReturnValue({ user: { uid: "user-123" }, loading: false });
    render(<Console />);

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("calls signInWithGoogle when login button is clicked", async () => {
    render(<Console />);

    const loginBtn = await screen.findByText("Login");
    fireEvent.click(loginBtn);
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("calls logout when logout button is clicked", async () => {
    render(<Console />);

    const logoutBtn = await screen.findByText("Logout");
    fireEvent.click(logoutBtn);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("calls apiService.GetTree when refresh button is clicked", async () => {
    render(<Console />);

    const refreshBtn = await screen.findByText("Refresh");
    const initialCallCount = apiService.GetTree.mock.calls.length;
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(apiService.GetTree).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  it("collapses the rest of the tree and opens only chosen item path in tree view when an inbox button is clicked", async () => {
    const { container } = render(<Console />);

    // Click DeepInbox
    const deepInboxBtn = await screen.findByText("DeepInbox");
    fireEvent.click(deepInboxBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Deep Inbox Task").length).toBeGreaterThanOrEqual(1);
    });

    // Ensure mobile view remains 'show-tree'
    const consoleLayout = container.querySelector(".console-layout");
    expect(consoleLayout).toHaveClass("show-tree");
    expect(consoleLayout).not.toHaveClass("show-details");
  });

  it("opens add tasks popup when + button is clicked and adds multiple tasks on submit", async () => {
    render(<Console />);

    await waitFor(() => {
      expect(screen.getByText("DeepInbox")).toBeInTheDocument();
    });

    const addBtn = screen.getByTitle("Add tasks to DeepInbox");
    fireEvent.click(addBtn);

    expect(screen.getByText("Add tasks to DeepInbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add tasks to the DeepInbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    // Verify tree is expanded and node is selected right away when + is clicked
    expect(screen.getAllByText("Deep Inbox Task").length).toBeGreaterThanOrEqual(1);

    const multilineInput = screen.getByLabelText("Tasks (one per line)");
    fireEvent.change(multilineInput, {
      target: { value: "Task Line 1\nTask Line 2\n\nTask Line 3" },
    });

    const submitBtn = screen.getByRole("button", { name: "Add tasks to the DeepInbox" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.addElement).toHaveBeenCalledWith(
        101,
        "Task Line 1",
        expect.stringContaining("Task Line 1")
      );
      expect(apiService.addElement).toHaveBeenCalledWith(
        101,
        "Task Line 2",
        expect.stringContaining("Task Line 2")
      );
      expect(apiService.addElement).toHaveBeenCalledWith(
        101,
        "Task Line 3",
        expect.stringContaining("Task Line 3")
      );
      expect(apiService.addElement).toHaveBeenCalledTimes(3);
    });
  });

  it("closes add tasks popup when Cancel button is clicked", async () => {
    render(<Console />);

    await waitFor(() => {
      expect(screen.getByText("DeepInbox")).toBeInTheDocument();
    });

    const addBtn = screen.getByTitle("Add tasks to DeepInbox");
    fireEvent.click(addBtn);

    expect(screen.getByText("Add tasks to DeepInbox")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText("Add tasks to DeepInbox")).not.toBeInTheDocument();
    });
  });

  it("toggles creation dates on and off for all tree elements using the top bar Dates switch", async () => {
    const { container } = render(<Console />);

    const personalInboxBtn = await screen.findByText("PersonalInbox");
    fireEvent.click(personalInboxBtn);

    await waitFor(() => {
      expect(screen.getByText("2024-01-10")).toBeInTheDocument();
      expect(screen.getByText("2024-04-12")).toBeInTheDocument();
      expect(screen.getByText("2024-05-18")).toBeInTheDocument();
    });

    const datesSwitch = screen.getByRole("checkbox", { name: "Dates" });
    expect(datesSwitch).toBeChecked();

    fireEvent.click(datesSwitch);

    expect(datesSwitch).not.toBeChecked();
    expect(container.querySelectorAll(".task-created-date").length).toBe(0);

    fireEvent.click(datesSwitch);

    expect(datesSwitch).toBeChecked();
    expect(screen.getByText("2024-01-10")).toBeInTheDocument();
    expect(screen.getByText("2024-04-12")).toBeInTheDocument();
    expect(screen.getByText("2024-05-18")).toBeInTheDocument();
  });

  it("blocks completing the main root node in both tree checkbox and item details", async () => {
    const { container } = render(<Console />);

    const rootName = await screen.findByText("Root");
    const rootCheckbox = container.querySelector('[elementid="1"] input[type="checkbox"]');
    expect(rootCheckbox).toBeDisabled();

    fireEvent.click(rootName);

    const finishBtn = await screen.findByRole("button", { name: "FINISH" });
    expect(finishBtn).toBeDisabled();

    fireEvent.click(finishBtn);
    expect(apiService.finish).not.toHaveBeenCalled();
  });

  it("displays the two 7-day bar charts below the editor when a bag node is selected", async () => {
    apiService.getLast7DaysTree.mockResolvedValue(mockTree);
    render(<Console />);

    const rootName = await screen.findByText("Root");
    fireEvent.click(rootName);

    expect(await screen.findByTestId("bag-charts")).toBeInTheDocument();
    expect(screen.getByText("Completed tasks (last 7 days)")).toBeInTheDocument();
    expect(screen.getByText("Tasks to do (last 7 days)")).toBeInTheDocument();
    await waitFor(() => {
      expect(apiService.getLast7DaysTree).toHaveBeenCalledWith(1);
    });
  });

  it("renders cached inbox buttons immediately while GetTree is still loading and allows instant non-blocking task creation", async () => {
    localStorage.setItem(
      "gt3_cached_inboxes",
      JSON.stringify([
        { elementId: 101, inboxName: "DeepInbox" },
        { elementId: 201, inboxName: "PersonalInbox" },
      ])
    );

    let resolveInitialTree;
    let resolveAddTask;
    apiService.GetTree
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveInitialTree = resolve;
          })
      )
      .mockResolvedValue(mockTree);

    apiService.addElement.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAddTask = resolve;
        })
    );

    render(<Console />);

    // Inbox buttons are rendered synchronously before GetTree finishes
    expect(screen.getByText("DeepInbox")).toBeInTheDocument();
    expect(screen.getByText("PersonalInbox")).toBeInTheDocument();
    expect(screen.getByTestId("tree-loading")).toBeInTheDocument();

    // Open + dialog while tree is still loading in the background
    const addBtn = screen.getByTitle("Add tasks to DeepInbox");
    fireEvent.click(addBtn);

    const multilineInput = screen.getByLabelText("Tasks (one per line)");
    fireEvent.change(multilineInput, {
      target: { value: "Quick Mobile Task" },
    });

    const submitBtn = screen.getByRole("button", { name: "Add tasks to the DeepInbox" });
    fireEvent.click(submitBtn);

    // Dialog closes immediately even though addElement & GetTree are still pending
    await waitFor(() => {
      expect(screen.queryByText("Add tasks to DeepInbox")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("pending-sync-indicator")).toHaveTextContent("Syncing (1)...");

    // Resolve background addElement and initial GetTree
    resolveAddTask(555);
    resolveInitialTree(mockTree);

    await waitFor(() => {
      expect(apiService.addElement).toHaveBeenCalledWith(
        101,
        "Quick Mobile Task",
        expect.stringContaining("Quick Mobile Task")
      );
      expect(screen.queryByTestId("pending-sync-indicator")).not.toBeInTheDocument();
      expect(screen.getAllByText("Deep Inbox Task").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("persists failed inbox tasks in localStorage and retries automatically when connection comes back online", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    apiService.addElement
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(777);

    render(<Console />);

    const addBtn = await screen.findByTitle("Add tasks to DeepInbox");
    fireEvent.click(addBtn);

    fireEvent.change(screen.getByLabelText("Tasks (one per line)"), {
      target: { value: "Offline Elevator Task" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add tasks to the DeepInbox" }));

    await waitFor(() => {
      expect(screen.getByTestId("pending-sync-indicator")).toHaveTextContent("Pending (1)");
    });
    expect(JSON.parse(localStorage.getItem("gt3_pending_inbox_tasks"))).toHaveLength(1);

    // Simulate phone regaining network connectivity
    window.dispatchEvent(new Event("online"));

    await waitFor(() => {
      expect(apiService.addElement).toHaveBeenCalledTimes(2);
      expect(screen.queryByTestId("pending-sync-indicator")).not.toBeInTheDocument();
      expect(localStorage.getItem("gt3_pending_inbox_tasks")).toBeNull();
    });

    consoleErrorSpy.mockRestore();
  });

  it("avoids duplicate GetTree call while Firebase auth is still initializing", async () => {
    localStorage.setItem(
      "gt3_cached_inboxes",
      JSON.stringify([{ elementId: 101, inboxName: "DeepInbox" }])
    );

    useAuth.mockReturnValue({ user: null, loading: true });
    const { rerender } = render(<Console />);

    // Cached inbox is already interactive while auth is loading, and GetTree hasn't fired prematurely
    expect(screen.getByText("DeepInbox")).toBeInTheDocument();
    expect(apiService.GetTree).not.toHaveBeenCalled();

    useAuth.mockReturnValue({ user: { uid: "user-123" }, loading: false });
    rerender(<Console />);

    await waitFor(() => {
      expect(apiService.GetTree).toHaveBeenCalledTimes(1);
    });
  });

  it("auto-opens add tasks modal immediately on ?quickAdd=1 (PWA shortcut) targeting last used inbox", async () => {
    localStorage.setItem(
      "gt3_cached_inboxes",
      JSON.stringify([
        { elementId: 101, inboxName: "DeepInbox" },
        { elementId: 201, inboxName: "PersonalInbox" },
      ])
    );
    localStorage.setItem("gt3_last_used_inbox", "201");
    window.history.pushState({}, "", "/?quickAdd=1");

    // Keep GetTree unresolved to verify 0 ms instant modal opening
    apiService.GetTree.mockImplementationOnce(() => new Promise(() => {}));

    render(<Console />);

    expect(await screen.findByText("Add tasks to PersonalInbox")).toBeInTheDocument();
    expect(screen.getByLabelText("Tasks (one per line)")).toHaveFocus();
    expect(window.location.search).toBe("");
  });

  it("auto-opens add tasks modal for a specific inbox when ?add=<InboxName> URL param is used", async () => {
    localStorage.setItem(
      "gt3_cached_inboxes",
      JSON.stringify([
        { elementId: 101, inboxName: "DeepInbox" },
        { elementId: 201, inboxName: "PersonalInbox" },
      ])
    );
    window.history.pushState({}, "", "/?add=personalinbox");

    render(<Console />);

    expect(await screen.findByText("Add tasks to PersonalInbox")).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("remembers last used inbox for + Quick Add button and allows switching inbox via modal chips", async () => {
    render(<Console />);

    const quickAddBtn = await screen.findByTestId("quick-add-btn");
    fireEvent.click(quickAddBtn);

    // Defaults to first inbox when none used yet
    expect(screen.getByText("Add tasks to DeepInbox")).toBeInTheDocument();

    // Switch target inbox directly inside the modal via selector chip
    const selector = screen.getByTestId("dialog-inbox-selector");
    const personalChip = Array.from(selector.querySelectorAll("button")).find(
      (btn) => btn.textContent === "PersonalInbox"
    );
    fireEvent.click(personalChip);

    expect(screen.getByText("Add tasks to PersonalInbox")).toBeInTheDocument();
    expect(localStorage.getItem("gt3_last_used_inbox")).toBe("201");

    // Close and re-open via + Quick Add -> opens directly on PersonalInbox
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByText("Add tasks to PersonalInbox")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("quick-add-btn"));
    expect(screen.getByText("Add tasks to PersonalInbox")).toBeInTheDocument();
  });
});
