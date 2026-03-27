import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

function makeToolInvocation(
  toolName: string,
  args: Record<string, string>,
  state: ToolInvocation["state"] = "call"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result: "ok" } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor", () => {
    test("shows 'Creating' for create command", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "create", path: "/App.tsx" })}
        />
      );
      expect(screen.getByText("Creating App.tsx")).toBeDefined();
    });

    test("shows 'Editing' for str_replace command", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" })}
        />
      );
      expect(screen.getByText("Editing Button.tsx")).toBeDefined();
    });

    test("shows 'Editing' for insert command", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "insert", path: "/index.tsx" })}
        />
      );
      expect(screen.getByText("Editing index.tsx")).toBeDefined();
    });

    test("shows 'Reading' for view command", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "view", path: "/App.tsx" })}
        />
      );
      expect(screen.getByText("Reading App.tsx")).toBeDefined();
    });

    test("extracts filename from nested path", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "create", path: "/src/components/Card.tsx" })}
        />
      );
      expect(screen.getByText("Creating Card.tsx")).toBeDefined();
    });
  });

  describe("file_manager", () => {
    test("shows 'Deleting' for delete command", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("file_manager", { command: "delete", path: "/OldComponent.tsx" })}
        />
      );
      expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
    });

    test("shows 'Renaming' with old and new filenames", () => {
      render(
        <ToolInvocationBadge
          tool={makeToolInvocation("file_manager", {
            command: "rename",
            path: "/Foo.tsx",
            new_path: "/Bar.tsx",
          })}
        />
      );
      expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
    });
  });

  describe("loading vs done state", () => {
    test("shows spinner when not done", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "create", path: "/App.tsx" }, "call")}
        />
      );
      expect(container.querySelector(".animate-spin")).not.toBeNull();
    });

    test("shows green dot when done", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={makeToolInvocation("str_replace_editor", { command: "create", path: "/App.tsx" }, "result")}
        />
      );
      expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
      expect(container.querySelector(".animate-spin")).toBeNull();
    });
  });
});
