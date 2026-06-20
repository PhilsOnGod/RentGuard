import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Bed,
  Phone,
  User as UserIcon,
  Loader2,
  Flag,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { VerifiedBadge } from "@/components/verified-badge";
import { StarRating } from "@/components/star-rating";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatNaira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/properties/$id")({
  component: PropertyPage,
});

type Prop = {
  id: string;
  address: string;
  city: string;
  state: string;
  lga: string | null;
  property_type: string;
  bedrooms: number | null;
  annual_rent_naira: number | null;
  description: string | null;
  landlord_name: string | null;
  landlord_phone: string | null;
  agent_name: string | null;
  agent_phone: string | null;
  status: "pending" | "verified" | "flagged" | "rejected";
  verified_at: string | null;
  created_at: string;
  submitted_by: string;
  latitude: number | null;
  longitude: number | null;
};
type Review = {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  target_type: string;
  target_name: string;
  created_at: string;
};

function PropertyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prop, setProp] = useState<Prop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("reviews")
        .select("*")
        .eq("property_id", id)
        .order("created_at", { ascending: false }),
    ]);
    setProp(p as Prop | null);
    setReviews((r ?? []) as Review[]);
    setLoading(false);
  }
  useEffect(() => {
    refresh(); /* eslint-disable-next-line */
  }, [id]);

  if (loading)
    return (
      <PageShell>
        <div className="py-20 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  if (!prop)
    return (
      <PageShell>
        <div className="py-20 text-center">
          <p>Property not found.</p>
          <Link to="/search" className="text-primary underline mt-2 inline-block">
            Back to search
          </Link>
        </div>
      </PageShell>
    );

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 w-full">
        <Link
          to="/search"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
        </Link>

        <div className="mt-4 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">{prop.address}</h1>
                  <p className="mt-1 text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {prop.city}, {prop.state}
                    {prop.lga && ` · ${prop.lga}`}
                  </p>
                </div>
                <VerifiedBadge status={prop.status} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="rounded-md bg-secondary px-2 py-1 capitalize">
                  {prop.property_type.replace("_", " ")}
                </span>
                {prop.bedrooms != null && (
                  <span className="inline-flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {prop.bedrooms} bedrooms
                  </span>
                )}
                <span className="ml-auto font-display text-2xl font-bold text-primary">
                  {formatNaira(prop.annual_rent_naira)}
                  <span className="text-xs font-normal text-muted-foreground">/year</span>
                </span>
              </div>
              {prop.description && (
                <p className="mt-5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {prop.description}
                </p>
              )}
              {prop.status === "verified" && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-success mt-0.5" />
                  <p>Verified by RentVerify NG on {formatDate(prop.verified_at)}.</p>
                </div>
              )}
              {prop.status === "flagged" && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <Flag className="h-4 w-4 mt-0.5" /> This property has been flagged. Do extra due
                  diligence before paying.
                </div>
              )}
            </div>

            <ReviewsSection
              reviews={reviews}
              avg={avg}
              user={user}
              propertyId={prop.id}
              landlordName={prop.landlord_name}
              agentName={prop.agent_name}
              onChange={refresh}
            />
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact on record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {prop.landlord_name && (
                  <div>
                    <div className="text-xs text-muted-foreground">Landlord</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {prop.landlord_name}
                    </div>
                    {prop.landlord_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {prop.landlord_phone}
                      </div>
                    )}
                  </div>
                )}
                {prop.agent_name && (
                  <div>
                    <div className="text-xs text-muted-foreground">Agent</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {prop.agent_name}
                    </div>
                    {prop.agent_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {prop.agent_phone}
                      </div>
                    )}
                  </div>
                )}
                {!prop.landlord_name && !prop.agent_name && (
                  <p className="text-muted-foreground">No contact submitted.</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  ⚠️ Never pay before inspecting and verifying ID in person.
                </p>
              </CardContent>
            </Card>

            <MessageOwnerCard user={user} prop={prop} />
            <ReportDialog user={user} propertyId={prop.id} />
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function ReviewsSection({
  reviews,
  avg,
  user,
  propertyId,
  landlordName,
  agentName,
  onChange,
}: {
  reviews: Review[];
  avg: number;
  user: ReturnType<typeof useAuth>["user"];
  propertyId: string;
  landlordName: string | null;
  agentName: string | null;
  onChange: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [target, setTarget] = useState<"property" | "landlord" | "agent">("property");
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} />
            <span className="text-sm font-medium">
              {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {user ? (
        <form
          className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const targetName =
              target === "property"
                ? "this property"
                : target === "landlord"
                  ? landlordName || "the landlord"
                  : agentName || "the agent";
            setBusy(true);
            const { error } = await supabase.from("reviews").insert({
              reviewer_id: user.id,
              property_id: propertyId,
              target_type: target,
              target_name: targetName,
              rating,
              comment: comment.trim() || null,
            });
            setBusy(false);
            if (error) return toast.error(error.message);
            toast.success("Review posted");
            setComment("");
            setRating(5);
            onChange();
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm">
              Rating: <StarRating value={rating} onChange={setRating} size={20} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(["property", "landlord", "agent"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTarget(t)}
                  className={`rounded-md px-2 py-1 capitalize border ${target === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}
                >
                  Review {t}
                </button>
              ))}
            </div>
          </div>
          <Label htmlFor="cmt" className="sr-only">
            Comment
          </Label>
          <Textarea
            id="cmt"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your honest experience…"
          />
          <Button type="submit" disabled={busy} size="sm">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Post review
          </Button>
        </form>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary font-medium underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-4 last:border-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {r.target_type}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportDialog({
  user,
  propertyId,
}: {
  user: ReturnType<typeof useAuth>["user"];
  propertyId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Flag className="mr-2 h-4 w-4" />
          Report this listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report fraud or scam</DialogTitle>
        </DialogHeader>
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary underline">
              Sign in
            </Link>{" "}
            to file a report.
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reason.trim()) return toast.error("Tell us the reason");
              setBusy(true);
              const { error } = await supabase.from("reports").insert({
                reporter_id: user.id,
                property_id: propertyId,
                reason: reason.trim(),
                description: description.trim() || null,
              });
              setBusy(false);
              if (error) return toast.error(error.message);
              toast.success("Report submitted. Our team will review.");
              setOpen(false);
              setReason("");
              setDescription("");
            }}
          >
            <div>
              <Label htmlFor="r-reason">Reason</Label>
              <Input
                id="r-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Fake landlord, duplicate listing, asking for payment without inspection"
                required
              />
            </div>
            <div>
              <Label htmlFor="r-desc">Details (optional)</Label>
              <Textarea
                id="r-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? Include dates, amounts, contact details if possible."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MessageOwnerCard({
  user,
  prop,
}: {
  user: ReturnType<typeof useAuth>["user"];
  prop: Prop;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const isOwn = user?.id === prop.submitted_by;

  async function startChat() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (isOwn) {
      navigate({ to: "/messages" });
      return;
    }
    setBusy(true);
    // Try to find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("property_id", prop.id)
      .eq("tenant_id", user.id)
      .maybeSingle();
    let id = existing?.id as string | undefined;
    if (!id) {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          property_id: prop.id,
          tenant_id: user.id,
          owner_id: prop.submitted_by,
          subject: prop.address,
        })
        .select("id")
        .single();
      setBusy(false);
      if (error) return toast.error(error.message);
      id = created.id;
    } else {
      setBusy(false);
    }
    navigate({ to: "/messages/$threadId", params: { threadId: id! } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> In-app chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Ask questions, request inspection, or verify details — without sharing your phone number.
        </p>
        <Button onClick={startChat} disabled={busy} className="w-full">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          {isOwn ? "Go to messages" : "Message owner"}
        </Button>
      </CardContent>
    </Card>
  );
}
