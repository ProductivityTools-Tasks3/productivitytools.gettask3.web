import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PlateEditor from "../index";

describe("PlateEditor", () => {
  const sampleValue = [
    {
      type: "title",
      children: [{ text: "My Task Title" }],
    },
    {
      type: "p",
      children: [{ text: "Task description details" }],
    },
  ];

  it("renders editor with initial content", () => {
    const handleContentChanged = jest.fn();
    render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={handleContentChanged}
      />
    );

    expect(screen.getByText("My Task Title")).toBeInTheDocument();
    expect(screen.getByText("Task description details")).toBeInTheDocument();
  });

  it("renders formatting toolbar buttons", () => {
    render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
      />
    );

    // Verify presence of Heading buttons and Table button
    expect(screen.getByLabelText("Heading 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Bullet List")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordered List")).toBeInTheDocument();
    expect(screen.getByLabelText("Table")).toBeInTheDocument();
  });

  it("refreshes editor content when forceResetContent changes (e.g. on task selection)", () => {
    const { rerender } = render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
      />
    );

    expect(screen.getByText("My Task Title")).toBeInTheDocument();

    const newSelectedTaskValue = [
      {
        type: "title",
        children: [{ text: "Another Selected Task" }],
      },
      {
        type: "p",
        children: [{ text: "New task body content" }],
      },
    ];

    rerender(
      <PlateEditor
        content={newSelectedTaskValue}
        forceResetContent={newSelectedTaskValue}
        contentChanged={jest.fn()}
      />
    );

    expect(screen.getByText("Another Selected Task")).toBeInTheDocument();
    expect(screen.getByText("New task body content")).toBeInTheDocument();
  });

  it("toggles debug panel when show debug is clicked", () => {
    render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(screen.queryByText("Plate content:")).not.toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(screen.getByText("Plate content:")).toBeInTheDocument();
  });
});
