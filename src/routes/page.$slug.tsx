import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicPage } from "@/lib/site.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/page/$slug")({
  component: PagePublic,
});

function PagePublic() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPublicPage);
  const { data } = useQuery({ queryKey: ["page", slug], queryFn: () => fn({ data: { slug } }) });
  const p = data?.page;
  if (!p) return <div className="min-h-screen"><SiteHeader /><p className="p-12 text-center text-muted-foreground">Not found</p></div>;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {p.cover_image && <img src={p.cover_image} className="w-full rounded-2xl mb-6 max-h-96 object-cover" />}
        <h1 className="font-display text-3xl md:text-5xl font-black mb-6">{p.title}</h1>
        <article className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground/90">{p.content}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
