import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Code2, Megaphone, Save, SearchCheck, Settings2, Globe, Link2, Wrench } from "lucide-react";
import { getSettings, adminSaveSetting } from "@/lib/menu.functions";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

type Tab = "identity" | "general" | "seo" | "social" | "code" | "ads";

const tabs = [
  { id: "identity", label: "Site Identity", icon: Settings2 },
  { id: "general", label: "General", icon: Globe },
  { id: "seo", label: "SEO & Meta", icon: SearchCheck },
  { id: "social", label: "Social Links", icon: Link2 },
  { id: "code", label: "Header/Footer Codes", icon: Code2 },
  { id: "ads", label: "Ads Management", icon: Megaphone },
] as const;

function SettingsPage() {
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(adminSaveSetting);
  const { data, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => getFn({}) });
  const [active, setActive] = useState<Tab>("identity");
  const [site, setSite] = useState({ title: "", tagline: "", logoUrl: "", faviconUrl: "" });
  const [general, setGeneral] = useState({ siteUrl: "", adminEmail: "", language: "en", timezone: "UTC" });
  const [seo, setSeo] = useState({ metaDescription: "", keywords: "", googleAnalyticsId: "" });
  const [social, setSocial] = useState({ twitter: "", facebook: "", youtube: "", discord: "", instagram: "" });
  const [codes, setCodes] = useState({ headerCode: "", footerCode: "" });
  const [ads, setAds] = useState({ headerAd: "", sidebarAd: "", inContentAd: "" });

  useEffect(() => {
    if (data?.settings) {
      setSite(data.settings.site ?? { title: "", tagline: "", logoUrl: "", faviconUrl: "" });
      setGeneral(data.settings.general ?? { siteUrl: "", adminEmail: "", language: "en", timezone: "UTC" });
      setSeo(data.settings.seo ?? { metaDescription: "", keywords: "", googleAnalyticsId: "" });
      setSocial(data.settings.social ?? { twitter: "", facebook: "", youtube: "", discord: "", instagram: "" });
      setCodes(data.settings.codes ?? { headerCode: "", footerCode: "" });
      setAds(data.settings.ads ?? { headerAd: "", sidebarAd: "", inContentAd: "" });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await saveFn({ data: { key: "site", value: site } });
      await saveFn({ data: { key: "seo", value: seo } });
      await saveFn({ data: { key: "codes", value: codes } });
      await saveFn({ data: { key: "ads", value: ads } });
    },
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary">Settings</p>
        <h1 className="text-3xl font-display font-black">Website configuration</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage identity, SEO, injected code, and ads from one tabbed settings panel.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActive(tab.id)} className={`settings-tab ${active === tab.id ? "settings-tab-active" : ""}`}><Icon size={17} /> {tab.label}</button>;
        })}
      </div>

      <section className="admin-panel-card">
        {active === "identity" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Site Title" value={site.title} onChange={(title) => setSite({ ...site, title })} />
            <Field label="Tagline" value={site.tagline} onChange={(tagline) => setSite({ ...site, tagline })} />
            <Field label="Logo URL" value={site.logoUrl} onChange={(logoUrl) => setSite({ ...site, logoUrl })} />
            <Field label="Favicon URL" value={site.faviconUrl} onChange={(faviconUrl) => setSite({ ...site, faviconUrl })} />
          </div>
        )}

        {active === "seo" && (
          <div className="grid gap-4">
            <TextArea label="Meta Description" value={seo.metaDescription} onChange={(metaDescription) => setSeo({ ...seo, metaDescription })} rows={4} />
            <Field label="Keywords" value={seo.keywords} onChange={(keywords) => setSeo({ ...seo, keywords })} />
            <Field label="Google Analytics ID" value={seo.googleAnalyticsId} onChange={(googleAnalyticsId) => setSeo({ ...seo, googleAnalyticsId })} />
          </div>
        )}

        {active === "code" && (
          <div className="grid gap-4">
            <TextArea label="Header Code" value={codes.headerCode} onChange={(headerCode) => setCodes({ ...codes, headerCode })} rows={8} />
            <TextArea label="Footer Code" value={codes.footerCode} onChange={(footerCode) => setCodes({ ...codes, footerCode })} rows={8} />
          </div>
        )}

        {active === "ads" && (
          <div className="grid gap-4">
            <TextArea label="Header Ad" value={ads.headerAd} onChange={(headerAd) => setAds({ ...ads, headerAd })} rows={6} />
            <TextArea label="Sidebar Ad" value={ads.sidebarAd} onChange={(sidebarAd) => setAds({ ...ads, sidebarAd })} rows={6} />
            <TextArea label="In-Content Ad" value={ads.inContentAd} onChange={(inContentAd) => setAds({ ...ads, inContentAd })} rows={6} />
          </div>
        )}
      </section>

      <button onClick={() => save.mutate()} disabled={save.isPending} className="community-btn h-12 px-6 rounded-2xl text-white font-bold inline-flex items-center gap-2"><Save size={18} /> {save.isPending ? "Saving…" : "Save settings"}</button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="admin-field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return <label className="admin-field"><span>{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="min-h-32 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-sm outline-none focus:border-primary" /></label>;
}
