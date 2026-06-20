import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert, XCircle, CheckCircle2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatDate, formatNaira } from "@/lib/format";

type AdminProperty = {
  id: string;
  status: "pending" | "flagged" | "verified" | "rejected";
  address: string;
  city: string;
  state: string;
  annual_rent_naira: number | null;
  created_at: string;
  landlord_name: string | null;
  agent_name: string | null;
};

type AdminReport = {
  readonly id: string;
  readonly status: "open" | "reviewing" | "resolved" | "dismissed";
  readonly reason: string;
  readonly description: string | null;
  readonly property_id: string | null;
  readonly created_at: string;
  readonly admin_notes: string | null;
  readonly reporter_id: string;
  readonly updated_at: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · RentVerify NG" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading, isAdmin, roles } = useAuth();
  const navigate = useNavigate();
  const [props, setProps] = useState<AdminProperty[]>([]);
  const [reps, setReps] = useState<AdminReport[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  async function refresh() {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setProps(p ?? []);
    setReps(r ?? []);
    setBusy(false);
  }
  useEffect(() => {
    if (isAdmin) refresh();
    else setBusy(false);
  }, [isAdmin]);

  if (loading || !user) return null;

  if (!isAdmin) {
    return (
      <Shell>
        <div className="py-20 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Your account doesn't have admin privileges. Current roles: {roles.join(", ") || "none"}.
          </p>
          <Link to="/dashboard">
            <Button className="mt-6">Back to dashboard</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  async function updateStatus(id: string, status: "verified" | "flagged" | "rejected" | "pending") {
    const patch: {
      status: string;
      verified_at?: string;
      verified_by?: string;
    } = { status };
    if (status === "verified") {
      patch.verified_at = new Date().toISOString();
      patch.verified_by = user!.id;
    }
    const { error } = await supabase
      .from("properties")
      .update(patch as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    refresh();
  }
  async function updateReport(id: string, status: "reviewing" | "resolved" | "dismissed") {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Report ${status}`);
    refresh();
  }

  const pending = props.filter((p) => p.status === "pending");
  const flagged = props.filter((p) => p.status === "flagged");
  const verified = props.filter((p) => p.status === "verified");
  const openReports = reps.filter((r) => r.status === "open" || r.status === "reviewing");

  return (
    <Shell>
      <div className="mx-auto max-w-6xl w-full px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review submissions, flagged properties and fraud reports.
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Pending review" value={pending.length} tone="warning" />
          <Stat label="Verified" value={verified.length} tone="success" />
          <Stat label="Flagged" value={flagged.length} tone="destructive" />
          <Stat label="Open reports" value={openReports.length} tone="default" />
        </div>

        {busy ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="mt-8">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="flagged">Flagged ({flagged.length})</TabsTrigger>
              <TabsTrigger value="reports">Reports ({openReports.length})</TabsTrigger>
              <TabsTrigger value="all">All properties</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {pending.length === 0 ? (
                <Empty msg="Nothing pending. 🎉" />
              ) : (
                pending.map((p) => (
                  <PropertyRow
                    key={p.id}
                    p={p}
                    onAction={updateStatus}
                    actions={["verified", "flagged", "rejected"]}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="flagged" className="space-y-3">
              {flagged.length === 0 ? (
                <Empty msg="No flagged properties." />
              ) : (
                flagged.map((p) => (
                  <PropertyRow
                    key={p.id}
                    p={p}
                    onAction={updateStatus}
                    actions={["verified", "rejected", "pending"]}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="reports" className="space-y-3">
              {openReports.length === 0 ? (
                <Empty msg="No open reports." />
              ) : (
                openReports.map((r) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-medium">{r.reason}</p>
                        {r.description && (
                          <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(r.created_at)} · status: {r.status}
                        </p>
                        {r.property_id && (
                          <Link
                            to="/properties/$id"
                            params={{ id: r.property_id }}
                            className="text-xs text-primary underline mt-1 inline-block"
                          >
                            View property →
                          </Link>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {r.status !== "reviewing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReport(r.id, "reviewing")}
                          >
                            Reviewing
                          </Button>
                        )}
                        <Button size="sm" onClick={() => updateReport(r.id, "resolved")}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateReport(r.id, "dismissed")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
            <TabsContent value="all" className="space-y-3">
              {props.map((p) => (
                <PropertyRow
                  key={p.id}
                  p={p}
                  onAction={updateStatus}
                  actions={["verified", "flagged", "rejected", "pending"]}
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: number;
  readonly tone: "warning" | "success" | "destructive" | "default";
}) {
  const cls = {
    warning: "bg-warning/10 text-warning-foreground border-warning/30",
    success: "bg-success/10 text-success border-success/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    default: "bg-secondary border-border",
  }[tone];
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Empty({ msg }: { readonly msg: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{msg}</p>;
}

function PropertyRow({
  p,
  onAction,
  actions,
}: {
  readonly p: AdminProperty;
  readonly onAction: (id: string, s: "verified" | "flagged" | "rejected" | "pending") => void;
  readonly actions: string[];
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/properties/$id"
              params={{ id: p.id }}
              className="font-medium hover:underline"
            >
              {p.address}
            </Link>
            <VerifiedBadge status={p.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {p.city}, {p.state} · {formatNaira(p.annual_rent_naira)}/yr · submitted{" "}
            {formatDate(p.created_at)}
          </p>
          {(p.landlord_name || p.agent_name) && (
            <p className="text-xs text-muted-foreground mt-1">
              {p.landlord_name && `Landlord: ${p.landlord_name}`}
              {p.landlord_name && p.agent_name && " · "}
              {p.agent_name && `Agent: ${p.agent_name}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.includes("verified") && (
            <Button size="sm" onClick={() => onAction(p.id, "verified")}>
              <ShieldCheck className="h-4 w-4 mr-1" />
              Verify
            </Button>
          )}
          {actions.includes("flagged") && (
            <Button size="sm" variant="destructive" onClick={() => onAction(p.id, "flagged")}>
              Flag
            </Button>
          )}
          {actions.includes("rejected") && (
            <Button size="sm" variant="ghost" onClick={() => onAction(p.id, "rejected")}>
              Reject
            </Button>
          )}
          {actions.includes("pending") && (
            <Button size="sm" variant="outline" onClick={() => onAction(p.id, "pending")}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
