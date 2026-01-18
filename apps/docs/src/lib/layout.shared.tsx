import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Logo } from "@/components/logo";

export const mcpGitConfig = {
  user: "docfork",
  repo: "docfork-mcp",
  branch: "main",
} as const;

export const docsGitConfig = {
  user: "docfork",
  repo: "docs",
  branch: "main",
} as const;

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: "https://docfork.com",
      transparentMode: "top",
    },
  };
}
