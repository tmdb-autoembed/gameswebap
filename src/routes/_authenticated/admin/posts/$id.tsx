import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPost, adminSavePost } from "@/lib/posts.functions";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/posts/$id")({
  component: PostEditor,
});

function PostEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const getFn = useServerFn(adminGetPost);
  const saveFn = useServerFn(adminSavePost);
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: !isNew,
  });
  const [form, setForm] = useState<any>({
    slug: "", title: "", subtitle: "", kind: "games", cover_url: "", backdrop_url: "",
    description: "", size: "", year: 2026, developer: "", publisher: "", genres: [],
    requirements: {}, rating: 0, reviews: 0, source_url: "", download_url: "", status: "published",
  });
  useEffect(() => { if (data?.post) setForm({ ...data.post, genres: data.post.genres ?? [] }); }, [data]);
  const save = useMutation({
    mutationFn: () => saveFn({ data: { ...form, id: isNew ? undefined : id } }),
    onSuccess: () => navigate({ to: "/admin/posts" }),
  });

  const f = (k: string) => ({
    value: form[k] ?? "",
    onChange: (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value })),
    className: "w-full h-10 px-3 rounded-lg bg-secondary border border-border",
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-display font-black mb-6">{isNew ? "New post" : "Edit post"}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">Title<input {...f("title")} /></label>
        <label className="text-sm">Slug<input {...f("slug")} /></label>
        <label className="text-sm sm:col-span-2">Subtitle<input {...f("subtitle")} /></label>
        <label className="text-sm">Kind
          <select {...f("kind")}>
            <option value="games">Games</option><option value="software">Software</option>
            <option value="apps">Apps</option><option value="console">Console</option>
          </select>
        </label>
        <label className="text-sm">Status
          <select {...f("status")}><option value="published">Published</option><option value="draft">Draft</option></select>
        </label>
        <label className="text-sm">Cover URL<input {...f("cover_url")} /></label>
        <label className="text-sm">Backdrop URL<input {...f("backdrop_url")} /></label>
        <label className="text-sm">Size<input {...f("size")} /></label>
        <label className="text-sm">Year<input type="number" {...f("year")} onChange={(e) => setForm((p: any) => ({ ...p, year: parseInt(e.target.value) || null }))} /></label>
        <label className="text-sm">Developer<input {...f("developer")} /></label>
        <label className="text-sm">Publisher<input {...f("publisher")} /></label>
        <label className="text-sm sm:col-span-2">Genres (comma)
          <input value={(form.genres ?? []).join(", ")} onChange={(e) => setForm((p: any) => ({ ...p, genres: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} className="w-full h-10 px-3 rounded-lg bg-secondary border border-border" />
        </label>
        <label className="text-sm sm:col-span-2">Description
          <textarea value={form.description ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={6} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        </label>
        <label className="text-sm">Download URL<input {...f("download_url")} /></label>
        <label className="text-sm">Source URL<input {...f("source_url")} /></label>
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={() => save.mutate()} disabled={save.isPending} className="community-btn h-11 px-6 rounded-full text-white font-bold">
          {save.isPending ? "Saving…" : "Save"}
        </button>
        <button onClick={() => navigate({ to: "/admin/posts" })} className="h-11 px-6 rounded-full bg-secondary">Cancel</button>
      </div>
      {save.error && <p className="text-destructive mt-3">{(save.error as Error).message}</p>}
    </div>
  );
}
