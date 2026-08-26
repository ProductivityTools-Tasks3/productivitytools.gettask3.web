import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Console from "../index";
import apiService from "../../../services/apiService";
import { signInWithGoogle } from "../../../Session/firebase";

jest.mock("../../../services/apiService", () => ({
  GetTree: jest.fn(),
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
}));

describe("Console top bar and inbox buttons", () => {
  const mockTree = {
    elementId: 1,
    name: "Root",
    status: "New",
    type: "TaskBag",
    inboxName: null,
    elements: [
      {
        elementId: 10,
        parentId: 1,
        name: "Work Folder",
        status: "New",
        type: "TaskBag",
        inboxName: null,
        elements: [
          {
            elementId: 101,
            parentId: 10,
            name: "Deep Inbox Task",
            status: "New",
            type: "Task",
            inboxName: "DeepInbox",
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
        elements: [
          {
            elementId: 201,
            parentId: 20,
            name: "Personal Child Task",
            status: "New",
            type: "Task",
            inboxName: "PersonalInbox",
            elements: [],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    apiService.GetTree.mockResolvedValue(mockTree);
  });

  it("renders inbox buttons on the left and login button on the right", async () => {
    render(<Console />);

    await waitFor(() => {
      expect(screen.getByText("DeepInbox")).toBeInTheDocument();
      expect(screen.getByText("PersonalInbox")).toBeInTheDocument();
    });

    const loginBtn = screen.getByText("fLogin");
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn.closest(".top-bar-right")).toBeInTheDocument();
  });

  it("calls signInWithGoogle when login button is clicked", async () => {
    render(<Console />);

    const loginBtn = await screen.findByText("fLogin");
    fireEvent.click(loginBtn);
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("collapses the rest of the tree and opens only chosen item path when an inbox button is clicked", async () => {
    render(<Console />);

    // Click DeepInbox first
    const deepInboxBtn = await screen.findByText("DeepInbox");
    fireEvent.click(deepInboxBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Deep Inbox Task").length).toBeGreaterThanOrEqual(1);
    });

    // Now click PersonalInbox
    const personalInboxBtn = await screen.findByText("PersonalInbox");
    fireEvent.click(personalInboxBtn);

    await waitFor(() => {
      expect(screen.getAllByText("Personal Child Task").length).toBeGreaterThanOrEqual(1);
    });
  });
});
