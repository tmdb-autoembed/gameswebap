import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRODUCT_RE = /\/(games|software|apps|console-games|console)\/[^/?#]+\/?$/i;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190) || "post";
}

function htmlDecode(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function strip(html = "") {
  return htmlDecode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/li>|<\/h\d>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n"),
  );
}

function absoluteUrl(url: string | null, base: string) {
  if (!url) return null;
  try { return new URL(htmlDecode(url), base).toString(); } catch { return null; }
}

function pick(html: string, patterns: RegExp[]) {
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return htmlDecode(strip(match[1]));
  }
  return null;
}

function pickAttr(html: string, patterns: RegExp[], base: string) {
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return absoluteUrl(match[1], base);
  }
  return null;
}

function sectionText(html: string, heading: string) {
  const re = new RegExp(`<h[1-4][^>]*>\\s*(?:[^<]*?${heading}[^<]*?)<\\/h[1-4]>([\\s\\S]*?)(?=<h[1-4][^>]*>|<footer|$)`, "i");
  const match = html.match(re);
  return match?.[1] ? strip(match[1]) : null;
}

function slugFromUrl(url: string) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return slugify(parts.at(-1) || parts.at(-2) || "post");
  } catch {
    return "post";
  }
}

function kindFromUrl(url: string): "games" | "software" | "apps" | "console" {
  const path = url.toLowerCase();
  if (path.includes("/software/")) return "software";
  if (path.includes("/apps/")) return "apps";
  if (path.includes("/console")) return "console";
  return "games";
}

async function directFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 CreativeConorImporter/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`Fetch ${res.status}`);
  return res.text();
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

async function loadHtml(url: string) {
  try {
    return await directFetch(url);
  } catch (directError) {
    const scraped = await firecrawlScrape(url, "html");
    const html = scraped?.html || scraped?.rawHtml || "";
    if (!html) throw directError;
    return html;
  }
}

export function parseProductHtml(html: string, sourceUrl: string) {
  const title = pick(html, [
    /<h1[^>]*class="[^"]*(?:product-title|game-title|entry-title)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h2[^>]*class="[^"]*(?:product-title|game-title|entry-title)[^"]*"[^>]*>([\s\S]*?)<\/h2>/i,
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
  ])?.replace(/\s*[—|-]\s*CreativeConor.*$/i, "");

  const productSubtitle = pick(html, [
    /class="[^"]*(?:product-subtitle|subtitle|game-subtitle)[^"]*"[^>]*>([\s\S]*?)<\//i,
    /<p[^>]*class="[^"]*(?:lead|excerpt)[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
  ]);

  const cover = pickAttr(html, [
    /class="[^"]*(?:product-cover|game-cover|poster)[^"]*"[\s\S]*?<img[^>]+src="([^"]+)"/i,
    /<img[^>]+class="[^"]*(?:product-cover|game-cover|poster|cover-image)[^"]*"[^>]+src="([^"]+)"/i,
    /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
  ], sourceUrl);

  const banner = pickAttr(html, [
    /class="[^"]*(?:product-backdrop|backdrop|banner|hero)[^"]*"[\s\S]*?<img[^>]+src="([^"]+)"/i,
    /<img[^>]+class="[^"]*(?:banner|backdrop|hero-image)[^"]*"[^>]+src="([^"]+)"/i,
  ], sourceUrl) ?? cover;

  const description = sectionText(html, "Description") || pick(html, [
    /class="[^"]*(?:product-description|description|entry-content|post-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
  ]);

  const fullText = strip(html);
  const version = pick(html, [/Version:\s*<[^>]+>\s*([^<\n]+)/i, /\b(v\d+(?:\.\d+){0,3})\b/i]);
  const ram = pick(html, [/(\d+\s*GB\s*RAM)/i]);
  const size = pick(html, [/(\d+(?:\.\d+)?\s*(?:GB|MB|TB))\b/i]);
  const yearStr = fullText.match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? null;
  const reviewsStr = fullText.match(/(\d+)\s*reviews?/i)?.[1] ?? null;
  const recommendStr = fullText.match(/(\d+)%\s*recommend/i)?.[1] ?? null;
  const ratingStr = fullText.match(/([0-5](?:\.\d)?)\s*\/\s*5/i)?.[1] ?? null;
  const platform = fullText.match(/\b(PC|Windows|Android|iOS|PlayStation|Xbox|Nintendo)\b/i)?.[1] ?? null;

  const genres = Array.from(html.matchAll(/<a[^>]+href="[^"]*\/(?:genre|genres|category|games)\/[^\"]+"[^>]*>([\s\S]*?)<\/a>/gi))
    .map((m) => strip(m[1]))
    .filter((g) => g && !/download|home|games|software|apps/i.test(g))
    .slice(0, 12);

  const downloadLinks = Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?(?:Download|Fast|Direct)[\s\S]*?)<\/a>/gi))
    .map((m) => ({ name: strip(m[2]).replace(/\s+/g, " ").slice(0, 60) || "Download", url: absoluteUrl(m[1], sourceUrl) }))
    .filter((m): m is { name: string; url: string } => !!m.url && !m.url.includes("creativeconor.com"));

  const installationGuide = sectionText(html, "Installation Guide");
  const importantNotes = sectionText(html, "Important Notes");
  const systemRequirements = sectionText(html, "System Requirements");

  return {
    slug: slugFromUrl(sourceUrl),
    title: title || slugFromUrl(sourceUrl),
    subtitle: productSubtitle,
    product_subtitle: productSubtitle,
    kind: kindFromUrl(sourceUrl),
    cover_url: cover,
    backdrop_url: banner,
    banner_image: banner,
    description,
    size,
    file_size: size,
    year: yearStr ? parseInt(yearStr, 10) : null,
    developer: pick(html, [/Developer\s*<[^>]*>\s*([^<]+)/i, /\b(?:by|developer)\s+([A-Z][A-Za-z0-9 .&-]{2,60})/i]),
    publisher: pick(html, [/Publisher\s*<[^>]*>\s*([^<]+)/i]),
    genres: Array.from(new Set(genres)),
    genres_text: Array.from(new Set(genres)).join(", ") || null,
    requirements: systemRequirements ? { raw: systemRequirements } : {},
    system_requirements: systemRequirements ? { minimum: { details: systemRequirements } } : null,
    installation_guide: installationGuide,
    important_notes: importantNotes,
    rating: ratingStr ? parseFloat(ratingStr) : 0,
    reviews: reviewsStr ? parseInt(reviewsStr, 10) : 0,
    recommend_percent: recommendStr ? parseInt(recommendStr, 10) : null,
    source_url: sourceUrl,
    download_url: downloadLinks[0]?.url ?? null,
    download_links: downloadLinks,
    version,
    ram_required: ram,
    platform,
    raw_html: html.slice(0, 100000),
    status: "published" as const,
  };
}

