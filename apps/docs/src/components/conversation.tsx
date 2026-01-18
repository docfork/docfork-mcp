import { cn } from "@/lib/cn";

interface ConversationProps {
  children: React.ReactNode;
  className?: string;
}

export function Conversation({ children, className }: ConversationProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

interface MessageProps {
  role: "user" | "agent";
  children: React.ReactNode;
}

export function Message({ role, children }: MessageProps) {
  return (
    <div className="rounded-lg border bg-fd-card px-4 py-4">
      <div className="mb-2 text-sm font-semibold text-muted-foreground">
        {role === "user" ? "User" : "Agent"}
      </div>
      <div className="text-sm space-y-2 [&>pre]:my-0 [&>pre]:bg-transparent [&>code]:bg-transparent [&>code]:my-0 [&>p>code]:bg-transparent [&>p>code]:my-0 [&>p]:my-0 [&>p:has(code)]:my-0">
        {children}
      </div>
    </div>
  );
}

interface ActionProps {
  children: React.ReactNode;
}

export function Action({ children }: ActionProps) {
  return (
    <code className="block font-mono text-xs bg-transparent px-3 pb-6 border-0 my-0 [&>p]:my-0">
      {children}
    </code>
  );
}
