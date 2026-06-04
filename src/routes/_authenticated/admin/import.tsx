import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { scrapeSitemap, scrapeOnePost } from "@/lib/scrape.functions";

export const Route = createFileRoute("/_authenticated/admin/import")({
  component: ImportPage,
});

function ImportPage() {
  const [sitemap, setSitemap] = useState("https://creativeconor.com/sitemap.xml");
  const [urls, setUrls] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [limit, setLimit] = useState(20);

  const sitemapFn = useServerFn(scrapeSitemap);
  const oneFn = useServerFn(scrapeOnePost);

  const fetchSitemap = useMutation({
    mutationFn: () => sitemapFn({ data: { sitemapUrl: sitemap } }),
    onSuccess: (d) => {
      const filtered = d.urls.filter((u) => /\/(games|software|apps|console)\//.test(u));
      setUrls(filtered);
      setLog((l) => [...l, `Found ${filtered.length} post URLs`]);
    },
  });

  const runImport = async () => {
    setRunning(true);
    const targets = urls.slice(0, limit);
    for (const u of targets) {
      try {
        const r = await oneFn({ data: { url: u } });
        setLog((l) => [...l, `✓ ${r.title}`]);
      } catch (e: any) {
        setLog((l) => [...l, `✗ ${u} — ${e.message}`]);
      }
    }
    setRunning(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-black mb-6">Import from sitemap</h1>
      <p className="text-sm text-muted-foreground mb-4">Requires Firecrawl connector. Posts upsert by slug.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} className="flex-1 min-w-64 h-10 px-3 rounded bg-secondary border border-border" />
        <button onClick={() => fetchSitemap.mutate()} disabled={fetchSitemap.isPending} className="px-4 h-10 rounded bg-primary text-primary-foreground font-bold">
          {fetchSitemap.isPending ? "Fetching…" : "Fetch URLs"}
        </button>
      </div>
      {fetchSitemap.error && <p className="text-destructive text-sm">{(fetchSitemap.error as Error).message}</p>}
      {urls.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm">Limit:</label>
          <input type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value) || 1)} className="w-20 h-10 px-2 rounded bg-secondary border border-border" />
          <button onClick={runImport} disabled={running} className="community-btn px-5 h-10 rounded-full text-white font-bold">
            {running ? "Importing…" : `Import ${Math.min(limit, urls.length)} posts`}
          </button>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl p-3 h-80 overflow-auto text-sm font-mono">
        {log.length === 0 ? <p className="text-muted-foreground">Log will appear here…</p> : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
