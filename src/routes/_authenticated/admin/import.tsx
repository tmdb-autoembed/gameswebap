import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, DownloadCloud, FileSearch, RotateCcw, SkipForward, XCircle } from "lucide-react";
import { scrapeSitemap, scrapeOnePost, importSitemapPosts } from "@/lib/scrape.functions";

export const Route = createFileRoute("/_authenticated/admin/import")({
  component: ImportPage,
});

function ImportPage() {
  const [sitemap, setSitemap] = useState("https://creativeconor.com/sitemap.xml");
  const [urls, setUrls] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [limit, setLimit] = useState(100);
  const [force, setForce] = useState(false);
  const [kinds, setKinds] = useState<string[]>(["games", "software", "apps", "console"]);
  const [summary, setSummary] = useState<{ imported: number; skipped: number; failed: number; total: number } | null>(null);

  const sitemapFn = useServerFn(scrapeSitemap);
  const oneFn = useServerFn(scrapeOnePost);
  const bulkFn = useServerFn(importSitemapPosts);

  const fetchSitemap = useMutation({
    mutationFn: () => sitemapFn({ data: { sitemapUrl: sitemap } }),
    onSuccess: (d) => {
      setUrls(d.urls);
      setLog((l) => [...l, `Found ${d.urls.length} importable product URLs`]);
    },
  });

  const bulkImport = useMutation({
    mutationFn: () => bulkFn({ data: { sitemapUrl: sitemap, limit, force, kinds: kinds as any } }),
    onSuccess: (data) => {
      setSummary(data);
      setUrls(data.results.map((r) => r.url));
      setLog((l) => [
        ...l,
        `Bulk finished: ${data.imported} imported, ${data.skipped} skipped duplicates, ${data.failed} failed`,
        ...data.results.slice(0, 80).map((r) => `${r.status === "imported" ? "Imported" : r.status === "skipped" ? "Skipped" : "Failed"}: ${r.title ?? r.slug}${r.error ? ` — ${r.error}` : ""}`),
      ]);
    },
  });

  const runSelectedImport = async () => {
    setRunning(true);
    setSummary(null);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const targets = urls.slice(0, limit);
    for (const url of targets) {
      try {
        const row = await oneFn({ data: { url, force } });
        if (row.skipped) skipped += 1;
        else imported += 1;
        setLog((l) => [...l, `${row.skipped ? "Skipped duplicate" : "Imported"}: ${row.title}`]);
      } catch (e: any) {
        failed += 1;
        setLog((l) => [...l, `Failed: ${url} — ${e.message}`]);
      }
    }
    setSummary({ imported, skipped, failed, total: targets.length });
    setRunning(false);
  };

  const toggleKind = (kind: string) => {
    setKinds((current) => current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind]);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Sitemap extractor</p>
        <h1 className="text-3xl font-display font-black">Post Importer</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          Paste any sitemap URL, fetch every product URL, visit each post page, extract details from HTML classes/meta/sections, exclude duplicate slugs, and publish in bulk.
        </p>
      </div>

      <section className="admin-panel-card space-y-4">
        <div className="grid lg:grid-cols-[1fr_auto_auto] gap-3">
          <label className="admin-field">
            <span>Sitemap URL</span>
            <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="https://creativeconor.com/sitemap.xml" />
          </label>
          <label className="admin-field">
            <span>Limit</span>
            <input type="number" value={limit} min={1} max={500} onChange={(e) => setLimit(parseInt(e.target.value) || 1)} />
          </label>
          <label className="admin-field justify-end pb-2">
            <span>Duplicate mode</span>
            <button type="button" onClick={() => setForce((v) => !v)} className={`h-11 px-4 rounded-xl border text-sm font-bold ${force ? "border-amber-300/50 bg-amber-300/10 text-amber-100" : "border-white/10 bg-white/[0.04] text-muted-foreground"}`}>
              {force ? "Overwrite existing" : "Skip duplicates"}
            </button>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {["games", "software", "apps", "console"].map((kind) => (
            <button key={kind} type="button" onClick={() => toggleKind(kind)} className={`px-3 h-9 rounded-full border text-sm font-bold capitalize ${kinds.includes(kind) ? "border-primary bg-primary/20 text-primary-light" : "border-white/10 bg-white/[0.04] text-muted-foreground"}`}>
              {kind}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => fetchSitemap.mutate()} disabled={fetchSitemap.isPending} className="h-11 px-5 rounded-2xl bg-secondary border border-border font-bold inline-flex items-center gap-2">
            <FileSearch size={18} /> {fetchSitemap.isPending ? "Fetching…" : "Fetch URLs"}
          </button>
          <button onClick={() => bulkImport.mutate()} disabled={bulkImport.isPending || kinds.length === 0} className="community-btn h-11 px-5 rounded-2xl text-white font-bold inline-flex items-center gap-2">
            <DownloadCloud size={18} /> {bulkImport.isPending ? "Bulk importing…" : "Bulk import from sitemap"}
          </button>
          {urls.length > 0 && (
            <button onClick={runSelectedImport} disabled={running} className="h-11 px-5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 font-bold inline-flex items-center gap-2">
              <RotateCcw size={18} /> {running ? "Importing selected…" : `Import fetched (${Math.min(limit, urls.length)})`}
            </button>
          )}
        </div>

        {(fetchSitemap.error || bulkImport.error) && <p className="text-destructive text-sm">{((fetchSitemap.error || bulkImport.error) as Error).message}</p>}
      </section>

      {summary && (
        <section className="grid sm:grid-cols-4 gap-3">
          <Summary icon={DownloadCloud} label="Total" value={summary.total} />
          <Summary icon={CheckCircle2} label="Imported" value={summary.imported} />
          <Summary icon={SkipForward} label="Skipped" value={summary.skipped} />
          <Summary icon={XCircle} label="Failed" value={summary.failed} />
        </section>
      )}

      <section className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
        <div className="admin-panel-card">
          <h2 className="font-bold mb-3">Import log</h2>
          <div className="h-96 overflow-auto rounded-xl bg-black/20 border border-white/10 p-3 text-sm font-mono text-muted-foreground">
            {log.length === 0 ? <p>Log will appear here…</p> : log.map((line, index) => <div key={index}>{line}</div>)}
          </div>
        </div>
        <div className="admin-panel-card">
          <h2 className="font-bold mb-3">Fetched URLs ({urls.length})</h2>
          <div className="h-96 overflow-auto space-y-2 text-xs">
            {urls.length === 0 ? <p className="text-muted-foreground">Fetch a sitemap to preview URLs.</p> : urls.slice(0, 250).map((url) => <p key={url} className="truncate rounded-lg bg-white/[0.04] border border-white/10 px-2 py-2">{url}</p>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: any) {
  return (
    <div className="admin-stat-card">
      <Icon size={20} className="text-primary" />
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-display font-black">{value}</p>
    </div>
  );
}
