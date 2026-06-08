-- ============================================
-- SUPABASE DATABASE SCHEMA
-- For: Creative Conor - Game & Software Site
-- ============================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES & ROLES
-- ============================================

create table if not exists public.community_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  username text unique not null,
  display_name text,
  avatar text,
  bio text,
  joined_at timestamp with time zone default now()
);

create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'user',
  primary key (user_id, role)
);

-- ============================================
-- DOWNLOADS / POSTS (Games, Software, Apps, Console)
-- ============================================

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  product_subtitle text,
  description text,
  kind text not null default 'games',
  cover_url text,
  banner_image text,
  backdrop_url text,
  download_url text,
  download_links jsonb default '[]',
  version text,
  file_size text,
  size text,
  year int,
  developer text,
  publisher text,
  platform text,
  ram_required text,
  genres text[] default '{}',
  genres_text text,
  system_requirements jsonb default '{}',
  installation_guide text,
  rating numeric default 0,
  reviews int default 0,
  likes int default 0,
  dislikes int default 0,
  recommend_percent int,
  reactions jsonb default '{}',
  status text default 'published',
  source_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_kind on public.posts(kind);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_created on public.posts(created_at desc);

-- ============================================
-- MENU ITEMS
-- ============================================

create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  href text not null,
  icon text not null default 'Circle',
  color text not null default '#7c3aed',
  sort_order int not null default 0,
  enabled boolean default true,
  created_at timestamp with time zone default now()
);

create index if not exists idx_menu_sort on public.menu_items(sort_order);

-- ============================================
-- SITE PAGES / BLOG
-- ============================================

create table if not exists public.site_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  content text,
  template text default 'default',
  is_published boolean default true,
  cover_image text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- CATEGORIES
-- ============================================

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  kind text not null default 'games',
  color text default '#7c3aed',
  icon text default 'Tag',
  sort_order int default 0
);

-- ============================================
-- SETTINGS
-- ============================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- ============================================
-- COMMUNITY
-- ============================================

