import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  GripVertical,
} from "lucide-react";
import { getMyRole, adminListMenu } from "@/lib/menu.functions";
import { supabase } from "@/integrations/supabase/client";
import { adminSaveMenu } from "@/lib/menu.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

const ICONS: Record<string, any> = {
  Gamepad2, ArrowUp, TrendingUp, LayoutGrid, Smartphone, Lock, Heart, MessageSquare, Users, Circle,
  AppWindow, BarChart3, BookOpen, Download, FileText, Flag, FolderTree, Image, LayoutDashboard,
  LogOut, Megaphone, Menu: MenuIcon, MonitorDown, Palette, Pin, SearchCheck, Settings, Shield,
  Sparkles, Star, Store, UserX, Vote, Wrench,
};

const adminSections = [
  {
    label: "Community",
    items: [
      { to: "/admin/community", label: "Feed", icon: MessageSquare },
      { to: "/admin/community", label: "Discussions", icon: BookOpen },
      { to: "/admin/community", label: "Issues", icon: Wrench },
      { to: "/admin/community", label: "Showcase", icon: Sparkles },
      { to: "/admin/community", label: "Stories", icon: Store },
      { to: "/admin/community", label: "Polls", icon: Vote },
      { to: "/admin/community", label: "Pinned Posts", icon: Pin },
      { to: "/admin/requests", label: "Game Requests", icon: Megaphone },
      { to: "/admin/reviews", label: "Reactions", icon: Star },
      { to: "/admin/reports", label: "Reports", icon: Flag },
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
      { to: "/admin/assets", label: "Media Library", icon: Image },
      { to: "/admin/settings", label: "SEO", icon: SearchCheck },
      { to: "/admin/settings", label: "Appearance", icon: Palette },
      { to: "/admin/menu", label: "Menus", icon: MenuIcon },
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/import", label: "Sitemap Importer", icon: Download },
    ],
  },
];

const mobileItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Games", icon: Gamepad2 },
  { to: "/admin/posts", label: "Software", icon: MonitorDown },
  { to: "/admin/posts", label: "Apps", icon: AppWindow },
  { to: "/admin/pages", label: "Posts", icon: FileText },
  ...adminSections.flatMap((s) => s.items),
];

type SectionItem = { to: string; label: string; icon: any };
type AdminSection = { label: string; items: SectionItem[] };

