import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { reactToPost, deleteCommunityPost } from "@/lib/community.functions";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Smile, Trash2, BarChart3, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { PollBlock } from "./poll-block";

export function FeedCard({ post, currentUserId }: { post: any; currentUserId: string | null }) {
  const qc = useQueryClient();
  const reactFn = useServerFn(reactToPost);
  const delFn = useServerFn(deleteCommunityPost);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const react = useMutation({
    mutationFn: (type: string | null) => reactFn({ data: { postId: post.id, type: type as any } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });
  const del = useMutation({
    mutationFn: () => delFn({ data: { id: post.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const author = post.author;
  const typeColor =
    post.type === "issue" ? "from-amber-400 to-rose-500" :
    post.type === "showcase" ? "from-emerald-400 to-cyan-500" : "from-fuchsia-500 to-purple-600";

  return (
    <article className="glass-strong rounded-2xl overflow-hidden">
      <header className="flex items-center gap-3 p-4">
        <Link to="/profile/$username" params={{ username: author?.username ?? "user" }} className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-br ${typeColor}`}>
            {author?.avatar ? (
              <img src={author.avatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-background" />
            ) : (
              <span className="w-full h-full rounded-full bg-card flex items-center justify-center font-bold text-sm">
                {(author?.display_name ?? "U").slice(0, 2).toUpperCase()}
              </span>
            )}
          </span>
          <span className="min-w-0">
            <p className="font-semibold truncate">{author?.display_name ?? "User"}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span>@{author?.username ?? "user"}</span>
              {post.feeling && <><span>·</span><Smile size={11} /><span>{post.feeling}</span></>}
              {post.location && <><span>·</span><MapPin size={11} /><span>{post.location}</span></>}
              <span>·</span><span>{timeAgo(post.created_at)}</span>
            </p>
          </span>
        </Link>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r ${typeColor} text-white`}>
          {post.type}
        </span>
        {currentUserId === post.author_id && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-secondary"><MoreHorizontal size={16} /></button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 glass-strong rounded-xl py-1 min-w-32">
                <button onClick={() => del.mutate()} className="w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary text-destructive">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="px-4 pb-3">
        {post.title && <h3 className="font-display font-bold text-lg mb-1">{post.title}</h3>}
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.links?.length > 0 && (
          <div className="mt-2 space-y-1">
            {post.links.map((l: string) => (
              <a key={l} href={l} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline truncate">{l}</a>
            ))}
          </div>
        )}
      </div>

      {post.images?.length > 0 && (
        <div className={`grid gap-1 ${post.images.length === 1 ? "" : "grid-cols-2"}`}>
          {post.images.slice(0, 4).map((img: string, i: number) => (
            <img key={i} src={img} alt="" className={`w-full ${post.images.length === 1 ? "max-h-[520px]" : "aspect-square"} object-cover`} />
          ))}
        </div>
      )}

      <PollBlock postId={post.id} />

      {post.game_id && (
        <Link to="/games/$slug" params={{ slug: post.game_id }} className="mx-4 my-3 flex items-center gap-2 p-3 rounded-xl glass">
          <Gamepad2 size={16} className="text-brand-cyan" />
          <span className="text-sm font-semibold">Showcasing a game</span>
        </Link>
      )}

      <footer className="flex items-center gap-1 px-2 py-2 border-t border-border/40">
        <ReactionBar reactions={post.reactions ?? {}} likes={post.likes} active={active} onPick={(t) => { setActive(active === t ? null : t); react.mutate(active === t ? null : t); }} disabled={!currentUserId} />
        <Link to="/community/$postId" params={{ postId: post.id }} className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm text-foreground/80 hover:bg-secondary">
          <MessageCircle size={16} /> {post.comments_count ?? 0}
        </Link>
        <button onClick={() => navigator.share?.({ url: window.location.origin + "/community/" + post.id }).catch(() => navigator.clipboard.writeText(window.location.origin + "/community/" + post.id))}
          className="flex items-center gap-1.5 px-3 h-9 rounded-full text-sm text-foreground/80 hover:bg-secondary ml-auto">
          <Share2 size={16} /> {post.shares ?? 0}
        </button>
      </footer>
    </article>
  );
}

const REACTIONS = [
  { type: "like", emoji: "👍", color: "text-brand-blue" },
  { type: "love", emoji: "❤️", color: "text-brand-pink" },
  { type: "haha", emoji: "😂", color: "text-brand-amber" },
  { type: "wow",  emoji: "😮", color: "text-brand-cyan" },
  { type: "sad",  emoji: "😢", color: "text-muted-foreground" },
  { type: "angry",emoji: "😡", color: "text-destructive" },
];

function ReactionBar({ reactions, likes, active, onPick, disabled }: any) {
  return (
    <div className="relative group">
      <button disabled={disabled} onClick={() => onPick(active ?? "like")}
        className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-sm hover:bg-secondary ${active ? "text-brand-pink" : "text-foreground/80"} disabled:opacity-50`}>
        <Heart size={16} className={active ? "fill-current" : ""} /> {likes ?? 0}
      </button>
      {!disabled && (
        <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto">
          <div className="glass-strong rounded-full p-1 flex gap-0.5">
            {REACTIONS.map((r) => (
              <button key={r.type} onClick={() => onPick(r.type)} className="w-9 h-9 rounded-full hover:scale-125 transition text-lg">{r.emoji}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}
