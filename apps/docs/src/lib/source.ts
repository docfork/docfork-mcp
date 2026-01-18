import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.webp"];

  return {
    segments,
    url: `/og/${segments.join("/")}`,
  };
}

export async function getLLMText(
  page: InferPageType<typeof source>,
  baseUrl?: string
) {
  const processed = await page.data.getText("processed");

  // remove import statements from markdown (handles various formats)
  const cleaned = processed
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "")
    .replace(/^import\s+['"].*?['"];?\s*$/gm, "")
    .replace(/^import\s+type\s+.*?from\s+['"].*?['"];?\s*$/gm, "")
    .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"].*?['"];?\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const url = baseUrl ? `${baseUrl}${page.url}` : page.url;

  return `# ${page.data.title} (${url})

${cleaned}`;
}
