import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.docfork.com";
  const pages = source.getPages();

  const sitemapEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.url === "/" ? 1.0 : 0.8,
  }));

  // add root url if not already included
  if (!pages.some((page) => page.url === "/")) {
    sitemapEntries.unshift({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });
  }

  return sitemapEntries;
}
