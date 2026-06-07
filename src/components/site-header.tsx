import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Sun, Moon, Menu, Users, Gamepad2, Dice5, X, ArrowUp, TrendingUp, LayoutGrid, Smartphone, Lock, Heart, MessageSquare, Circle, LogIn, Shield, User, BookOpen, Sparkles, MessageCircle } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMenu, getMyRole } from "@/lib/menu.functions";
import { searchPosts, getRandomPost } from "@/lib/posts.functions";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";

const ICONS: Record<string, any> = { Gamepad2, ArrowUp, TrendingUp, LayoutGrid, Smartphone, Lock, Heart, MessageSquare, Circle, Users };

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const menuFn = useServerFn(listMenu);
  const { data: menuData } = useQuery({ queryKey: ["menu"], queryFn: () => menuFn({}) });
  const items = menuData?.items ?? [];

  const roleFn = useServerFn(getMyRole);
  const { data: roleData } = useQuery({ queryKey: ["my-role", authed], queryFn: () => roleFn({}), enabled: authed });

  const searchFn = useServerFn(searchPosts);
  const { data: searchData } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchFn({ data: { q } }),
    enabled: q.length >= 2,
  });

  const randomFn = useServerFn(getRandomPost);
  const goRandom = async () => {
    const r = await randomFn({});
    if (r.slug) navigate({ to: "/games/$slug", params: { slug: r.slug } });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-foreground/80" aria-label="menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="font-display font-black text-lg lg:text-2xl tracking-wider logo-gradient truncate">
            CREATIVE CONOR
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-foreground/80">
          {items.slice(0, 8).map((n) => (
            <a key={n.id} href={n.href} className="hover:text-foreground transition-colors whitespace-nowrap">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 lg:gap-2">
          <button onClick={goRandom} title="Random post" className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-500/30" aria-label="Random">
            <Dice5 size={16} />
          </button>
          <Link to="/community" className="community-btn hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-full text-white text-xs font-bold tracking-wide">
            <Users size={14} /> COMMUNITY
          </Link>
          <button onClick={() => setSearchOpen((s) => !s)} className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-foreground/80" aria-label="Search">
            <Search size={16} />
          </button>
          <button onClick={toggle} className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-foreground/80" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {roleData?.isAdmin ? (
            <Link to="/admin" className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-foreground/80" aria-label="Admin">
              <Shield size={16} />
            </Link>
          ) : !authed ? (
            <Link to="/auth" className="h-9 w-9 flex items-center justify-center rounded-full bg-secondary text-foreground/80" aria-label="Sign in">
              <LogIn size={16} />
            </Link>
          ) : null}
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search games, software, apps..."
              className="w-full h-11 px-4 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary"
            />
            {q.length >= 2 && (
              <div className="mt-2 max-h-80 overflow-auto rounded-xl bg-card border border-border divide-y divide-border/60">
                {(searchData?.results ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">No results</p>}
                {searchData?.results?.map((r: any) => (
                  <Link
                    key={r.slug}
                    to="/games/$slug"
                    params={{ slug: r.slug }}
                    onClick={() => { setSearchOpen(false); setQ(""); }}
                    className="flex items-center gap-3 p-2.5 hover:bg-secondary"
                  >
                    {r.cover_url ? (
                      <img src={r.cover_url} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-fuchsia-500 to-purple-600" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.kind}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-background border-r border-border/40 overflow-y-auto">
            <div className="px-5 py-5 flex items-center justify-between border-b border-border/40">
              <span className="font-display font-black text-xl logo-gradient">CREATIVE CONOR</span>
              <button onClick={() => setOpen(false)} className="text-foreground/70"><X size={22} /></button>
            </div>
            <nav className="px-3 py-2">
              {items.map((n) => {
                const Icon = ICONS[n.icon] ?? Circle;
                return (
                  <a key={n.id} href={n.href} onClick={() => setOpen(false)} className="flex items-center gap-4 px-3 py-3 border-b border-border/40">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${n.color}25`, color: n.color }}>
                      <Icon size={20} />
                    </span>
                    <span className="flex-1 font-bold text-base">{n.label}</span>
                    <span className="text-foreground/40">›</span>
                  </a>
                );
              })}
            </nav>
            <div className="px-5 py-4 grid grid-cols-2 gap-2">
              {["🇬🇧 English","🇹🇷 Türkçe","🇩🇪 Deutschland","🇫🇷 France","🇯🇵 日本","🇦🇪 عربي","🇪🇸 Español","🇵🇹 Português","🇷🇺 Русский","🇨🇳 中文"].map((l) => (
                <button key={l} className="h-10 rounded-full bg-secondary text-foreground/80 text-sm font-medium">{l}</button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground py-5">© 2026 CreativeConor</p>
          </aside>
        </div>
      )}
    </header>
  );
}
