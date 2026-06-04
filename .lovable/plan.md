# Plan — CreativeConor clone v2

## 1. Lovable Cloud + DB schema
Enable Cloud. Tables:
- `profiles` (id, email, display_name)
- `user_roles` (user_id, role enum: admin/user) + `has_role()` security definer
- `categories` (id, slug, name, type: game|software|app|console)
- `posts` (id, slug unique, title, subtitle, category_id, type, cover_url, backdrop_url, description, size, year, developer, publisher, genres[], requirements jsonb, rating, reviews, source_url, status: draft|published, created_at, updated_at)
- `menu_items` (id, label, slug, icon, href, sort_order, enabled)
- `settings` (key, value jsonb) — for site title, theme defaults, community link

RLS: posts/menu/categories public SELECT for published; INSERT/UPDATE/DELETE admin only via `has_role`.

## 2. Sitemap scraper (Firecrawl connector)
- Connect Firecrawl
- Server fn `scrapeSitemap({ sitemapUrl })` → fetches XML, parses `<loc>` for /games/ /software/ /apps/
- Server fn `scrapePost({ url })` → Firecrawl scrape, parses HTML using the class structure from uploaded file (`.product-info h2`, `.product-subtitle`, `.product-cover img`, `.product-backdrop img`, stars, `.meta-item`, `.product-description`, system requirements blocks)
- Server fn `bulkImport({ sitemapUrl, limit })` → loops, inserts to `posts` (upsert by slug), category inferred from URL path
- Admin UI at `/admin/import`: input sitemap URL, progress, log

## 3. Admin panel (admin role only)
Routes under `_authenticated/admin/`:
- `/admin` dashboard
- `/admin/posts` list + edit/delete + manual add
- `/admin/posts/$id` editor (all fields)
- `/admin/menu` drag-sort menu items, icon picker, enable/disable
- `/admin/import` scraper UI
- `/admin/settings`

## 4. Public pages
- `/` (existing, now reads from DB)
- `/games`, `/software`, `/apps`, `/console-games` archives with filters: genre, year, developer, rating, sort (newest/popular/rating), search box, pagination
- `/games/$slug` (existing detail upgraded)
- `/random` → server fn picks random published post, redirects
- `/community` (links to Discord/Telegram from settings)
- `/auth` login/signup

## 5. Header upgrades
- Mobile drawer redesigned to match screenshot: colored icon tiles per menu item, language flags row
- Menu items loaded from DB (`menu_items` table)
- Action buttons: Random (dice icon → /random), Community, Dark/Light toggle, Live search box (debounced query against posts → dropdown results)
- Theme toggle persists in localStorage; light theme tokens added to styles.css

## 6. Tech notes
- Firecrawl via gateway (already documented pattern)
- All server fns use `requireSupabaseAuth` for admin actions; public read fns use `supabaseAdmin` with `status='published'` filter
- Live search: server fn `searchPosts({ q })` ilike on title, limit 8

## Order of execution
1. Enable Cloud + migrations (schema + RLS + seed admin menu)
2. Auth pages + admin gate + role bootstrap (first signup = admin)
3. Public archives + detail reading from DB + header rebuild (theme, search, random, mobile drawer)
4. Admin CRUD (posts, menu, settings)
5. Firecrawl connector + scraper UI

This is a large build (~15-20 files, several migrations). I will do it in the above order, committing working slices.