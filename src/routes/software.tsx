import { createFileRoute } from "@tanstack/react-router";
import { ArchivePage } from "./games.index";

export const Route = createFileRoute("/software")({
  head: () => ({ meta: [{ title: "Software — Creative Conor" }] }),
  component: () => <ArchivePage kind="software" title="Software" />,
});
