import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BagCharts, { buildLast7DaysStats } from "../index";
import apiService from "../../../services/apiService";

jest.mock("../../../services/apiService", () => ({
  getLast7DaysTree: jest.fn(),
}));

describe("BagCharts", () => {
  const referenceDate = new Date(2026, 10, 12); // 2026-11-12

  const sampleBag = {
    elementId: 10,
    parentId: 1,
    name: "Work Bag",
    type: "TaskBag",
    status: "New",
    elements: [
      {
        // Always open (created before window)
        elementId: 101,
        parentId: 10,
        name: "Old Open Task",
        type: "Task",
        status: "New",
        created: "2026-10-01T10:00:00",
        finished: null,
        elements: [],
      },
      {
        // Created on 2026-11-08, still open
        elementId: 102,
        parentId: 10,
        name: "New Open Task",
        type: "Task",
        status: "InProgress",
        created: "2026-11-08T09:00:00",
        finished: null,
        elements: [],
      },
      {
        // Created before window, finished on 2026-11-10 -> open on 11-06..11-09, completed on 11-10
        elementId: 103,
        parentId: 10,
        name: "Finished Mid Week",
        type: "Task",
        status: "Finished",
        created: "2026-11-01T08:00:00",
        finished: "2026-11-10T15:30:00",
        elements: [],
      },
      {
        // Sub-bag should not be counted as a task itself, but its descendant tasks should be
        elementId: 20,
        parentId: 10,
        name: "Sub Bag",
        type: "TaskBag",
        status: "New",
        created: "2026-10-01T10:00:00",
        elements: [
          {
            // Created and finished on 2026-11-12
            elementId: 201,
            parentId: 20,
            name: "Same Day Sub Task",
            type: "Task",
            status: "Finished",
            created: "2026-11-12T08:00:00",
            finished: "2026-11-12T17:00:00",
            elements: [],
          },
          {
            // Deleted task should be ignored
            elementId: 202,
            parentId: 20,
            name: "Deleted Task",
            type: "Task",
            status: "Deleted",
            created: "2026-10-01T08:00:00",
            finished: null,
            elements: [],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("computes daily completed and to-do task counts recursively across the last 7 days", () => {
    const stats = buildLast7DaysStats(sampleBag, referenceDate);

    expect(stats.days.map((d) => d.dateKey)).toEqual([
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
    ]);

    expect(stats.days.map((d) => d.completed)).toEqual([0, 0, 0, 0, 1, 0, 1]);
    expect(stats.days.map((d) => d.todo)).toEqual([2, 2, 3, 3, 2, 2, 2]);
    expect(stats.totalCompleted).toBe(2);
    expect(stats.currentTodo).toBe(2);
  });

  it("fetches last 7 days data from apiService and renders both bar charts", async () => {
    apiService.getLast7DaysTree.mockResolvedValue(sampleBag);

    const todayOnlyBag = {
      elementId: 10,
      parentId: 1,
      name: "Work Bag",
      type: "TaskBag",
      status: "New",
      elements: [],
    };

    render(<BagCharts bagElement={todayOnlyBag} referenceDate={referenceDate} />);

    expect(screen.getByText("Completed tasks (last 7 days)")).toBeInTheDocument();
    expect(screen.getByText("Tasks to do (last 7 days)")).toBeInTheDocument();

    await waitFor(() => {
      expect(apiService.getLast7DaysTree).toHaveBeenCalledWith(10);
      expect(screen.getByTestId("bar-value-completed-2026-11-10")).toHaveTextContent("1");
      expect(screen.getByTestId("bar-value-completed-2026-11-12")).toHaveTextContent("1");
      expect(screen.getByTestId("bar-value-todo-2026-11-08")).toHaveTextContent("3");
      expect(screen.getByTestId("bar-value-todo-2026-11-12")).toHaveTextContent("2");
    });
  });

  it("falls back to passed bagElement when getLast7DaysTree fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    apiService.getLast7DaysTree.mockRejectedValue(new Error("Network error"));

    render(<BagCharts bagElement={sampleBag} referenceDate={referenceDate} />);

    await waitFor(() => {
      expect(apiService.getLast7DaysTree).toHaveBeenCalledWith(10);
      expect(screen.getByTestId("bar-value-todo-2026-11-12")).toHaveTextContent("2");
    });

    consoleErrorSpy.mockRestore();
  });
});
