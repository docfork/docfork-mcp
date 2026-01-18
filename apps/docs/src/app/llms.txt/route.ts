import { source } from "@/lib/source";

export const revalidate = false;

export async function GET(request: Request) {
  const pages = source.getPages();

  // get full base url from request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const docLinks = pages
    .map((page) => {
      const fullUrl = `${baseUrl}${page.url}.md`;
      const title = page.data.title;
      const description = page.data.description;

      if (description) {
        return `- [${title}](${fullUrl}): ${description}`;
      }
      return `- [${title}](${fullUrl})`;
    })
    .join("\n");

  const content = `# Docfork Docs

## Docs

${docLinks}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
