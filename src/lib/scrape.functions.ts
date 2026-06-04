import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function slugFromUrl(u: string): string {
  try {
    const p = new URL(u).pathname;
    const parts = p.split("/").filter(Boolean);
    return parts[parts.length - 1] || parts[parts.length - 2] || "post";
  } catch {
    return "post";
  }
}

function kindFromUrl(u: string): "games" | "software" | "apps" | "console" {
  const p = u.toLowerCase();
  if (p.includes("/software")) return "software";
  if (p.includes("/apps")) return "apps";
  if (p.includes("/console")) return "console";
  return "games";
}

async function firecrawlScrape(url: string, format: "html" | "markdown" = "html") {
  const key = process.env.FIRECRAWL_API_KEY;
  const lov = process.env.LOVABLE_API_KEY;
  if (!key || !lov) throw new Error("Firecrawl not connected. Connect Firecrawl in Connectors.");
  const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lov}`,
      "X-Connection-Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: [format], onlyMainContent: false }),
  });
  if (!res.ok) throw new Error(`Firecrawl scrape ${res.status}: ${await res.text()}`);
  const json: any = await res.json();
  return json?.data ?? json;
}

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function parseProductHtml(html: string, sourceUrl: string) {
  const title = pick(html, /<div class="product-info">[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/) ||
    pick(html, /<h1[^>]*>([^<]+)<\/h1>/) || "";
  const subtitle = pick(html, /class="product-subtitle"[^>]*>([^<]+)</);
  const cover = pick(html, /<div class="product-cover">\s*<img[^>]+src="([^"]+)"/);
  const backdrop = pick(html, /<div class="product-backdrop">[\s\S]*?<img[^>]+src="([^"]+)"/);
  const description = pick(html, /class="product-description"[^>]*>([\s\S]*?)<\/div>/)?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null;
  const size = pick(html, /(\d+(?:\.\d+)?\s*GB[^<]*)/i);
  const yearStr = pick(html, /\b(19|20)\d{2}\b/);
  const developer = pick(html, /Developer[^<]*<[^>]+>([^<]+)</i);
  const stars = (html.match(/star-icon filled/g) || []).length;
  const reviewsStr = pick(html, /(\d+)\s*review/i);
  const genres = Array.from(html.matchAll(/class="genre[^"]*"[^>]*>([^<]+)</g)).map((m) => m[1].trim()).slice(0, 10);
  return {
    slug: slugFromUrl(sourceUrl),
    title: title || slugFromUrl(sourceUrl),
    subtitle: subtitle ?? null,
    kind: kindFromUrl(sourceUrl),
    cover_url: cover ?? null,
    backdrop_url: backdrop ?? null,
    description,
    size: size ?? null,
    year: yearStr ? parseInt(yearStr, 10) : null,
    developer: developer ?? null,
    publisher: null,
    genres,
    requirements: {},
    rating: stars > 0 ? Math.min(5, stars) : 0,
    reviews: reviewsStr ? parseInt(reviewsStr, 10) : 0,
    source_url: sourceUrl,
    download_url: null,
    status: "published" as const,
  };
}

export const scrapeSitemap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sitemapUrl: string }) =>
    z.object({ sitemapUrl: z.string().url() }).parse(d),
  )
  .handler(async ({ data }) => {
    const res = await fetch(data.sitemapUrl);
    if (!res.ok) throw new Error(`Sitemap fetch ${res.status}`);
    const xml = await res.text();
    const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
    return { urls };
  });

export const scrapeOnePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) => z.object({ url: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const scraped = await firecrawlScrape(data.url, "html");
    const html = scraped?.html || scraped?.rawHtml || "";
    const post = parseProductHtml(html, data.url);
    const { error } = await context.supabase.from("posts").upsert(post, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true, slug: post.slug, title: post.title };
  });
