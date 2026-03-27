import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

// Mock server-only module before importing anything that depends on it
vi.mock("server-only", () => ({}));

// Mock the action modules
vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

vi.mock("next/navigation");

import { useAuth } from "../use-auth";
import * as authActions from "@/actions";
import * as anonWorkTracker from "@/lib/anon-work-tracker";
import * as projectActions from "@/actions/get-projects";
import * as createProjectAction from "@/actions/create-project";

describe("useAuth", () => {
  const mockPush = vi.fn();
  const mockProject = { id: "project-1", name: "Test Project" };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  describe("signIn", () => {
    it("should set isLoading to true during sign in", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should call signInAction with email and password", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: false });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(authActions.signIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("should return the result from signInAction", async () => {
      const mockResult = { success: false, error: "Invalid credentials" };
      vi.mocked(authActions.signIn).mockResolvedValue(mockResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password"
        );
      });

      expect(signInResult).toEqual(mockResult);
    });

    it("should handle post-sign-in logic on successful sign in", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should not call handlePostSignIn on failed sign in", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should reset isLoading to false even if signInAction throws", async () => {
      vi.mocked(authActions.signIn).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signIn("test@example.com", "password");
        })
      ).rejects.toThrow("Network error");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should set isLoading to true during sign up", async () => {
      vi.mocked(authActions.signUp).mockResolvedValue({
        success: false,
        error: "Email already exists",
      });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should call signUpAction with email and password", async () => {
      vi.mocked(authActions.signUp).mockResolvedValue({ success: false });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(authActions.signUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("should return the result from signUpAction", async () => {
      const mockResult = { success: false, error: "Email already exists" };
      vi.mocked(authActions.signUp).mockResolvedValue(mockResult);
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password"
        );
      });

      expect(signUpResult).toEqual(mockResult);
    });

    it("should handle post-sign-up logic on successful sign up", async () => {
      vi.mocked(authActions.signUp).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should not call handlePostSignIn on failed sign up", async () => {
      vi.mocked(authActions.signUp).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should reset isLoading to false even if signUpAction throws", async () => {
      vi.mocked(authActions.signUp).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signUp("test@example.com", "password");
        })
      ).rejects.toThrow("Network error");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn", () => {
    it("should create project with anonymous work if it exists", async () => {
      const anonWorkData = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: anonWorkData.messages,
        data: anonWorkData.fileSystemData,
      });
    });

    it("should clear anonymous work after project creation", async () => {
      const anonWorkData = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(anonWorkTracker.clearAnonWork).toHaveBeenCalled();
    });

    it("should redirect to anonymous work project", async () => {
      const anonWorkData = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should not try to get projects if anonymous work exists", async () => {
      const anonWorkData = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(projectActions.getProjects).not.toHaveBeenCalled();
    });

    it("should not create project if anonymous work has no messages", async () => {
      const anonWorkData = {
        messages: [],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledTimes(1);
      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("New Design"),
        messages: [],
        data: {},
      });
    });

    it("should redirect to most recent project if anonymous work does not exist", async () => {
      const project1 = { id: "project-1" };
      const project2 = { id: "project-2" };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([
        project1,
        project2,
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should create new project if user has no existing projects", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectAction.createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
    });

    it("should generate unique project names with random number", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result: result1 } = renderHook(() => useAuth());
      const { result: result2 } = renderHook(() => useAuth());

      await act(async () => {
        await result1.current.signIn("test@example.com", "password");
      });

      const firstCall = vi.mocked(createProjectAction.createProject).mock
        .calls[0];

      vi.clearAllMocks();
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });

      await act(async () => {
        await result2.current.signIn("test@example.com", "password");
      });

      const secondCall = vi.mocked(createProjectAction.createProject).mock
        .calls[0];

      expect(firstCall[0].name).toMatch(/^New Design #\d+$/);
      expect(secondCall[0].name).toMatch(/^New Design #\d+$/);
    });
  });

  describe("edge cases", () => {
    it("should handle null anonymous work data", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);
      vi.mocked(projectActions.getProjects).mockResolvedValue([]);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(projectActions.getProjects).toHaveBeenCalled();
    });

    it("should reset isLoading to false after signIn completes", async () => {
      vi.mocked(authActions.signIn).mockResolvedValue({ success: false });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should reset isLoading to false after signUp completes", async () => {
      vi.mocked(authActions.signUp).mockResolvedValue({ success: false });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should use current date for anonymous work project name", async () => {
      const anonWorkData = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { files: {} },
      };

      vi.mocked(authActions.signIn).mockResolvedValue({ success: true });
      vi.mocked(anonWorkTracker.getAnonWorkData).mockReturnValue(anonWorkData);
      vi.mocked(createProjectAction.createProject).mockResolvedValue(
        mockProject
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      const callArgs = vi.mocked(createProjectAction.createProject).mock
        .calls[0][0];
      expect(callArgs.name).toContain("Design from");
    });
  });
});
