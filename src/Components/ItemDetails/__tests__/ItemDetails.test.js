import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ItemDetails from "../index";
import apiService from "../../../services/apiService";

jest.mock("../../../services/apiService", () => ({
  updateElement: jest.fn().mockResolvedValue({}),
  addElement: jest.fn().mockResolvedValue(123),
  start: jest.fn().mockResolvedValue({}),
  changeType: jest.fn().mockResolvedValue(true),
  setInboxName: jest.fn().mockResolvedValue({}),
  clearInboxName: jest.fn().mockResolvedValue({}),
}));

describe("ItemDetails", () => {
  const initialTask = {
    elementId: 10,
    parentId: 1,
    name: "Task 10",
    type: "Task",
    status: "InProgress",
    inboxName: null,
    details: JSON.stringify([
      { type: "title", children: [{ text: "Task 10 Title" }] },
      { type: "p", children: [{ text: "Task 10 Body" }] },
    ]),
  };

  it("renders task title, body, status badge, and 'Set inbox name' button", () => {
    render(<ItemDetails selectedElement={initialTask} onChange={jest.fn()} />);

    expect(screen.getByText("Task 10 Title")).toBeInTheDocument();
    expect(screen.getByText("Task 10 Body")).toBeInTheDocument();
    expect(screen.getByText("InProgress")).toBeInTheDocument();
    expect(screen.getByText("Set inbox name")).toBeInTheDocument();
  });

  it("renders inbox name on button when inboxName is filled", () => {
    const taskWithInbox = { ...initialTask, inboxName: "PersonalInbox" };
    render(<ItemDetails selectedElement={taskWithInbox} onChange={jest.fn()} />);

    expect(screen.getByText("PersonalInbox")).toBeInTheDocument();
  });

  it("opens popup dialog when inbox name button is clicked and allows saving new inbox name", async () => {
    const handleChange = jest.fn();
    render(<ItemDetails selectedElement={initialTask} onChange={handleChange} />);

    const inboxBtn = screen.getByText("Set inbox name");
    fireEvent.click(inboxBtn);

    expect(screen.getByText("Set Inbox Name")).toBeInTheDocument();
    const input = screen.getByLabelText("Inbox Name");
    fireEvent.change(input, { target: { value: "WorkInbox" } });

    const saveBtn = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiService.setInboxName).toHaveBeenCalledWith(10, "WorkInbox");
      expect(handleChange).toHaveBeenCalledWith("inboxName", "WorkInbox");
    });
  });

  it("allows clearing inbox name via dialog Clear button", async () => {
    const handleChange = jest.fn();
    const taskWithInbox = { ...initialTask, inboxName: "WorkInbox" };
    render(<ItemDetails selectedElement={taskWithInbox} onChange={handleChange} />);

    const inboxBtn = screen.getByText("WorkInbox");
    fireEvent.click(inboxBtn);

    const clearBtn = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(apiService.clearInboxName).toHaveBeenCalledWith(10);
      expect(handleChange).toHaveBeenCalledWith("inboxName", null);
    });
  });

  it("calls apiService.updateElement and onChange with updated details on Save", async () => {
    const handleChange = jest.fn();
    render(<ItemDetails selectedElement={initialTask} onChange={handleChange} />);

    const saveBtn = screen.getByText("SAVE");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiService.updateElement).toHaveBeenCalledWith(
        initialTask.parentId,
        initialTask.elementId,
        initialTask.name,
        expect.stringContaining("Task 10 Title")
      );
      expect(handleChange).toHaveBeenCalledWith(
        "details",
        expect.stringContaining("Task 10 Title")
      );
    });
  });

  it("renders Back button when onBack is provided and calls it when clicked", () => {
    const handleBack = jest.fn();
    render(<ItemDetails selectedElement={initialTask} onChange={jest.fn()} onBack={handleBack} />);

    const backBtn = screen.getByText("← Tasks");
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("switches to new task when selectedElement changes", () => {
    const { rerender } = render(
      <ItemDetails selectedElement={initialTask} onChange={jest.fn()} />
    );
    expect(screen.getByText("Task 10 Title")).toBeInTheDocument();

    const secondTask = {
      elementId: 20,
      parentId: 1,
      name: "Task 20",
      type: "Task",
      status: "Finished",
      inboxName: "SecondInbox",
      details: JSON.stringify([
        { type: "title", children: [{ text: "Task 20 Title" }] },
        { type: "p", children: [{ text: "Task 20 Body" }] },
      ]),
    };

    rerender(<ItemDetails selectedElement={secondTask} onChange={jest.fn()} />);
    expect(screen.getByText("Task 20 Title")).toBeInTheDocument();
    expect(screen.getByText("Task 20 Body")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(screen.getByText("SecondInbox")).toBeInTheDocument();
  });
});
