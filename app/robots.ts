import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Le aree private (portale player e staff) non vanno indicizzate.
        disallow: ["/portale", "/staff", "/api"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
