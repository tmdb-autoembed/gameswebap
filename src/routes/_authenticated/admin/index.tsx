import { createFileRoute, Link } from "@tanstack/react-router";
import { DownloadCloud, FileText, Flag, Gamepad2, MessageCircle, Palette, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({ component: AdminDashboard });

const stats = [
  { label: "Games", value: "All", hint: "Download posts", icon: Gamepad2, tone: "from-cyan-400 to-blue-500" },
  { label: "Posts", value: "Live", hint: "Pages and feed", icon: FileText, tone: "from-violet-400 to-fuchsia-500" },
  { label: "Users", value: "Roles", hint: "Members and profiles", icon: Users, tone: "from-emerald-400 to-teal-500" },
  { label: "Stories", value: "24h", hint: "Community moments", icon: Sparkles, tone: "from-amber-300 to-orange-500" },
  { label: "Requests", value: "Queue", hint: "Game requests", icon: DownloadCloud, tone: "from-pink-400 to-rose-500" },
  { label: "Reports", value: "Review", hint: "Safety center", icon: Flag, tone: "from-red-400 to-purple-500" },
] as const;

const actions = [
  { to: "/admin/posts", title: "Games / Software / Apps", desc: "Create, edit, publish, pin, tag, and manage all download pages.", icon: Gamepad2 },
  { to: "/admin/import", title: "Sitemap Post Extractor", desc: "Fetch sitemap URLs, crawl every post page, extract class/meta data, and skip duplicates.", icon: DownloadCloud },
  { to: "/admin/menu", title: "Editable Menus", desc: "Manage default header links: Games, Top, Trending, Software, Apps, Console Games, Donate, Request.", icon: Palette },
  { to: "/admin/community", title: "Community Hub", desc: "Manage feed posts, showcase items, issues, stories, polls, comments, and pinned content.", icon: MessageCircle },
  { to: "/admin/users", title: "Users & Roles", desc: "Review members, profiles, verification, banned users, and account controls.", icon: Users },
  { to: "/admin/reports", title: "Safety Center", desc: "Handle reports, reactions, reviews, request queues, and moderation workflows.", icon: Flag },
] as const;

function AdminDashboard() {
  return (
    <div className="space-y-7">
      <section className="admin-hero-card">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-100"><Sparkles size={14} /> Grid based admin menu</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-display font-black leading-tight">Manage every game, community module, import job, report, and website setting from one pro console.</h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">Dark glass interface, neon accents, responsive cards, sitemap post extraction, editable menus, and fast access to every management option.</p>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-stat-card">
              <span className={`admin-stat-icon bg-gradient-to-r ${stat.tone}`}><Icon size={22} /></span>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-display font-black">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.24em] text-primary">Control grid</p><h3 className="text-2xl font-display font-black">Management shortcuts</h3></div></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return <Link key={action.to} to={action.to} className="admin-action-card group"><span className="admin-action-icon"><Icon size={22} /></span><span className="block font-bold text-lg group-hover:text-white">{action.title}</span><span className="mt-2 block text-sm text-muted-foreground leading-relaxed">{action.desc}</span></Link>;
          })}
        </div>
      </section>
    </div>
  );
}
