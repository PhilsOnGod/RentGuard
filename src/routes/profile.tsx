import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · RentVerify NG" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", bio: "", avatar_url: "" });
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name,phone,bio,avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setForm({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            bio: data.bio ?? "",
            avatar_url: data.avatar_url ?? "",
          });
        setReady(true);
      });
  }, [user]);

  if (loading || !user || !ready) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-2xl w-full px-4 py-10 flex-1">
        <h1 className="font-display text-3xl font-bold">My profile</h1>
        <form
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
            setBusy(false);
            if (error) return toast.error(error.message);
            toast.success("Profile saved");
          }}
        >
          <div>
            <Label>Email</Label>
            <Input value={user.email ?? ""} disabled />
          </div>
          <div>
            <Label>Full name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234…"
            />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
