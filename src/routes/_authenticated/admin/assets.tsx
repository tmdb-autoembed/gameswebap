import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAssets, adminDeleteAsset } from "@/lib/admin.functions";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Trash2, Upload, Loader2, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/assets")({ component: A });

function A() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListAssets);
  const delFn = useServerFn(adminDeleteAsset);
  const { upload, busy } = useImageUpload();
  const { data } = useQuery({ queryKey: ["admin-assets"], queryFn: () => listFn({}) });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-assets"] }) });
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-display font-black">Media library</h1>
        <label className="community-btn h-10 px-4 rounded-full text-white font-bold inline-flex items-center gap-2 cursor-pointer">
          <input type="file" accept="image/*" hidden multiple onChange={async (e) => {
            for (const f of Array.from(e.target.files ?? [])) {
              try { await upload(f, "library"); } catch (err) { console.error(err); }
            }
            qc.invalidateQueries({ queryKey: ["admin-assets"] });
          }} />
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {(data?.assets ?? []).map((a: any) => (
          <div key={a.id} className="relative group glass-strong rounded-xl overflow-hidden">
            <img src={a.thumb_url ?? a.file_url} alt="" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button onClick={() => navigator.clipboard.writeText(a.file_url)} className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center"><Copy size={14} /></button>
              <button onClick={() => del.mutate(a.id)} className="h-9 w-9 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><Trash2 size={14} /></button>
            </div>
            <p className="absolute bottom-0 left-0 right-0 text-[10px] p-1 bg-black/60 text-white truncate">{a.file_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
