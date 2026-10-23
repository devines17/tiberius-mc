import type { MetadataRoute } from "next";
import { pages, siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/entra", ...pages.map((p) => p.href)].map((p) => ({ url: `${siteConfig.url}${p === "/" ? "" : p}` }));
}