function RedirectAdminNonAdmin({ navigate }: { navigate: any }) {
  useEffect(() => navigate({ to: "/" }), [navigate]);
  return <div className="min-h-screen grid place-items-center text-foreground">Redirecting to homepage…</div>;
}

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const roleFn = useServerFn(getMyRole);
  const { data: role, isLoading } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn({}) });
  const menuFn = useServerFn(adminListMenu);
  const { data: menuData } = useQuery({ queryKey: ["admin-menu-sidebar"], queryFn: () => menuFn({}) });
  const saveMenuFn = useServerFn(adminSaveMenu);

  const [editingMenu, setEditingMenu] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);

  useEffect(() => { if (menuData?.items) setDraftItems(menuData.items); }, [menuData]);

  const saveMenu = useMutation({
    mutationFn: () => Promise.all((draftItems ?? []).map((it: any) => saveMenuFn({ data: it }))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-menu-sidebar"] }); setEditingMenu(false); },
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-foreground">Loading admin console…</div>;
  if (!role?.isAdmin) return <RedirectAdminNonAdmin navigate={navigate} />;

  const menuItems = menuData?.items ?? [];
  const mainItems = menuItems.filter((m: any) => ["Games","Software","Apps"].includes(m.label));
  const postItems = menuItems.filter((m: any) => !["Games","Software","Apps"].includes(m.label));

  const quickAccess: SectionItem[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ...mainItems.map((m: any) => ({ to: m.href, label: m.label, icon: m.icon })),
  ].filter((it, i, self) => self.findIndex((x) => x.label === it.label) === i);

  return (
    <div className="admin-shell min-h-screen text-foreground">
      <aside className="admin-sidebar hidden lg:flex">
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="font-display font-black text-xl tracking-wider logo-gradient">CREATIVE CONOR</Link>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Control nexus</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Quick Access</p>
              {!editingMenu ? (
                <button onClick={() => setEditingMenu(true)} className="text-[10px] uppercase tracking-wider text-primary font-bold">Edit</button>
              ) : (
                <button onClick={() => { setEditingMenu(false); setDraftItems(menuItems); }} className="text-[10px] uppercase tracking-wider text-destructive font-bold">Cancel</button>
              )}
            </div>
            <div className="space-y-1">
              {editingMenu ? (
                <div className="space-y-1">
                  {draftItems.map((item: any, i: number) => (
                    <div key={item.id ?? i} className="flex items-center gap-1 bg-secondary/50 border border-border rounded-lg px-2 py-1">
                      <GripVertical size={12} className="text-muted-foreground" />
                      <input value={item.label} onChange={(e) => { const next = [...draftItems]; next[i] = { ...next[i], label: e.target.value }; setDraftItems(next); }} placeholder="label" className="h-7 flex-1 min-w-0 bg-transparent text-xs outline-none" />
                      <input value={item.href} onChange={(e) => { const next = [...draftItems]; next[i] = { ...next[i], href: e.target.value }; setDraftItems(next); }} placeholder="/href" className="h-7 w-24 bg-transparent text-xs outline-none" />
                      <button onClick={() => { const next = [...draftItems]; next.splice(i, 1); setDraftItems(next); }} className="text-xs text-destructive">×</button>
                    </div>
                  ))}
                  <button onClick={() => setDraftItems([...draftItems, { id: crypto.randomUUID(), label: "New", href: "/", icon: "Circle", color: "#7c3aed", sort_order: draftItems.length + 1, enabled: true }])} className="text-xs text-muted-foreground w-full text-center">+ Add</button>
                  <button onClick={() => saveMenu.mutate()} disabled={saveMenu.isPending} className="community-btn h-8 w-full rounded-lg text-white text-xs font-bold">{saveMenu.isPending ? "Saving…" : "Save menu"}</button>
                </div>
              ) : (
                quickAccess.map((item) => {
                  const Icon = ICONS[item.icon] ?? FileText;
                  return (
                    <Link key={`${item.label}-${item.to}`} to={item.to} activeOptions={item.exact ? { exact: true } : undefined} activeProps={{ className: "admin-nav-active" }} className="admin-nav-item">
                      <Icon size={17} /> <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Posts</p>
            <div className="space-y-1">
              {postItems.map((item: any) => {
                const Icon = ICONS[item.icon] ?? FileText;
                return (
                  <Link key={item.id ?? item.href} to={item.href} activeProps={{ className: "admin-nav-active" }} className="admin-nav-item">
                    <Icon size={17} /> <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
              <Link to="/admin/pages" className="admin-nav-item">
                <FileText size={17} /><span className="truncate">Pages</span>
              </Link>
              <Link to="/admin/pages" className="admin-nav-item">
                <FileText size={17} /><span className="truncate">Blog</span>
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Community</p>
            <div className="space-y-1">
              {adminSections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{section.label}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={`${section.label}-${item.label}`} to={item.to} activeProps={{ className: "admin-nav-active" }} className="admin-nav-item">
                          <Icon size={17} /> <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            {mobileItems.map((item) => <Link key={`${item.label}-${item.to}`} to={item.to} activeOptions={item.exact ? { exact: true } : undefined} activeProps={{ className: "text-primary" }} className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold">{item.label}</Link>)}
          </div>
          <Link to="/" className="hidden sm:inline-flex h-10 px-4 items-center rounded-full community-btn text-white text-sm font-bold">View site</Link>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
