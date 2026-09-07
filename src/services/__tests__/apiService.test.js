import axios from "axios";
import apiService from "../apiService";
import { getAuthToken } from "../../Session/firebase";
import { toast } from "react-toastify";

jest.mock("axios");

jest.mock("react-toastify", () => ({
  toast: {
    promise: jest.fn((promise) => promise),
  },
}));

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

describe("apiService long-running session and token handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toast.promise.mockImplementation((promise) => promise);
  });

  it("calls authorized endpoints with the token from getAuthToken", async () => {
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
  });
});
