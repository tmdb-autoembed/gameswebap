// Upload helper using freeimage.host (free image host, only URL stored in DB).
// API docs: https://freeimage.host/page/api
// Public API key is shareable; safe to keep in code.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FREEIMAGE_KEY = "6d207e02198a847aa98d0a2a901485a5";

const UploadInput = z.object({
  source: z.string().min(10).max(20_000_000), // base64 string OR remote URL
  fileName: z.string().max(200).optional(),
  folder: z.string().max(50).default("general"),
});

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UploadInput.parse(d))
  .handler(async ({ data, context }) => {
    const body = new URLSearchParams();
    body.set("key", FREEIMAGE_KEY);
    body.set("action", "upload");
    body.set("source", data.source);
    body.set("format", "json");

    const res = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || json?.status_code !== 200) {
      const msg = json?.error?.message ?? json?.status_txt ?? "Upload failed";
      throw new Error(msg);
    }
    const url: string = json.image?.url ?? json.image?.display_url;
    const thumb: string | undefined = json.image?.thumb?.url ?? json.image?.medium?.url;
    const size = Number(json.image?.size ?? 0);
    const mime = String(json.image?.mime ?? "image/jpeg");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("assets").insert({
      user_id: context.userId,
      file_name: data.fileName ?? json.image?.filename ?? "image",
      file_url: url,
      thumb_url: thumb ?? null,
      file_type: mime,
      file_size: size,
      folder: data.folder,
    });

    return { url, thumb };
  });
