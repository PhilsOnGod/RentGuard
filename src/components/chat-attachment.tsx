import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  path: string;
  name: string | null;
  type: string | null;
  size: number | null;
  mine: boolean;
};

export function ChatAttachment({ path, name, type, size, mine }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = (type ?? "").startsWith("image/");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.storage
        .from("chat-attachments")
        .createSignedUrl(path, 60 * 30);
      if (active) setUrl(data?.signedUrl ?? null);
    })();
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) {
    return (
      <div className="flex items-center gap-2 text-xs opacity-70">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading attachment…
      </div>
    );
  }

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={name ?? "attachment"}
          className="max-h-60 rounded-lg border border-border/40"
        />
      </a>
    );
  }

  const sizeKb = size ? `${Math.max(1, Math.round(size / 1024))} KB` : "";
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs underline-offset-2 hover:underline ${
        mine ? "bg-primary-foreground/15" : "bg-secondary"
      }`}
    >
      {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
      <span className="truncate max-w-[180px]">{name ?? "Attachment"}</span>
      {sizeKb && <span className="opacity-70">· {sizeKb}</span>}
    </a>
  );
}
