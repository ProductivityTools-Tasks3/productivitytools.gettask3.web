import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SessionBar from "../SessionBar";
import { useAuth } from "../AuthContext";
import statusService from "../../services/statusService";

jest.mock("../AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("SessionBar", () => {
  const mockRefreshToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    statusService.reset();
    mockRefreshToken.mockResolvedValue("fresh-token");
    useAuth.mockReturnValue({
      user: { email: "pwujczyk@gmail.com" },
      tokenRefreshTime: new Date(2026, 10, 27, 10, 15, 30),
      refreshToken: mockRefreshToken,
    });
  });

  it("displays session email, online status, Ready state, and token refresh timestamp", () => {
    render(<SessionBar />);

    expect(screen.getByText("pwujczyk@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByTestId("session-bar-status")).toHaveTextContent("Ready");
    expect(screen.getByTestId("token-refresh-info")).toHaveTextContent("2026.11.27 10:15:30");
  });

  it("shows live record save status updates and opens the Debug Activity Log popover", () => {
    render(<SessionBar />);

    act(() => {
      const opId = statusService.start("Request to update element");
      statusService.success(opId, "Element updated");
    });

    expect(screen.getByTestId("session-bar-status")).toHaveTextContent("Element updated");

    fireEvent.click(screen.getByTestId("session-bar-status"));
    expect(screen.getByText("Debug Activity Log")).toBeInTheDocument();
    expect(screen.getByText("(1 entry)")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Clear log"));
    expect(screen.getByText("No activity recorded yet")).toBeInTheDocument();
  });

  it("forces token refresh when refresh button is clicked", async () => {
    render(<SessionBar />);

    fireEvent.click(screen.getByLabelText("Force token refresh"));

    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("session-bar-status")).toHaveTextContent(
        "Token refreshed successfully"
      );
    });
  });
});
