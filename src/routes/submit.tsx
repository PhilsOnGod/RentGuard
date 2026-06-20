import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/lib/format";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "List a property · RentVerify NG" }] }),
  component: SubmitPage,
});

type PT =
  | "apartment"
  | "self_contain"
  | "duplex"
  | "bungalow"
  | "shop"
  | "office"
  | "land"
  | "other";

function SubmitPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "Lagos",
    lga: "",
    property_type: "apartment" as PT,
    bedrooms: "" as string,
    annual_rent_naira: "" as string,
    description: "",
    landlord_name: "",
    landlord_phone: "",
    agent_name: "",
    agent_phone: "",
  });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl w-full px-4 py-10 flex-1">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold">List a property for verification</h1>
        <p className="mt-2 text-muted-foreground">
          Submissions go through admin review before being marked verified.
        </p>

        <form
          className="mt-8 grid gap-6 rounded-2xl border border-border bg-card p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!form.address.trim() || !form.city.trim())
              return toast.error("Address and city are required");
            setBusy(true);
            const { data, error } = await supabase
              .from("properties")
              .insert({
                submitted_by: user.id,
                address: form.address.trim(),
                city: form.city.trim(),
                state: form.state,
                lga: form.lga.trim() || null,
                property_type: form.property_type,
                bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
                annual_rent_naira: form.annual_rent_naira ? parseInt(form.annual_rent_naira) : null,
                description: form.description.trim() || null,
                landlord_name: form.landlord_name.trim() || null,
                landlord_phone: form.landlord_phone.trim() || null,
                agent_name: form.agent_name.trim() || null,
                agent_phone: form.agent_phone.trim() || null,
              })
              .select("id")
              .single();
            setBusy(false);
            if (error) return toast.error(error.message);
            toast.success("Submitted! Pending admin review.");
            navigate({ to: "/properties/$id", params: { id: data.id } });
          }}
        >
          <Section title="Location">
            <Field label="Street address" required>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="12 Admiralty Way"
                required
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City / area" required>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Lekki Phase 1"
                  required
                />
              </Field>
              <Field label="State">
                <Select value={form.state} onValueChange={(v) => set("state", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {NIGERIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="LGA (optional)">
              <Input
                value={form.lga}
                onChange={(e) => set("lga", e.target.value)}
                placeholder="Eti-Osa"
              />
            </Field>
          </Section>

          <Section title="Property">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Type">
                <Select
                  value={form.property_type}
                  onValueChange={(v) => set("property_type", v as PT)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "apartment",
                      "self_contain",
                      "duplex",
                      "bungalow",
                      "shop",
                      "office",
                      "land",
                      "other",
                    ].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Bedrooms">
                <Input
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  placeholder="3"
                />
              </Field>
              <Field label="Annual rent (₦)">
                <Input
                  type="number"
                  min={0}
                  value={form.annual_rent_naira}
                  onChange={(e) => set("annual_rent_naira", e.target.value)}
                  placeholder="2500000"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Serviced apartment, 24/7 power, etc."
              />
            </Field>
          </Section>

          <Section title="Landlord & agent">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Landlord name">
                <Input
                  value={form.landlord_name}
                  onChange={(e) => set("landlord_name", e.target.value)}
                />
              </Field>
              <Field label="Landlord phone">
                <Input
                  value={form.landlord_phone}
                  onChange={(e) => set("landlord_phone", e.target.value)}
                />
              </Field>
              <Field label="Agent name">
                <Input
                  value={form.agent_name}
                  onChange={(e) => set("agent_name", e.target.value)}
                />
              </Field>
              <Field label="Agent phone">
                <Input
                  value={form.agent_phone}
                  onChange={(e) => set("agent_phone", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Button type="submit" size="lg" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit for verification
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  );
}
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
