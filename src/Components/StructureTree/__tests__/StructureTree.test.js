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
});
