# Port Game-app-with-software-community → Lovable Cloud

Aapka uploaded Next.js + Drizzle project bahut bada hai (24+ tables, 18 API routes, 15 admin pages, community + stories + polls + reviews + reports + notifications). Main ise TanStack Start + Lovable Cloud (Supabase) pe port karunga. Lucide icons only, no emojis.

## 1. Database migration (Supabase, ek migration me sab)

Convert Drizzle schema → Postgres tables with RLS + GRANTs. Existing `posts/categories/menu_items/settings` ko extend karunga, baaki naye:

**Extend** `posts`: add `content_type, product_subtitle, banner_image, file_size, download_url, discord_url, version, platform, ram_required, published_text, genres_text, is_featured, is_latest, download_count, recommend_percent, likes, dislikes, system_requirements jsonb, download_links jsonb, installation_guide, important_notes, raw_html`

**New tables**:

- `game_screenshots` (post_id, image_url, caption, sort_order)
- `game_categories` (post_id, category_id) — many-to-many
- `site_pages` (slug, title, content, template, is_published)
- `reviews` (post_id, user_id, rating, comment)
- `community_posts` (author_id, type discussion|issue|showcase, title, slug, content, images jsonb, cover_image, game_id, feeling, location, status, visibility, likes, comments_count, shares, views, reactions jsonb, is_pinned)
- `post_comments` (community_post_id, author_id, content, likes)
- `community_profiles` (user_id, avatar, cover, display_name, username unique, bio, followers, following)
- `stories` (author_id, image_url, video_url, text, expires_at, views)
- `post_reactions` (community_post_id, user_id, type) unique(post,user)
- `follows` (follower_id, following_id) unique
- `mentions`, `activities`, `checkins`
- `polls` + `poll_options` + `poll_votes`
- `showcase_posts`, `issues`
- `game_requests` (title, description, votes, status)
- `reports` (community_post_id, reporter_id, reason, status)
- `notifications` (user_id, type, target_id, is_read)
- `assets` (user_id, file_name, file_url, file_type, file_size, folder, alt_text)

**Storage bucket**: `media` (public read) for uploads.

**RLS pattern**: public SELECT for published posts/pages/menus/categories/profiles/stories/community feed; authenticated users INSERT/UPDATE/DELETE for own rows (author_id = auth.uid()); admin via `has_role(auth.uid(),'admin')` for everything in admin panel; reactions/votes/follows scoped to user_id = auth.uid().

## 2. Server functions (`src/lib/*.functions.ts`)

- `games.functions` — list/filter/detail/random/related/increment downloads
- `community.functions` — feed, create post (discussion/issue/showcase/poll), react, comment, share, story crud, follow/unfollow
- `reviews.functions` — list/create/admin moderate
- `profile.functions` — get/update profile, follower lists, user posts
- `requests.functions` — game requests + vote
- `notifications.functions` — list/mark read
- `search.functions` — global search posts+games+users
- `upload.functions` — signed upload to `media` bucket
- `admin.functions` — CRUD for games/categories/pages/menus/users/settings/reviews/comments/reports/assets/importer/community moderation

## 3. Public pages

`/games` `/software` `/apps` `/console-games` (existing, extended fields), `/games/$slug` (gallery + screenshots + multi-mirror downloads + reviews + related + community discussions), `/community` (feed), `/community/$slug` (post detail), `/profile/$username`, `/blog` (= site_pages), `/page/$slug`, `/request-game`, `/search`, `/category/$slug`, `/top-games`.

## 4. Admin panel (`/admin/*`)

Mirror uploaded structure: `posts`, `games`, `categories`, `menus`, `pages`, `settings`, `users`, `reviews`, `comments`, `community` (moderate feed/reports), `assets` (media library), `files` (uploads), `importer` (sitemap, already exists, extend). All admin-gated via `has_role('admin')`.

## 5. UI components

- `HeroCarousel`, `GameCard`, `ArchivePage`, `CommentSection`, `ReviewSection`, `GameActions` (like/dislike/download), `Footer`, mobile-first navbar (existing extended)
- Community: `PostComposer` (text+image+poll+feeling+checkin), `FeedCard`, `StoryTray`, `StoryViewer`, `ReactionBar`, `FollowButton`
- All icons via lucide-react (Heart, MessageCircle, Share2, Bookmark, ThumbsUp, Eye, Download, Play, ImageIcon, Smile, MapPin, BarChart3, etc.)
- Framer-motion animations, dark neon theme (existing), glassmorphism cards

## 6. Auth & roles

Already in place (email/password + Google). User profile auto-created in `community_profiles` on first community action (or via signup trigger). First signup = admin (already).

## Execution order

1. **Migration** — all schema + storage bucket + RLS + GRANTs (single approval)
2. **Server fns** — games extended, community, reviews, profile, requests, notifications, upload, admin
3. **Public UI** — game detail upgrade, community feed, profile, blog, search, request-game
4. **Admin UI** — all 12 admin pages
5. **Polish** — stories, polls, reactions, follow

Scope: ~50-60 new files, 1 big migration. I'll build slice by slice. Confirm and I'll start with the migration.

Like reaction achhe kam krna chiye users ke liye login system dena and imgstore ke liye  free img host use krna lovable nhi vha pe bas text link store kro ye rha api docs Request URL

[https://freeimage.host/api/1/uploa](https://freeimage.host/api/1/uploa)d Freeimage.host's API v1 allows to upload pictures.

&nbsp;

API Key

6d207e02198a847aa98d0a2a901485a5

&nbsp;

API call cominity Facebook jaisa hona chaiye store lgna view krna slide krna ur post me poll ya img upload bhi kr ske links bhi dal ske kisi ka user profile bhi khol ke dekh ske and use massage ya uske post bhi dekh ske  sabkuchh achhe colourful colour preset and glow shadows use krke bnana and glass coloured ui 