import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · RentVerify NG" }] }),
  component: MessagesLayout,
});

type ThreadRow = {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  subject: string | null;
  last_message_at: string;
  properties: { address: string; city: string; state: string } | null;
};

function MessagesLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function load() {
    if (!user) return;
    setBusy(true);
    const { data } = await supabase
      .from("conversations")
      .select(
        "id, property_id, tenant_id, owner_id, subject, last_message_at, properties(address, city, state)",
      )
      .or(`tenant_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    setThreads((data ?? []) as unknown as ThreadRow[]);
    setBusy(false);
  }
  useEffect(() => {
    if (user) load(); /* eslint-disable-next-line */
  }, [user?.id]);

  // realtime: refresh thread list when any conversation row changes
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("conversations-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () =>
        load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line
  }, [user?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-4 py-8 w-full">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Chat with landlords and agents without sharing your phone number.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border">
              Conversations
            </div>
            {busy ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No conversations yet. Open a property and click "Message owner" to start one.
                <Link to="/search" className="block mt-3 text-primary underline">
                  Browse properties
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/messages/$threadId"
                      params={{ threadId: t.id }}
                      activeProps={{ className: "bg-secondary" }}
                      className="block px-3 py-3 hover:bg-secondary/60 transition"
                    >
                      <div className="text-sm font-medium truncate">
                        {t.properties?.address ?? "Property"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.properties?.city}, {t.properties?.state}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(t.last_message_at)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="rounded-2xl border border-border bg-card min-h-[520px]">
            <Outlet />
          </section>
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3 mr-1" /> Back home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
