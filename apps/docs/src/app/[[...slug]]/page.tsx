import { getPageImage, source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/notebook/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { Pencil, AlertTriangle } from "lucide-react";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { cn } from "@/lib/cn";
import { docsGitConfig } from "@/lib/layout.shared";

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} tableOfContentPopover={{ enabled: false }}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pt-4">
        <div>
          <DocsTitle className="font-medium">
            {page.data.title}
          </DocsTitle>
          <DocsDescription className="mt-2 lg:mb-4 mb-0">{page.data.description}</DocsDescription>
        </div>
        <div
          id="page-context-menu"
          className="items-center shrink-0 min-w-[156px] lg:justify-end ml-auto flex lg:mt-2"
        >
          <LLMCopyButton markdownUrl={`${page.url}.md`} />
          <ViewOptions
            markdownUrl={`${page.url}.md`}
            // update it to match your repo
            githubUrl={`https://github.com/${docsGitConfig.user}/${docsGitConfig.repo}/blob/${docsGitConfig.branch}/content/${page.path}`}
          />
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <footer className="my-10">
        <div className="flex items-center gap-3">
          <a
            href={`https://github.com/${docsGitConfig.user}/${docsGitConfig.repo}/edit/${docsGitConfig.branch}/content/${page.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({
                color: "outline",
                className: "gap-2",
              })
            )}
          >
            <Pencil className="size-4" />
            Suggest edits
          </a>
          <a
            href={`https://github.com/${docsGitConfig.user}/${docsGitConfig.repo
              }/issues/new?title=Issue%20on%20docs&body=Path:%20${encodeURIComponent(page.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({
                color: "outline",
                className: "gap-2",
              })
            )}
          >
            <AlertTriangle className="size-4" />
            Raise issue
          </a>
        </div>
      </footer>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
