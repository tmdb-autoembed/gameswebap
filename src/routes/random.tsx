import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRandomPost } from "@/lib/posts.functions";

export const Route = createFileRoute("/random")({
  component: RandomRedirect,
});

function RandomRedirect() {
  const navigate = useNavigate();
  const fn = useServerFn(getRandomPost);
  useEffect(() => {
    fn({}).then((r) => {
      if (r.slug) navigate({ to: "/games/$slug", params: { slug: r.slug }, replace: true });
      else navigate({ to: "/", replace: true });
    });
  }, []);
  return <div className="min-h-screen flex items-center justify-center text-foreground">Finding a random post…</div>;
}
