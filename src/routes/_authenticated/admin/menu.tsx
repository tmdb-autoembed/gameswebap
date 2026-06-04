import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListMenu, adminSaveMenu, adminDeleteMenu } from "@/lib/menu.functions";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: MenuAdmin,
});

const ICON_OPTS = ["Gamepad2","ArrowUp","TrendingUp","LayoutGrid","Smartphone","Lock","Heart","MessageSquare","Users","Circle"];

function MenuAdmin() {
  const listFn = useServerFn(adminListMenu);
  const saveFn = useServerFn(adminSaveMenu);
  const delFn = useServerFn(adminDeleteMenu);
  const { data, refetch } = useQuery({ queryKey: ["admin-menu"], queryFn: () => listFn({}) });
  const [items, setItems] = useState<any[]>([]);
  const items_ = data?.items ?? items;

  const save = useMutation({
    mutationFn: (it: any) => saveFn({ data: it }),
    onSuccess: () => refetch(),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => refetch(),
  });

  const blank = { label: "New", href: "/", icon: "Circle", color: "#7c3aed", sort_order: (data?.items?.length ?? 0) + 1, enabled: true };

  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-6">Menu items</h1>
      <button onClick={() => save.mutate(blank)} className="community-btn px-4 h-10 rounded-full text-white font-bold mb-4">+ Add item</button>
      <div className="space-y-2">
        {(data?.items ?? []).map((m: any) => (
          <MenuRow key={m.id} item={m} onSave={(d) => save.mutate({ ...d, id: m.id })} onDelete={() => del.mutate(m.id)} />
        ))}
      </div>
    </div>
  );
}

function MenuRow({ item, onSave, onDelete }: any) {
  const [v, setV] = useState(item);
  return (
    <div className="flex flex-wrap gap-2 items-center p-3 bg-card border border-border rounded-xl">
      <input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} placeholder="Label" className="h-9 px-2 rounded bg-secondary border border-border w-28" />
      <input value={v.href} onChange={(e) => setV({ ...v, href: e.target.value })} placeholder="/href" className="h-9 px-2 rounded bg-secondary border border-border w-40" />
      <select value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} className="h-9 px-2 rounded bg-secondary border border-border">
        {ICON_OPTS.map((i) => <option key={i}>{i}</option>)}
      </select>
      <input type="color" value={v.color} onChange={(e) => setV({ ...v, color: e.target.value })} className="h-9 w-14 rounded bg-secondary border border-border" />
      <input type="number" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: parseInt(e.target.value) })} className="h-9 px-2 rounded bg-secondary border border-border w-20" />
      <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={v.enabled} onChange={(e) => setV({ ...v, enabled: e.target.checked })} /> on</label>
      <div className="ml-auto flex gap-2">
        <button onClick={() => onSave(v)} className="px-3 h-9 rounded bg-primary text-primary-foreground text-sm font-bold">Save</button>
        <button onClick={onDelete} className="px-3 h-9 rounded bg-destructive text-destructive-foreground text-sm">×</button>
      </div>
    </div>
  );
}
