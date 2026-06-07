import { useServerFn } from "@tanstack/react-start";
import { uploadImage } from "@/lib/upload.functions";
import { useState } from "react";

export function useImageUpload() {
  const fn = useServerFn(uploadImage);
  const [busy, setBusy] = useState(false);
  const upload = async (file: File, folder = "community"): Promise<string> => {
    setBusy(true);
    try {
      // freeimage.host accepts base64 (no data: prefix) up to ~32MB
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const res = await fn({ data: { source: base64, fileName: file.name, folder } });
      return res.url;
    } finally {
      setBusy(false);
    }
  };
  return { upload, busy };
}
