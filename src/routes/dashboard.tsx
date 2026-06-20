import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, PlusCircle, Flag, Home, Star, LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { VerifiedBadge } from "@/components/verified-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";

type DashProperty = {
  readonly id: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly status: "pending" | "flagged" | "verified" | "rejected";
  readonly annual_rent_naira: number | null;
};

type DashReview = {
  readonly id: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly target_type: string;
  readonly target_name: string;
  readonly created_at: string;
  readonly property_id: string | null;
};

type DashReport = {
  readonly id: string;
  readonly reason: string;
  readonly status: "open" | "reviewing" | "resolved" | "dismissed";
  readonly created_at: string;
  readonly property_id: string | null;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · RentVerify NG" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [props, setProps] = useState<DashProperty[]>([]);
  const [revs, setRevs] = useState<DashReview[]>([]);
  const [reps, setReps] = useState<DashReport[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false })
        .then((r) => r.data ?? []),
      supabase
        .from("reviews")
        .select("id,rating,comment,target_type,target_name,created_at,property_id")
        .eq("reviewer_id", user.id)
        .order("created_at", { ascending: false })
        .then((r) => r.data ?? []),
      supabase
        .from("reports")
        .select("id,reason,status,created_at,property_id")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false })
        .then((r) => r.data ?? []),
    ]).then(([p, r, rp]) => {
      setProps(p as DashProperty[]);
      setRevs(r as DashReview[]);
      setReps(rp as DashReport[]);
      setBusy(false);
    });
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-6xl w-full px-4 py-10 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {user.email} · {roles.length ? roles.join(", ") : "tenant"}
            </p>
          </div>
          <Link to="/submit">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              List a property
            </Button>
          </Link>
        </div>

        {busy ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <DashCard icon={Home} title="My listings" count={props.length}>
              {props.length === 0 ? (
                <Empty
                  msg="You haven't submitted a property yet."
                  cta="List a property"
                  to="/submit"
                />
              ) : (
                props.map((p) => (
                  <Link
                    key={p.id}
                    to="/properties/$id"
                    params={{ id: p.id }}
                    className="block rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm line-clamp-1">{p.address}</p>
                      <VerifiedBadge status={p.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.city}, {p.state} · {formatNaira(p.annual_rent_naira)}/yr
                    </p>
                  </Link>
                ))
              )}
            </DashCard>

            <DashCard icon={Star} title="My reviews" count={revs.length}>
              {revs.length === 0 ? (
                <Empty msg="No reviews yet." />
              ) : (
                revs.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase text-muted-foreground">
                        {r.target_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      ⭐ {r.rating}/5 · {r.target_name}
                    </p>
                    {r.comment && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.comment}</p>
                    )}
                  </div>
                ))
              )}
            </DashCard>

            <DashCard icon={Flag} title="My reports" count={reps.length}>
              {reps.length === 0 ? (
                <Empty msg="No reports filed." />
              ) : (
                reps.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium line-clamp-1">{r.reason}</p>
                      <span className="text-xs rounded-full bg-secondary px-2 py-0.5 capitalize">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(r.created_at)}</p>
                  </div>
                ))
              )}
            </DashCard>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function DashCard({
  icon: Icon,
  title,
  count,
  children,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly count: number;
  readonly children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </span>
          <span className="text-xs font-normal rounded-full bg-secondary px-2 py-0.5">{count}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">{children}</CardContent>
    </Card>
  );
}
function Empty({
  msg,
  cta,
  to,
}: {
  readonly msg: string;
  readonly cta?: string;
  readonly to?: string;
}) {
  return (
    <div className="text-center py-6 text-sm text-muted-foreground">
      <p>{msg}</p>
      {cta && to && (
        <Link to={to} className="text-primary underline mt-1 inline-block">
          {cta}
        </Link>
      )}
    </div>
  );
}
