import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPages, adminSavePage, adminDeletePage } from "@/lib/admin.functions";
import { useState } from "react";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pages")({ component: Pages });

function Pages() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListPages);
  const saveFn = useServerFn(adminSavePage);
  const delFn = useServerFn(adminDeletePage);
  const { data } = useQuery({ queryKey: ["admin-pages"], queryFn: () => listFn({}) });
  const [edit, setEdit] = useState<any | null>(null);
  const save = useMutation({ mutationFn: (d: any) => saveFn({ data: d }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); setEdit(null); } });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pages"] }) });
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-display font-black">Pages / Blog</h1>
        <button onClick={() => setEdit({ slug: "", title: "", content: "", template: "default", is_published: true })} className="community-btn h-10 px-4 rounded-full text-white font-bold inline-flex items-center gap-2"><Plus size={14} /> New page</button>
      </div>
      <div className="space-y-2">
        {(data?.pages ?? []).map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex-1">
              <p className="font-bold">{p.title}</p>
              <p className="text-xs text-muted-foreground">/{p.slug}</p>
            </div>
            {p.is_published ? <Eye className="text-emerald-400" size={16} /> : <EyeOff className="text-muted-foreground" size={16} />}
            <button onClick={() => setEdit(p)} className="px-3 h-9 rounded bg-primary text-primary-foreground text-sm font-bold">Edit</button>
            <button onClick={() => del.mutate(p.id)} className="h-9 w-9 rounded bg-destructive text-destructive-foreground inline-flex items-center justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      {edit && <Editor item={edit} onClose={() => setEdit(null)} onSave={(d: any) => save.mutate(d)} />}
    </div>
  );
}
function Editor({ item, onClose, onSave }: any) {
  const [v, setV] = useState(item);
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-5 w-full max-w-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-black">Edit page</h3>
        <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="Title" className="w-full h-10 px-3 rounded bg-secondary outline-none" />
        <input value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="slug" className="w-full h-10 px-3 rounded bg-secondary outline-none" />
        <input value={v.cover_image ?? ""} onChange={(e) => setV({ ...v, cover_image: e.target.value || null })} placeholder="Cover image URL (optional)" className="w-full h-10 px-3 rounded bg-secondary outline-none" />
        <textarea value={v.content ?? ""} onChange={(e) => setV({ ...v, content: e.target.value })} rows={10} placeholder="Content (markdown or plain text)" className="w-full p-3 rounded bg-secondary outline-none resize-none" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_published} onChange={(e) => setV({ ...v, is_published: e.target.checked })} /> Published</label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 h-9 rounded bg-secondary text-sm">Cancel</button>
          <button onClick={() => onSave(v)} className="px-4 h-9 rounded community-btn text-white text-sm font-bold inline-flex items-center gap-1"><Save size={14} /> Save</button>
        </div>
      </div>
    </div>
  );
}