async function readSitemap(url: string, seen = new Set<string>()): Promise<string[]> {
  if (seen.has(url)) return [];
  seen.add(url);
  const xml = await directFetch(url);
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => htmlDecode(m[1]));
  if (/<sitemapindex/i.test(xml)) {
    const nested = await Promise.all(locs.map((loc) => readSitemap(loc, seen).catch(() => [])));
    return nested.flat();
  }
  return locs;
}

export const scrapeSitemap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sitemapUrl: string }) => z.object({ sitemapUrl: z.string().url() }).parse(d))
  .handler(async ({ data }) => {
    const urls = (await readSitemap(data.sitemapUrl)).filter((u) => PRODUCT_RE.test(u));
    return { urls: Array.from(new Set(urls)) };
  });

export const scrapeOnePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string; force?: boolean }) => z.object({ url: z.string().url(), force: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const slug = slugFromUrl(data.url);
    if (!data.force) {
      const { data: existing } = await context.supabase.from("posts").select("id,title,slug").eq("slug", slug).maybeSingle();
      if (existing) return { ok: true, skipped: true, slug, title: existing.title };
    }
    const html = await loadHtml(data.url);
    const post = parseProductHtml(html, data.url);
    const { error } = await context.supabase.from("posts").upsert(post, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true, skipped: false, slug: post.slug, title: post.title };
  });

export const importSitemapPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sitemapUrl: string; limit?: number; force?: boolean; kinds?: string[] }) =>
    z.object({
      sitemapUrl: z.string().url(),
      limit: z.number().int().min(1).max(500).optional(),
      force: z.boolean().optional(),
      kinds: z.array(z.enum(["games", "software", "apps", "console"])).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const kinds = data.kinds?.length ? data.kinds : ["games", "software", "apps", "console"];
    const allUrls = (await readSitemap(data.sitemapUrl)).filter((url) => PRODUCT_RE.test(url) && kinds.includes(kindFromUrl(url)));
    const uniqueUrls = Array.from(new Set(allUrls)).slice(0, data.limit ?? 100);
    const slugs = uniqueUrls.map(slugFromUrl);
    const { data: existingRows } = slugs.length
      ? await context.supabase.from("posts").select("slug").in("slug", slugs)
      : { data: [] as any[] };
    const existing = new Set((existingRows ?? []).map((row: any) => row.slug));
    const results: Array<{ url: string; title?: string; slug: string; status: "imported" | "skipped" | "failed"; error?: string }> = [];

    for (const url of uniqueUrls) {
      const slug = slugFromUrl(url);
      if (!data.force && existing.has(slug)) {
        results.push({ url, slug, status: "skipped" });
        continue;
      }
      try {
        const html = await loadHtml(url);
        const post = parseProductHtml(html, url);
        const { error } = await context.supabase.from("posts").upsert(post, { onConflict: "slug" });
        if (error) throw new Error(error.message);
        results.push({ url, slug: post.slug, title: post.title, status: "imported" });
      } catch (error: any) {
        results.push({ url, slug, status: "failed", error: error.message });
      }
    }

    return {
      total: uniqueUrls.length,
      imported: results.filter((r) => r.status === "imported").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    };
  });