create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  type text not null default 'discussion',
  status text default 'active',
  visibility text default 'public',
  is_pinned boolean default false,
  title text,
  content text not null,
  images text[] default '{}',
  links text[] default '{}',
  feeling text,
  location text,
  reactions jsonb default '{}',
  likes int default 0,
  author_id uuid references auth.users(id) on delete cascade,
  game_id uuid references public.posts(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_community_status on public.community_posts(status, created_at desc);

create table if not exists public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  community_post_id uuid references public.community_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  content text not null,
  parent_id uuid references public.post_comments(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.post_reactions (
  community_post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  primary key (community_post_id, user_id)
);

create table if not exists public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references auth.users(id) on delete cascade,
  image_url text,
  video_url text,
  text text,
  background text,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- POLLS
-- ============================================

create table if not exists public.polls (
  id uuid primary key default uuid_generate_v4(),
  community_post_id uuid references public.community_posts(id) on delete cascade unique,
  question text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid references public.polls(id) on delete cascade,
  option_text text not null,
  sort_order int not null default 0,
  votes int default 0
);

create table if not exists public.poll_votes (
  id uuid primary key default uuid_generate_v4(),
  poll_option_id uuid references public.poll_options(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(poll_option_id, user_id)
);

-- ============================================
-- REVIEWS
-- ============================================

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'approved',
  created_at timestamp with time zone default now()
);

create index if not exists idx_reviews_post on public.reviews(post_id);
create index if not exists idx_reviews_status on public.reviews(status);

-- ============================================
-- GAME SCREENSHOTS
-- ============================================

create table if not exists public.game_screenshots (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- GAME REQUESTS
-- ============================================

create table if not exists public.game_requests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  requested_by uuid references auth.users(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- ============================================
-- REPORTS
-- ============================================

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null,
  target_id uuid not null,
  reason text,
  reported_by uuid references auth.users(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- ============================================
-- ASSETS
-- ============================================

create table if not exists public.assets (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  url text not null,
  size bigint,
  mime_type text,
  uploaded_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

alter table public.community_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.posts enable row level security;
alter table public.menu_items enable row level security;
alter table public.site_pages enable row level security;
alter table public.categories enable row level security;
alter table public.settings enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.follows enable row level security;
alter table public.stories enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.reviews enable row level security;
alter table public.game_screenshots enable row level security;
alter table public.game_requests enable row level security;
alter table public.reports enable row level security;
alter table public.assets enable row level security;

-- Posts: public can read published, authenticated can read all, admin can write
create policy "Public read published posts" on public.posts for select using (status = 'published');
create policy "Authenticated read all posts" on public.posts for select using (auth.role() = 'authenticated');
create policy "Admin insert posts" on public.posts for insert with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
create policy "Admin update posts" on public.posts for update using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
create policy "Admin delete posts" on public.posts for delete using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Menu items: public read enabled, admin full access
create policy "Public read enabled menus" on public.menu_items for select using (enabled = true);
create policy "Admin menu full access" on public.menu_items for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Settings: public read, admin write
create policy "Public read settings" on public.settings for select using (true);
create policy "Admin write settings" on public.settings for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Site pages: public read published, admin full access
create policy "Public read published pages" on public.site_pages for select using (is_published = true);
create policy "Admin pages full access" on public.site_pages for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Categories: public read, admin write
create policy "Public read categories" on public.categories for select using (true);
create policy "Admin write categories" on public.categories for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Community posts: public read active+public, auth read all, admin manage, auth create
create policy "Public read community" on public.community_posts for select using (status = 'active' and visibility = 'public');
create policy "Auth read all community" on public.community_posts for select using (auth.role() = 'authenticated');
create policy "Auth create community" on public.community_posts for insert with check (auth.uid() = author_id);
create policy "Auth update own" on public.community_posts for update using (auth.uid() = author_id);
create policy "Admin manage community" on public.community_posts for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Comments: public read, auth create/delete own, admin manage
create policy "Public read comments" on public.post_comments for select using (true);
create policy "Auth create comment" on public.post_comments for insert with check (auth.uid() = author_id);
create policy "Auth delete own comment" on public.post_comments for delete using (auth.uid() = author_id);
create policy "Admin manage comments" on public.post_comments for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Reactions: auth manage own, admin manage all
create policy "Auth react" on public.post_reactions for all using (auth.uid() = user_id);
create policy "Admin react all" on public.post_reactions for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Follows: auth manage own
create policy "Auth follow" on public.follows for all using (auth.uid() = follower_id);

-- Stories: public read active, auth create/delete own, admin manage
create policy "Public read stories" on public.stories for select using (expires_at > now());
create policy "Auth create story" on public.stories for insert with check (auth.uid() = author_id);
create policy "Auth delete own story" on public.stories for delete using (auth.uid() = author_id);
create policy "Admin manage stories" on public.stories for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Polls: public read, auth vote, admin manage
create policy "Public read polls" on public.polls for select using (true);
create policy "Public read poll_opts" on public.poll_options for select using (true);
create policy "Auth vote" on public.poll_votes for insert with check (auth.uid() = user_id);
create policy "Auth delete vote" on public.poll_votes for delete using (auth.uid() = user_id);
create policy "Admin manage polls" on public.polls for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
create policy "Admin manage options" on public.poll_options for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Reviews: public read approved, auth create, admin manage
create policy "Public read approved reviews" on public.reviews for select using (status = 'approved');
create policy "Auth read own" on public.reviews for select using (auth.uid() = user_id);
create policy "Auth create review" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Admin manage reviews" on public.reviews for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Screenshots: public read, admin manage
create policy "Public read screenshots" on public.game_screenshots for select using (true);
create policy "Admin manage screenshots" on public.game_screenshots for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Requests: public create, admin manage
create policy "Public create requests" on public.game_requests for insert with check (true);
create policy "Public read requests" on public.game_requests for select using (true);
create policy "Admin manage requests" on public.game_requests for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Reports: auth create, admin manage
create policy "Auth create report" on public.reports for insert with check (auth.uid() = reported_by);
create policy "Admin manage reports" on public.reports for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Assets: admin full access
create policy "Admin manage assets" on public.assets for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Profile: public read, auth update own, admin manage
create policy "Public read profiles" on public.community_profiles for select using (true);
create policy "Auth update own profile" on public.community_profiles for update using (auth.uid() = user_id);
create policy "Auth insert own profile" on public.community_profiles for insert with check (auth.uid() = user_id);
create policy "Admin manage profiles" on public.community_profiles for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- User roles: admin only
create policy "Admin manage roles" on public.user_roles for all using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
create policy "Self read roles" on public.user_roles for select using (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

create or replace function public.bump_community_counter(_post uuid, _col text, _delta int)
returns void as $$
begin
  execute format('update public.community_posts set %I = coalesce(%I, 0) + $1 where id = $2', _col, _col)
  using _delta, _post;
end;
$$ language plpgsql security definer;

grant execute on function public.bump_community_counter to authenticated;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Seed default settings if not present
insert into public.settings (key, value) values
  ('site', '{"title":"Creative Conor","tagline":"Download Games, Software & Apps","logoUrl":"","faviconUrl":""}'),
  ('seo', '{"metaDescription":"","keywords":"","googleAnalyticsId":""}'),
  ('social', '{"twitter":"","facebook":"","youtube":"","discord":"","instagram":""}'),
  ('general', '{"siteUrl":"https://creativeconor.com","adminEmail":"","language":"en","timezone":"UTC"}'),
  ('codes', '{"headerCode":"","footerCode":""}'),
  ('ads', '{"headerAd":"","sidebarAd":"","inContentAd":""}')
on conflict (key) do nothing;

-- Seed default menu if not present
insert into public.menu_items (label, href, icon, color, sort_order, enabled) values
  ('Games', '/games', 'Gamepad2', '#22d3ee', 1, true),
  ('Top', '/games?sort=rating', 'ArrowUp', '#f59e0b', 2, true),
  ('Trending', '/games?sort=popular', 'TrendingUp', '#ec4899', 3, true),
  ('Software', '/software', 'LayoutGrid', '#8b5cf6', 4, true),
  ('Apps', '/apps', 'Smartphone', '#3b82f6', 5, true),
  ('Console Games', '/console-games', 'Lock', '#10b981', 6, true),
  ('Donate', '/donate', 'Heart', '#ec4899', 7, true),
  ('Request', '/request-game', 'MessageSquare', '#06b6d4', 8, true)
on conflict do nothing;
