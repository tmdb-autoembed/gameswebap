import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { getMyRole, adminListMenu } from "@/lib/menu.functions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminLayout });

const ICONS: Record<string, any> = {
  Gamepad2, ArrowUp, TrendingUp, LayoutGrid, Smartphone, Lock, Heart, MessageSquare, Users, Circle,
  AppWindow, BarChart3, BookOpen, Download, FileText, Flag, FolderTree, Image, LayoutDashboard,
  LogOut, Megaphone, Menu: MenuIcon, MonitorDown, Palette, Pin, SearchCheck, Settings, Shield,
  Sparkles, Star, Store, UserX, Vote, Wrench,
};

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const roleFn = useServerFn(getMyRole);
  const menuFn = useServerFn(adminListMenu);
  const { data: role } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn({}) });
  const { data: menuData } = useQuery({ queryKey: ["admin-menu-sidebar"], queryFn: () => menuFn({}) });

  const saveMenuFn = useServerFn(adminSaveMenu);
  const [editingMenu, setEditingMenu] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);

  useEffect(() => {
    if (menuData?.items) setDraftItems(menuData.items);
  }, [menuData]);

  const saveMenu = useMutation({
    mutationFn: () => Promise.all((draftItems ?? []).map((it: any) => saveMenuFn({ data: it }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-menu-sidebar"] }),
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-foreground">Loading admin console…</div>;
  if (!role?.isAdmin) return <RedirectAdminNonAdmin navigate={navigate} />;

  const menuItems = menuData?.items ?? [];
  const mainItems = menuItems.filter((m: any) => ["Games","Software","Apps"].includes(m.label));
  const postItems = menuItems.filter((m: any) => !["Games","Software","Apps"].includes(m.label));

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
