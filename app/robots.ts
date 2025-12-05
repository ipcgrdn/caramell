import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://caramell.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/project/", "/signin", "/signup", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
