import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AppWindow,
  BarChart3,
  BookOpen,
  Download,
  FileText,
  Flag,
  FolderTree,
  Gamepad2,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu as MenuIcon,
  MessageSquare,
  MonitorDown,
  Palette,
  Pin,
  SearchCheck,
  Settings,
  Shield,
  Sparkles,
  Star,
  Store,
  Users,
  UserX,
  Vote,
  Wrench,
} from "lucide-react";
import { getMyRole } from "@/lib/menu.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

const adminSections = [
  {
    label: "Main",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/posts", label: "Games", icon: Gamepad2 },
      { to: "/admin/posts", label: "Software", icon: MonitorDown },
      { to: "/admin/posts", label: "Apps", icon: AppWindow },
      { to: "/admin/pages", label: "Posts", icon: FileText },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/admin/community", label: "Feed", icon: MessageSquare },
      { to: "/admin/community", label: "Discussions", icon: BookOpen },
      { to: "/admin/community", label: "Issues", icon: Wrench },
      { to: "/admin/community", label: "Showcase", icon: Sparkles },
      { to: "/admin/community", label: "Stories", icon: Store },
      { to: "/admin/community", label: "Polls", icon: Vote },
      { to: "/admin/requests", label: "Game Requests", icon: Megaphone },
      { to: "/admin/reviews", label: "Reactions", icon: Star },
      { to: "/admin/reports", label: "Reports", icon: Flag },
      { to: "/admin/community", label: "Pinned Posts", icon: Pin },
    ],
  },
  {
    label: "Users",
    items: [
      { to: "/admin/users", label: "Members", icon: Users },
      { to: "/admin/users", label: "Profiles", icon: Users },
      { to: "/admin/users", label: "Verification", icon: Shield },
      { to: "/admin/users", label: "Banned Users", icon: UserX },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/assets", label: "Downloads / Files", icon: Download },
      { to: "/admin/assets", label: "Mirrors", icon: FolderTree },
      { to: "/admin", label: "Stats", icon: BarChart3, exact: true },
      { to: "/admin/assets", label: "Media Library", icon: Image },
      { to: "/admin/settings", label: "SEO", icon: SearchCheck },
      { to: "/admin/settings", label: "Appearance", icon: Palette },
      { to: "/admin/menu", label: "Menus", icon: MenuIcon },
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/import", label: "Sitemap Importer", icon: Download },
    ],
  },
] as const;

const mobileItems = adminSections.flatMap((section) => section.items).slice(0, 10);

function AdminLayout() {
  const navigate = useNavigate();
  const roleFn = useServerFn(getMyRole);
  const { data, isLoading } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn({}) });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-foreground">Loading admin console…</div>;
  if (!data?.isAdmin) return <div className="min-h-screen grid place-items-center text-foreground">403 — Admin access required.</div>;

  return (
    <div className="admin-shell min-h-screen text-foreground">
      <aside className="admin-sidebar hidden lg:flex">
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="font-display font-black text-xl tracking-wider logo-gradient">CREATIVE CONOR</Link>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Control nexus</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {adminSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={`${section.label}-${item.label}`} to={item.to} activeOptions={item.exact ? { exact: true } : undefined} activeProps={{ className: "admin-nav-active" }} className="admin-nav-item">
                      <Icon size={17} /> <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="admin-profile-card"><Shield size={18} className="text-emerald-300" /><div><p className="text-sm font-bold">Admin online</p><p className="text-xs text-muted-foreground">Full management access</p></div></div>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="mt-3 w-full h-10 rounded-xl bg-rose-500/15 text-rose-200 border border-rose-400/25 text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-rose-500/25"><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <div className="lg:pl-[280px]">
        <header className="admin-topbar">
          <div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Professional game app CMS</p><h1 className="text-lg md:text-2xl font-display font-black">Admin Panel</h1></div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
            {mobileItems.map((item) => <Link key={item.label} to={item.to} className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold">{item.label}</Link>)}
          </div>
          <Link to="/" className="hidden sm:inline-flex h-10 px-4 items-center rounded-full community-btn text-white text-sm font-bold">View site</Link>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
