
-- ============ EXTEND posts ============
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'games',
  ADD COLUMN IF NOT EXISTS product_subtitle text,
  ADD COLUMN IF NOT EXISTS banner_image text,
  ADD COLUMN IF NOT EXISTS file_size text,
  ADD COLUMN IF NOT EXISTS discord_url text,
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS platform text DEFAULT 'PC',
  ADD COLUMN IF NOT EXISTS ram_required text,
  ADD COLUMN IF NOT EXISTS published_text text,
  ADD COLUMN IF NOT EXISTS genres_text text,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommend_percent integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dislikes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS system_requirements jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS download_links jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS installation_guide text,
  ADD COLUMN IF NOT EXISTS important_notes text,
  ADD COLUMN IF NOT EXISTS raw_html text;

-- ============ Extend categories with color & icon ============
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS icon text DEFAULT 'Tag';

-- ============ helper trigger fn (already exists touch_updated_at) ============

-- ============ game_screenshots ============
CREATE TABLE IF NOT EXISTS public.game_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_screenshots TO anon, authenticated;
GRANT ALL ON public.game_screenshots TO service_role, authenticated;
ALTER TABLE public.game_screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read screenshots" ON public.game_screenshots FOR SELECT USING (true);
CREATE POLICY "admin manage screenshots" ON public.game_screenshots FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_screenshots_post ON public.game_screenshots(post_id);

