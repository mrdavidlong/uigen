import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  tool: ToolInvocation;
}

function getLabel(tool: ToolInvocation): string {
  const args = tool.args as Record<string, string> | undefined;
  const path = args?.path ?? "";
  const filename = path.split("/").pop() ?? path;

  if (tool.toolName === "str_replace_editor") {
    const command = args?.command;
    if (command === "create") return `Creating ${filename}`;
    if (command === "str_replace" || command === "insert") return `Editing ${filename}`;
    if (command === "view") return `Reading ${filename}`;
    return `Editing ${filename}`;
  }

  if (tool.toolName === "file_manager") {
    const command = args?.command;
    if (command === "delete") return `Deleting ${filename}`;
    if (command === "rename") {
      const newFilename = (args?.new_path ?? "").split("/").pop();
      return `Renaming ${filename} to ${newFilename}`;
    }
  }

  return tool.toolName;
}

export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const done = tool.state === "result";
  const label = getLabel(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
