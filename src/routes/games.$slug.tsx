import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPostBySlug } from "@/lib/posts.functions";
import { listReviews, addReview } from "@/lib/reviews.functions";
import { listFeed } from "@/lib/community.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { Download, Star, Users, ThumbsUp, ThumbsDown, MessageCircle, MonitorCheck, Calendar, HardDrive, Cpu, MemoryStick, Tag, Send } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/games/$slug")({
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();
  const fn = useServerFn(getPostBySlug);
  const revFn = useServerFn(listReviews);
  const addRevFn = useServerFn(addReview);
  const feedFn = useServerFn(listFeed);
  const [me, setMe] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  const { data, isLoading } = useQuery({ queryKey: ["post", slug], queryFn: () => fn({ data: { slug } }) });
  const p = data?.post;
  const { data: rData } = useQuery({ queryKey: ["reviews", p?.id], queryFn: () => revFn({ data: { postId: p.id } }), enabled: !!p });
  const { data: cData } = useQuery({ queryKey: ["game-community", p?.id], queryFn: () => feedFn({ data: { gameId: p.id, limit: 4 } }), enabled: !!p });

  const submit = useMutation({
    mutationFn: () => addRevFn({ data: { postId: p.id, rating, comment: comment || undefined } }),
    onSuccess: () => { setComment(""); qc.invalidateQueries({ queryKey: ["reviews", p.id] }); qc.invalidateQueries({ queryKey: ["post", slug] }); },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!p) return <div className="min-h-screen flex items-center justify-center">Not found. <Link to="/" className="ml-2 text-primary">Home</Link></div>;

  const screenshots: string[] = Array.isArray(p.system_requirements?.screenshots) ? p.system_requirements.screenshots : [];
  const downloadLinks: { name: string; url: string }[] = Array.isArray(p.download_links) ? p.download_links : [];
  const mirrors = downloadLinks.length ? downloadLinks : (p.download_url ? [{ name: "Direct", url: p.download_url }] : []);
  const reqs = p.system_requirements ?? {};

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative">
          {p.banner_image || p.backdrop_url ? (
            <div className="absolute inset-0 -z-10">
              <img src={p.banner_image ?? p.backdrop_url} alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
            </div>
          ) : null}
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
            <nav className="text-xs text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/games" className="hover:text-foreground capitalize">{p.kind}</Link> / <span className="text-foreground">{p.title}</span>
            </nav>
            <div className="grid md:grid-cols-[280px_1fr] gap-8">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border glow-purple">
                {p.cover_url ? <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-purple-pink" />}
              </div>
              <div>
                {p.product_subtitle && <p className="text-sm text-muted-foreground">{p.product_subtitle}</p>}
                <h1 className="font-display text-3xl md:text-5xl font-black my-2">{p.title}</h1>
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill={i < Math.round(p.rating ?? 0) ? "currentColor" : "none"} />)}
                  <span className="text-sm text-muted-foreground ml-2">{p.reviews ?? 0} reviews</span>
                  {p.recommend_percent && <span className="text-sm text-emerald-400 ml-3">{p.recommend_percent}% recommend</span>}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(p.genres ?? []).map((g: string) => <span key={g} className="px-3 h-7 inline-flex items-center rounded-full glass text-xs">{g}</span>)}
                  {p.genres_text && p.genres_text.split(",").map((g: string) => <span key={g} className="px-3 h-7 inline-flex items-center rounded-full glass text-xs">{g.trim()}</span>)}
                </div>
                <p className="text-foreground/85 mb-6 leading-relaxed whitespace-pre-wrap">{p.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-sm">
                  {p.file_size && <Stat icon={HardDrive} label="Size" value={p.file_size} />}
                  {p.size && !p.file_size && <Stat icon={HardDrive} label="Size" value={p.size} />}
                  {p.year && <Stat icon={Calendar} label="Year" value={String(p.year)} />}
                  {p.developer && <Stat icon={Users} label="Developer" value={p.developer} />}
                  {p.publisher && <Stat icon={Tag} label="Publisher" value={p.publisher} />}
                  {p.version && <Stat icon={Tag} label="Version" value={p.version} />}
                  {p.platform && <Stat icon={MonitorCheck} label="Platform" value={p.platform} />}
                  {p.ram_required && <Stat icon={MemoryStick} label="RAM" value={p.ram_required} />}
                </div>
                <div className="flex flex-wrap gap-3">
                  {mirrors.length > 0 && (
                    <a href={mirrors[0].url} target="_blank" rel="noreferrer" className="download-btn inline-flex items-center gap-2 h-12 px-6 rounded-full text-white font-bold glow-pink">
                      <Download size={18} /> Download
                    </a>
                  )}
                  <button className="h-12 px-5 rounded-full glass inline-flex items-center gap-2 font-bold"><ThumbsUp size={16} className="text-brand-blue" /> {p.likes ?? 0}</button>
                  <button className="h-12 px-5 rounded-full glass inline-flex items-center gap-2 font-bold"><ThumbsDown size={16} className="text-muted-foreground" /> {p.dislikes ?? 0}</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {mirrors.length > 1 && (
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <h2 className="font-display text-2xl font-black mb-4 flex items-center gap-2"><Download className="text-primary" /> Download mirrors</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mirrors.map((m, i) => (
                <a key={i} href={m.url} target="_blank" rel="noreferrer" className="glass-strong rounded-xl p-4 flex items-center justify-between hover:glow-purple">
                  <span className="font-bold">{m.name}</span>
                  <Download size={16} className="text-primary" />
                </a>
              ))}
            </div>
          </section>
        )}

        {screenshots.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <h2 className="font-display text-2xl font-black mb-4">Screenshots</h2>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {screenshots.map((s, i) => (
                <img key={i} src={s} alt="" className="h-56 md:h-72 rounded-xl flex-shrink-0 object-cover" />
              ))}
            </div>
          </section>
        )}

        {(reqs.minimum || reqs.recommended) && (
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 grid md:grid-cols-2 gap-4">
            {reqs.minimum && <Reqs title="Minimum" data={reqs.minimum} />}
            {reqs.recommended && <Reqs title="Recommended" data={reqs.recommended} />}
          </section>
        )}

        {p.installation_guide && (
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <h2 className="font-display text-2xl font-black mb-3">Installation guide</h2>
            <div className="glass-strong rounded-2xl p-5 whitespace-pre-wrap text-foreground/85">{p.installation_guide}</div>
          </section>
        )}

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <h2 className="font-display text-2xl font-black mb-4 flex items-center gap-2"><Star className="text-yellow-400" /> Reviews</h2>
          {me ? (
            <div className="glass-strong rounded-2xl p-4 space-y-3 mb-5">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setRating(i + 1)}><Star size={22} className={i < rating ? "text-yellow-400 fill-current" : "text-muted-foreground"} /></button>
                ))}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Share your thoughts..." className="w-full p-3 rounded-xl bg-secondary outline-none resize-none" />
              <button onClick={() => submit.mutate()} disabled={submit.isPending} className="community-btn h-10 px-5 rounded-full text-white font-bold inline-flex items-center gap-2">
                <Send size={14} /> Submit review
              </button>
            </div>
          ) : <Link to="/auth" className="block glass-strong rounded-2xl p-4 text-center text-sm">Sign in to leave a review</Link>}

          <div className="space-y-3">
            {(rData?.reviews ?? []).map((r: any) => (
              <div key={r.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-sm">{r.author_name}</strong>
                  <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-yellow-400 fill-current" : "text-muted-foreground"} />)}</span>
                </div>
                {r.comment && <p className="text-sm text-foreground/85">{r.comment}</p>}
              </div>
            ))}
            {(rData?.reviews ?? []).length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
          </div>
        </section>

        {(cData?.posts ?? []).length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <h2 className="font-display text-2xl font-black mb-4 flex items-center gap-2"><MessageCircle className="text-primary" /> Community discussions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {cData!.posts.map((cp: any) => (
                <Link key={cp.id} to="/community/$postId" params={{ postId: cp.id }} className="glass rounded-xl p-4">
                  <p className="font-bold">{cp.title ?? "Post"}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{cp.content}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-2">
      <Icon size={16} className="text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-bold truncate">{value}</p>
      </div>
    </div>
  );
}
function Reqs({ title, data }: { title: string; data: Record<string, string> }) {
  return (
    <div className="glass-strong rounded-2xl p-5">
      <h3 className="font-display font-black mb-3 flex items-center gap-2"><Cpu size={18} className="text-primary" /> {title}</h3>
      <dl className="space-y-1 text-sm">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground capitalize">{k}</dt><dd className="font-medium text-right">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}