-- ============ game_categories (m2m) ============
CREATE TABLE IF NOT EXISTS public.game_categories (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
GRANT SELECT ON public.game_categories TO anon, authenticated;
GRANT ALL ON public.game_categories TO service_role, authenticated;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read game_categories" ON public.game_categories FOR SELECT USING (true);
CREATE POLICY "admin manage game_categories" ON public.game_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ site_pages ============
CREATE TABLE IF NOT EXISTS public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text,
  template text DEFAULT 'default',
  is_published boolean NOT NULL DEFAULT true,
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon, authenticated;
GRANT ALL ON public.site_pages TO service_role, authenticated;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages" ON public.site_pages FOR SELECT USING (is_published OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage pages" ON public.site_pages FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_site_pages_updated BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ reviews ============
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role, authenticated;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read approved reviews" ON public.reviews FOR SELECT USING (status='approved' OR has_role(auth.uid(),'admin') OR user_id=auth.uid());
CREATE POLICY "auth insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "owner update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "owner delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (user_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage reviews" ON public.reviews FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_reviews_post ON public.reviews(post_id);

-- ============ community_profiles ============
CREATE TABLE IF NOT EXISTS public.community_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar text,
  cover text,
  bio text,
  followers int NOT NULL DEFAULT 0,
  following int NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_profiles TO anon, authenticated;
GRANT ALL ON public.community_profiles TO service_role, authenticated;
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profiles" ON public.community_profiles FOR SELECT USING (true);
CREATE POLICY "user upsert own profile" ON public.community_profiles FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "user update own profile" ON public.community_profiles FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "admin manage profiles" ON public.community_profiles FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Auto-create community profile on signup (extend handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE existing INT;
BEGIN
  INSERT INTO public.profiles(id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.community_profiles(user_id, username, display_name, avatar)
  VALUES (NEW.id,
          lower(regexp_replace(split_part(NEW.email,'@',1)||'_'||substr(NEW.id::text,1,4),'[^a-z0-9_]','','g')),
          COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (user_id) DO NOTHING;
  SELECT COUNT(*) INTO existing FROM public.user_roles WHERE role='admin';
  IF existing = 0 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.community_profiles(user_id, username, display_name)
SELECT u.id,
       lower(regexp_replace(split_part(u.email,'@',1)||'_'||substr(u.id::text,1,4),'[^a-z0-9_]','','g')),
       COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email,'@',1))
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

-- ============ community_posts ============
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'discussion',
  title text,
  slug text UNIQUE,
  content text NOT NULL,
  excerpt text,
  feeling text,
  location text,
  images jsonb DEFAULT '[]'::jsonb,
  links jsonb DEFAULT '[]'::jsonb,
  cover_image text,
  game_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  visibility text NOT NULL DEFAULT 'public',
  likes int NOT NULL DEFAULT 0,
  comments_count int NOT NULL DEFAULT 0,
  shares int NOT NULL DEFAULT 0,
  views int NOT NULL DEFAULT 0,
  reactions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT ALL ON public.community_posts TO service_role, authenticated;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read community" ON public.community_posts FOR SELECT USING (status='active' AND visibility='public' OR author_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "auth create community post" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid());
CREATE POLICY "owner update community post" ON public.community_posts FOR UPDATE TO authenticated USING (author_id=auth.uid()) WITH CHECK (author_id=auth.uid());
CREATE POLICY "owner or admin delete community" ON public.community_posts FOR DELETE TO authenticated USING (author_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage community" ON public.community_posts FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_cp_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_cp_created ON public.community_posts(created_at DESC);
CREATE TRIGGER trg_cp_updated BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ post_comments ============
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes int NOT NULL DEFAULT 0,
  parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.post_comments TO anon, authenticated;
GRANT ALL ON public.post_comments TO service_role, authenticated;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "auth create comment" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid());
CREATE POLICY "owner update comment" ON public.post_comments FOR UPDATE TO authenticated USING (author_id=auth.uid()) WITH CHECK (author_id=auth.uid());
CREATE POLICY "owner or admin delete comment" ON public.post_comments FOR DELETE TO authenticated USING (author_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_pc_post ON public.post_comments(community_post_id);

-- ============ stories (24h) ============
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  video_url text,
  text text,
  background text,
  views int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stories TO anon, authenticated;
GRANT ALL ON public.stories TO service_role, authenticated;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active stories" ON public.stories FOR SELECT USING (expires_at > now() OR author_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "auth create story" ON public.stories FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid());
CREATE POLICY "owner delete story" ON public.stories FOR DELETE TO authenticated USING (author_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(expires_at);

-- ============ post_reactions ============
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_post_id, user_id)
);
GRANT SELECT ON public.post_reactions TO anon, authenticated;
GRANT ALL ON public.post_reactions TO service_role, authenticated;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "user manage own reaction" ON public.post_reactions FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- ============ follows ============
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
GRANT SELECT ON public.follows TO anon, authenticated;
GRANT ALL ON public.follows TO service_role, authenticated;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "user manage own follow" ON public.follows FOR ALL TO authenticated USING (follower_id=auth.uid()) WITH CHECK (follower_id=auth.uid() AND follower_id <> following_id);

-- ============ polls ============
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_post_id uuid UNIQUE NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  question text NOT NULL
);
GRANT SELECT ON public.polls TO anon, authenticated;
GRANT ALL ON public.polls TO service_role, authenticated;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "auth create poll" ON public.polls FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM community_posts cp WHERE cp.id=community_post_id AND cp.author_id=auth.uid()));
CREATE POLICY "admin manage polls" ON public.polls FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  votes int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.poll_options TO anon, authenticated;
GRANT ALL ON public.poll_options TO service_role, authenticated;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read poll opts" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "auth create poll opts" ON public.poll_options FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM polls p JOIN community_posts cp ON cp.id=p.community_post_id WHERE p.id=poll_id AND cp.author_id=auth.uid()));

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_option_id, user_id)
);
GRANT SELECT ON public.poll_votes TO anon, authenticated;
GRANT ALL ON public.poll_votes TO service_role, authenticated;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "user manage own vote" ON public.poll_votes FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- ============ game_requests ============
CREATE TABLE IF NOT EXISTS public.game_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  votes int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_requests TO anon, authenticated;
GRANT ALL ON public.game_requests TO service_role, authenticated;
ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read requests" ON public.game_requests FOR SELECT USING (true);
CREATE POLICY "auth create request" ON public.game_requests FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "owner update request" ON public.game_requests FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "admin manage requests" ON public.game_requests FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ reports ============
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role, authenticated;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth create report" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id=auth.uid());
CREATE POLICY "admin read reports" ON public.reports FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR reporter_id=auth.uid());
CREATE POLICY "admin manage reports" ON public.reports FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL,
  target_id uuid,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own notifs" ON public.notifications FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY "user update own notifs" ON public.notifications FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- ============ assets (media library; stores remote URLs from freeimage.host etc) ============
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  thumb_url text,
  file_type text,
  file_size int,
  folder text DEFAULT 'general',
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.assets TO anon, authenticated;
GRANT ALL ON public.assets TO service_role, authenticated;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "auth insert asset" ON public.assets FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "owner or admin manage asset" ON public.assets FOR ALL TO authenticated USING (user_id=auth.uid() OR has_role(auth.uid(),'admin')) WITH CHECK (user_id=auth.uid() OR has_role(auth.uid(),'admin'));

-- ============ messages (direct messages between users) ============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own messages" ON public.messages FOR SELECT TO authenticated USING (sender_id=auth.uid() OR recipient_id=auth.uid());
CREATE POLICY "user send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id=auth.uid());
CREATE POLICY "user mark own message read" ON public.messages FOR UPDATE TO authenticated USING (recipient_id=auth.uid()) WITH CHECK (recipient_id=auth.uid());
CREATE INDEX IF NOT EXISTS idx_msg_pair ON public.messages(sender_id, recipient_id, created_at DESC);

-- ============ helper: bump counters ============
CREATE OR REPLACE FUNCTION public.bump_community_counter(_post uuid, _col text, _delta int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  EXECUTE format('UPDATE public.community_posts SET %I = GREATEST(0, %I + $1) WHERE id=$2', _col, _col) USING _delta, _post;
END; $$;
