import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";

import { baseOptions, mcpGitConfig } from "@/lib/layout.shared";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { NavButtons } from "@/components/nav-buttons";

export default function Layout({ children }: LayoutProps<"/[[...slug]]">) {
  const { nav, ...base } = baseOptions();

  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: "top" }}
      tabMode="navbar"
      sidebar={{ collapsible: false }}
      tree={source.getPageTree()}
      links={[
        {
          type: "custom",
          children: (
            <GithubInfo
              owner={mcpGitConfig.user}
              repo={mcpGitConfig.repo}
              className="lg:-mx-2 max-w-sm"
              token={process.env.GITHUB_TOKEN}
            />
          ),
        },
        {
          type: "custom",
          children: <NavButtons />,
          secondary: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
