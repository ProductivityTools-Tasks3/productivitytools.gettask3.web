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

  const multiNodeTree = {
    elementId: 1,
    name: "Root Parent",
    status: "New",
    type: "TaskBag",
    elements: [
      {
        elementId: 10,
        parentId: 1,
        name: "Child Task 1",
        status: "New",
        type: "Task",
        elements: [],
      },
      {
        elementId: 20,
        parentId: 1,
        name: "Child Task 2",
        status: "New",
        type: "Task",
        elements: [],
      },
    ],
  };

  it("highlights only the currently selectedElement and updates when selectedElement changes", () => {
    const { rerender, container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={multiNodeTree}
          expanded={["1"]}
          selectedElement={{ elementId: 10 }}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    const child1Item = container.querySelector('[elementid="10"]');
    const child2Item = container.querySelector('[elementid="20"]');
    const rootItem = container.querySelector('[elementid="1"]');

    expect(child1Item).toHaveClass("Mui-selected");
    expect(child2Item).not.toHaveClass("Mui-selected");
    expect(rootItem).not.toHaveClass("Mui-selected");

    rerender(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={multiNodeTree}
          expanded={["1"]}
          selectedElement={{ elementId: 20 }}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    expect(child1Item).not.toHaveClass("Mui-selected");
    expect(child2Item).toHaveClass("Mui-selected");
    expect(rootItem).not.toHaveClass("Mui-selected");
  });

  it("calls nodeSelect when task is clicked and does not select when checkbox is clicked", () => {
    const handleSelect = jest.fn();
    const handleFinish = jest.fn();
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={multiNodeTree}
          expanded={["1"]}
          selectedElement={{ elementId: 10 }}
          nodeSelect={handleSelect}
          finishAction={handleFinish}
          unDoneAction={jest.fn()}
        />
      </DndProvider>
    );

    const child2Name = screen.getByText("Child Task 2");
    child2Name.click();
    expect(handleSelect).toHaveBeenCalledWith(20);

    handleSelect.mockClear();

    const child1Checkbox = container.querySelector('[elementid="10"] input[type="checkbox"]');
    child1Checkbox.click();
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("displays count badge only when elements.length > 0", () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={multiNodeTree}
          expanded={["1"]}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    // Root is TaskBag with 2 children
    const rootBox = container.querySelector('[elementid="1"] .tree-node-box');
    expect(rootBox.querySelector(".task-count-badge")).toHaveTextContent("2");

    // Child 1 is Task with 0 children
    const child1Box = container.querySelector('[elementid="10"] .tree-node-box');
    expect(child1Box.querySelector(".task-count-badge")).not.toBeInTheDocument();
  });

  it("renders InProgress task with InProgress class when selected", () => {
    const treeWithInProgress = {
      elementId: 1,
      name: "Root",
      status: "New",
      type: "TaskBag",
      elements: [
        {
          elementId: 10,
          parentId: 1,
          name: "In Progress Task",
          status: "InProgress",
          type: "Task",
          elements: [],
        },
      ],
    };

    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={treeWithInProgress}
          expanded={["1"]}
          selectedElement={{ elementId: 10 }}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    const taskItem = container.querySelector('[elementid="10"]');
    expect(taskItem).toHaveClass("Mui-selected");
    const taskSpan = taskItem.querySelector(".task-name-span");
    expect(taskSpan).toHaveClass("InProgress");
    expect(taskSpan.querySelector(".task-name-text")).toHaveTextContent("In Progress Task");
  });

  it("displays creation date in yyyy-MM-dd format and hides it when showCreatedDate is false", () => {
    const treeWithDates = {
      elementId: 1,
      name: "Root With Date",
      status: "New",
      type: "TaskBag",
      created: "2024-05-15T14:30:00.000Z",
      elements: [
        {
          elementId: 10,
          parentId: 1,
          name: "Child With Date",
          status: "New",
          type: "Task",
          created: "2026-03-01T08:05:12.123",
          elements: [],
        },
        {
          elementId: 20,
          parentId: 1,
          name: "Child With MinValue Date",
          status: "New",
          type: "Task",
          created: "0001-01-01T00:00:00",
          elements: [],
        },
      ],
    };

    const { rerender, container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={treeWithDates}
          expanded={["1"]}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    const rootDate = container.querySelector('[elementid="1"] .task-created-date');
    expect(rootDate).toHaveTextContent("2024-05-15");

    const childDate = container.querySelector('[elementid="10"] .task-created-date');
    expect(childDate).toHaveTextContent("2026-03-01");

    const minValueChildDate = container.querySelector('[elementid="20"] .task-created-date');
    expect(minValueChildDate).not.toBeInTheDocument();

    rerender(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={treeWithDates}
          expanded={["1"]}
          showCreatedDate={false}
          nodeSelect={jest.fn()}
        />
      </DndProvider>
    );

    expect(container.querySelector(".task-created-date")).not.toBeInTheDocument();
  });

  it("disables checkbox on root (User/email) node and keeps child task checkboxes enabled", () => {
    const handleFinish = jest.fn();
    const userRootTree = {
      elementId: 1,
      parentId: null,
      name: "user@example.com",
      status: "New",
      type: "User",
      elements: [
        {
          elementId: 10,
          parentId: 1,
          name: "Child Task",
          status: "New",
          type: "Task",
          elements: [],
        },
      ],
    };

    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <StructureTree
          list={userRootTree}
          expanded={["1"]}
          nodeSelect={jest.fn()}
          finishAction={handleFinish}
          unDoneAction={jest.fn()}
        />
      </DndProvider>
    );

    const rootCheckbox = container.querySelector('[elementid="1"] input[type="checkbox"]');
    const childCheckbox = container.querySelector('[elementid="10"] input[type="checkbox"]');

    expect(rootCheckbox).toBeDisabled();
    expect(childCheckbox).not.toBeDisabled();

    rootCheckbox.click();
    expect(handleFinish).not.toHaveBeenCalled();

    childCheckbox.click();
    expect(handleFinish).toHaveBeenCalledWith(10, "Finished");
  });
});
