import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCategories, adminSaveCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({ component: Cats });

function Cats() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCategories);
  const saveFn = useServerFn(adminSaveCategory);
  const delFn = useServerFn(adminDeleteCategory);
  const { data } = useQuery({ queryKey: ["admin-cats"], queryFn: () => listFn({}) });
  const save = useMutation({ mutationFn: (d: any) => saveFn({ data: d }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cats"] }) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cats"] }) });
  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-4">Categories</h1>
      <button onClick={() => save.mutate({ slug: "new-" + Date.now(), name: "New", kind: "games", color: "#7c3aed", icon: "Tag", sort_order: 0 })}
        className="community-btn h-10 px-4 rounded-full text-white font-bold mb-4 inline-flex items-center gap-2"><Plus size={14} /> Add</button>
      <div className="space-y-2">
        {(data?.categories ?? []).map((c: any) => <Row key={c.id} item={c} onSave={(d: any) => save.mutate({ ...d, id: c.id })} onDel={() => del.mutate(c.id)} />)}
      </div>
    </div>
  );
}
function Row({ item, onSave, onDel }: any) {
  const [v, setV] = useState(item);
  return (
    <div className="flex flex-wrap gap-2 items-center p-3 bg-card border border-border rounded-xl">
      <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Name" className="h-9 px-2 rounded bg-secondary border border-border w-32" />
      <input value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="slug" className="h-9 px-2 rounded bg-secondary border border-border w-32" />
      <select value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })} className="h-9 px-2 rounded bg-secondary border border-border">
        <option>games</option><option>software</option><option>apps</option><option>console</option>
      </select>
      <input value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} placeholder="Icon" className="h-9 px-2 rounded bg-secondary border border-border w-28" />
      <input type="color" value={v.color ?? "#7c3aed"} onChange={(e) => setV({ ...v, color: e.target.value })} className="h-9 w-14 rounded" />
      <input type="number" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: parseInt(e.target.value) || 0 })} className="h-9 px-2 rounded bg-secondary border border-border w-20" />
      <div className="ml-auto flex gap-2">
        <button onClick={() => onSave(v)} className="px-3 h-9 rounded bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-1"><Save size={12} /> Save</button>
        <button onClick={onDel} className="h-9 w-9 rounded bg-destructive text-destructive-foreground inline-flex items-center justify-center"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
