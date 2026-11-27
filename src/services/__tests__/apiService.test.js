import axios from "axios";
import apiService from "../apiService";
import statusService from "../statusService";
import { getAuthToken } from "../../Session/firebase";

jest.mock("axios");

jest.mock("../../Session/firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(),
      refreshToken: "mock-refresh-token",
    },
  },
  getAuthToken: jest.fn(),
  waitForAuth: jest.fn(),
}));

describe("apiService long-running session, token handling, and statusService reporting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    statusService.reset();
  });

  it("calls authorized endpoints with the token from getAuthToken and reports success to statusService", async () => {
    getAuthToken.mockResolvedValue("valid-fresh-token");
    axios.post.mockResolvedValue({ data: { success: true } });

    const result = await apiService.finish(123);

    expect(getAuthToken).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("Task/Finish"),
      { ElementId: 123 },
      { headers: { Authorization: "Bearer valid-fresh-token" } }
    );
    expect(result).toEqual({ success: true });

    const status = statusService.getState();
    expect(status.current.type).toBe("success");
    expect(status.current.message).toBe("Task set to finished on the server");
    expect(status.current.durationMs).toEqual(expect.any(Number));
  });

  it("reports error to statusService when an API request fails", async () => {
    getAuthToken.mockResolvedValue("valid-fresh-token");
    axios.post.mockRejectedValue(new Error("Server unavailable"));

    await expect(apiService.updateElement(1, 10, "Task", "[]")).rejects.toThrow("Server unavailable");

    const status = statusService.getState();
    expect(status.current.type).toBe("error");
    expect(status.current.message).toBe("Server unavailable");
  });

  it("automatically force-refreshes token and retries when encountering a 401 response", async () => {
    getAuthToken.mockResolvedValueOnce("stale-expired-token");
    getAuthToken.mockResolvedValueOnce("new-refreshed-token");

    const error401 = { response: { status: 401 } };

    axios.post
      .mockRejectedValueOnce(error401)
      .mockResolvedValueOnce({ data: { tree: "loaded" } });

    const result = await apiService.GetTree();

    expect(getAuthToken).toHaveBeenCalledTimes(2);
    expect(getAuthToken).toHaveBeenNthCalledWith(1);
    expect(getAuthToken).toHaveBeenNthCalledWith(2, true);

    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("Task/TodayList"),
      { ElementId: null, Path: "" },
      { headers: { Authorization: "Bearer new-refreshed-token" } }
    );
    expect(result).toEqual({ tree: "loaded" });

    const status = statusService.getState();
    expect(status.current.type).toBe("success");
    expect(status.current.message).toBe("Task tree received!");
  });
});
