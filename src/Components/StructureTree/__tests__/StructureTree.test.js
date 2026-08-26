import React from "react";
import { render, screen } from "@testing-library/react";
import StructureTree from "../index";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

describe("StructureTree", () => {
  const treeData = {
    elementId: 1,
    name: "Root Task with Inbox",
    status: "New",
    type: "TaskBag",
    inboxName: "MyCustomInbox",
    elements: [],
  };

  const treeDataWithoutInbox = {
    elementId: 2,
    name: "Root Task without Inbox",
    status: "New",
    type: "TaskBag",
    inboxName: null,
    elements: [],
  };

  it("applies 'has-inbox-name' class to tree node when inboxName is filled", () => {
    const { rerender } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree list={treeData} nodeSelect={jest.fn()} />
      </DndProvider>
    );

    const taskWithInbox = screen.getByText("Root Task with Inbox").closest(".task-name-span");
    expect(taskWithInbox).toHaveClass("has-inbox-name");

    rerender(
      <DndProvider backend={HTML5Backend}>
        <StructureTree list={treeDataWithoutInbox} nodeSelect={jest.fn()} />
      </DndProvider>
    );

    const taskWithoutInbox = screen.getByText("Root Task without Inbox").closest(".task-name-span");
    expect(taskWithoutInbox).not.toHaveClass("has-inbox-name");
  });
});
