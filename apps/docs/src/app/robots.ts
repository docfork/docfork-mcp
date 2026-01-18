import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://docs.docfork.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/og/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
