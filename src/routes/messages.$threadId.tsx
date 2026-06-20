import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Shield, ExternalLink, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAttachment } from "@/components/chat-attachment";

export const Route = createFileRoute("/messages/$threadId")({
  component: ThreadPage,
});

type Msg = {
  id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
};
type Thread = {
  id: string;
  tenant_id: string;
  owner_id: string;
  property_id: string;
  properties: { address: string; city: string; state: string } | null;
};

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|heic)|application\/pdf)$/i;
const MSG_COLS =
  "id, sender_id, body, created_at, attachment_path, attachment_name, attachment_type, attachment_size";

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const [{ data: t }, { data: m }] = await Promise.all([
        supabase
          .from("conversations")
          .select("id, tenant_id, owner_id, property_id, properties(address, city, state)")
          .eq("id", threadId)
          .maybeSingle(),
        supabase
          .from("messages")
          .select(MSG_COLS)
          .eq("conversation_id", threadId)
          .order("created_at", { ascending: true }),
      ]);
      if (!active) return;
      setThread(t as unknown as Thread);
      setMessages((m ?? []) as Msg[]);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    })();
    return () => {
      active = false;
    };
  }, [threadId]);

  useEffect(() => {
    const ch = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${threadId}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function pickFile(f: File | null) {
    if (!f) return setPendingFile(null);
    if (!ALLOWED.test(f.type)) return toast.error("Only images or PDFs are allowed");
    if (f.size > MAX_BYTES) return toast.error("File must be under 8 MB");
    setPendingFile(f);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if ((!body && !pendingFile) || !user) return;
    setSending(true);
    try {
      let attachment_path: string | null = null;
      let attachment_name: string | null = null;
      let attachment_type: string | null = null;
      let attachment_size: number | null = null;

      if (pendingFile) {
        const ext = pendingFile.name.split(".").pop() ?? "bin";
        const path = `${threadId}/${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("chat-attachments")
          .upload(path, pendingFile, { contentType: pendingFile.type, upsert: false });
        if (upErr) throw upErr;
        attachment_path = path;
        attachment_name = pendingFile.name;
        attachment_type = pendingFile.type;
        attachment_size = pendingFile.size;
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: threadId,
        sender_id: user.id,
        body: body || null,
        attachment_path,
        attachment_name,
        attachment_type,
        attachment_size,
      });
      if (error) throw error;
      setDraft("");
      setPendingFile(null);
      if (fileRef.current) fileRef.current.value = "";
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  if (loading)
    return (
      <div className="h-full grid place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  if (!thread)
    return <div className="p-6 text-sm text-muted-foreground">Conversation not found.</div>;

  const otherIsOwner = user?.id === thread.tenant_id;
  const otherLabel = otherIsOwner ? "Owner / Agent" : "Tenant";

  return (
    <div className="flex flex-col h-[600px]">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{thread.properties?.address}</div>
          <div className="text-xs text-muted-foreground truncate">
            {thread.properties?.city}, {thread.properties?.state} · Chatting with {otherLabel}
          </div>
        </div>
        <Link
          to="/properties/$id"
          params={{ id: thread.property_id }}
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          View property <ExternalLink className="h-3 w-3" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-secondary/20">
        <div className="flex items-start gap-2 rounded-md bg-warning/10 text-warning text-xs p-2 border border-warning/30">
          <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Never send rent payments to a personal account on day one. Always inspect in person and
            verify ID. Attach receipts or suspicious screenshots here so admins can review.
          </span>
        </div>
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet — say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm space-y-2 ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}
              >
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                {m.attachment_path && (
                  <ChatAttachment
                    path={m.attachment_path}
                    name={m.attachment_name}
                    type={m.attachment_type}
                    size={m.attachment_size}
                    mine={mine}
                  />
                )}
                <p
                  className={`mt-0.5 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t border-border p-3 space-y-2 bg-card">
        {pendingFile && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-2 py-1.5 text-xs">
            <span className="truncate">
              📎 {pendingFile.name} · {Math.round(pendingFile.size / 1024)} KB
            </span>
            <button
              type="button"
              onClick={() => pickFile(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove attachment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileRef.current?.click()}
            disabled={sending}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            maxLength={4000}
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || (draft.trim().length === 0 && !pendingFile)}
            size="icon"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
