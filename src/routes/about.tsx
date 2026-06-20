import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShieldCheck, Flag, Star, Users } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How it works · RentVerify NG" },
      {
        name: "description",
        content:
          "How RentVerify NG verifies landlords, agents and rental properties to protect Nigerian tenants from fraud.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-hero-gradient text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold">How RentVerify NG works</h1>
            <p className="mt-4 text-white/85">
              A community-driven registry of verified landlords, agents and properties — backed by
              tenant reviews and admin review of fraud reports.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 space-y-10">
          {[
            {
              Icon: Search,
              title: "Search any address or person",
              body: "Look up a property, landlord or agent name. Verified entries carry a green badge; flagged ones carry a red badge so you know to be cautious.",
            },
            {
              Icon: Users,
              title: "Anyone can contribute",
              body: "Tenants, landlords and agents can submit a property. Admins review every submission before it's marked verified.",
            },
            {
              Icon: Star,
              title: "Real, evidence-based reviews",
              body: "Only signed-in users can review. Reviews are public, attached to the listing, and cover the property, the landlord, or the agent independently.",
            },
            {
              Icon: Flag,
              title: "Report scams in two clicks",
              body: "If you spot fraud, file a report. Our team reviews it; confirmed scams get publicly flagged so future tenants are warned.",
            },
            {
              Icon: ShieldCheck,
              title: "Stay safe",
              body: "Even with a verified badge — never pay rent without physically inspecting the property and confirming the landlord's identity with a government ID.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="mt-1 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center">
            <h3 className="font-display text-2xl font-bold">Ready to verify?</h3>
            <p className="mt-2 text-white/85">Search the registry or list your property.</p>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <Link to="/search">
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Search
                </Button>
              </Link>
              <Link to="/submit">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  List a property
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
