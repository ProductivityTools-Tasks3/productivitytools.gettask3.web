import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("renders upgraded formatting, color, list, and table toolbar buttons without image upload button", () => {
    render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
      />
    );

    // Headings
    expect(screen.getByLabelText("Heading 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading 2")).toBeInTheDocument();
    // Text marks (new from Journal.Web)
    expect(screen.getByLabelText("Bold (Ctrl+B)")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic (Ctrl+I)")).toBeInTheDocument();
    expect(screen.getByLabelText("Underline (Ctrl+U)")).toBeInTheDocument();
    expect(screen.getByLabelText("Strikethrough (Ctrl+Shift+X)")).toBeInTheDocument();
    // Colors (new from Journal.Web)
    expect(screen.getByLabelText("Red (Ctrl+M → R)")).toBeInTheDocument();
    expect(screen.getByLabelText("Green (Ctrl+M → G)")).toBeInTheDocument();
    expect(screen.getByLabelText("Blue (Ctrl+M → B)")).toBeInTheDocument();
    expect(screen.getByLabelText("Color Picker")).toBeInTheDocument();
    // Lists & tables
    expect(screen.getByLabelText("Bullet List")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordered List")).toBeInTheDocument();
    expect(screen.getByLabelText("Insert Table")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Table")).toBeInTheDocument();
    expect(screen.getByLabelText("Add Row")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Row")).toBeInTheDocument();
    expect(screen.getByLabelText("Add Column")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove Column")).toBeInTheDocument();

    // Image upload button intentionally omitted
    expect(screen.queryByLabelText(/obrazek|image/i)).not.toBeInTheDocument();
  });

  it("opens and closes the keyboard color context menu on Ctrl+M and Escape", () => {
    const { container } = render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
      />
    );

    const editable = container.querySelector('[contenteditable="true"]');
    Object.defineProperty(editable, "isContentEditable", { value: true, configurable: true });
    expect(screen.queryByTestId("color-context-menu")).not.toBeInTheDocument();

    fireEvent.keyDown(editable, { key: "m", code: "KeyM", ctrlKey: true });
    expect(screen.getByTestId("color-context-menu")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("color-context-menu")).not.toBeInTheDocument();
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

  it("shows debug panel only when showDebug prop is enabled", () => {
    const { rerender } = render(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
        showDebug={false}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText("Plate content:")).not.toBeInTheDocument();

    rerender(
      <PlateEditor
        content={sampleValue}
        forceResetContent={sampleValue}
        contentChanged={jest.fn()}
        showDebug={true}
      />
    );

    expect(screen.getByText("Plate content:")).toBeInTheDocument();
  });

  it("renders Journal back-link ('Zadanie utworzone w notatce') and opens it in a new tab on click", () => {
    const journalUrl = "https://journal.productivitytools.top/List?treeId=42&pageId=99";
    const journalTaskValue = [
      {
        type: "title",
        children: [{ text: "Zadanie z notatki" }],
      },
      {
        type: "p",
        children: [
          { text: "Zadanie utworzone w " },
          {
            type: "a",
            url: journalUrl,
            children: [{ text: "notatce" }],
          },
          { text: "" },
        ],
      },
    ];

    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    try {
      render(
        <PlateEditor
          content={journalTaskValue}
          forceResetContent={journalTaskValue}
          contentChanged={jest.fn()}
        />
      );

      expect(screen.getByText("Zadanie z notatki")).toBeInTheDocument();
      expect(screen.getByText(/Zadanie utworzone w/)).toBeInTheDocument();

      const link = screen.getByRole("link", { name: "notatce" });
      expect(link).toHaveAttribute("href", journalUrl);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveClass("plate-link");

      // Clicking the rendered text inside the editable link opens the Journal page in a new tab
      fireEvent.click(screen.getByText("notatce"));
      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(journalUrl, "_blank", "noopener,noreferrer");

      // Alt+Click and Shift+Click do not navigate so users can still edit/select text around links
      fireEvent.click(link, { altKey: true });
      fireEvent.click(link, { shiftKey: true });
      expect(openSpy).toHaveBeenCalledTimes(1);

      // Drag-selection over the link does not navigate
      const getSelectionSpy = jest.spyOn(window, "getSelection").mockReturnValue({
        toString: () => "notatce",
      });
      try {
        fireEvent.click(link);
        expect(openSpy).toHaveBeenCalledTimes(1);
      } finally {
        getSelectionSpy.mockRestore();
      }
    } finally {
      openSpy.mockRestore();
    }
  });

  it("blocks unsafe link schemes such as javascript: from rendering href or opening on click", () => {
    const unsafeLinkValue = [
      {
        type: "title",
        children: [{ text: "Unsafe link task" }],
      },
      {
        type: "p",
        children: [
          { text: "Link: " },
          {
            type: "a",
            url: "javascript:alert(1)",
            children: [{ text: "bad link" }],
          },
          { text: "" },
        ],
      },
    ];

    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    try {
      const { container } = render(
        <PlateEditor
          content={unsafeLinkValue}
          forceResetContent={unsafeLinkValue}
          contentChanged={jest.fn()}
        />
      );

      const anchor = container.querySelector("a.plate-link");
      expect(anchor).toBeInTheDocument();
      expect(anchor).not.toHaveAttribute("href");

      fireEvent.click(anchor);
      expect(openSpy).not.toHaveBeenCalled();
    } finally {
      openSpy.mockRestore();
    }
  });
});
