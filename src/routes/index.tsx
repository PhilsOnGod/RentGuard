import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  Flag,
  Star,
  ArrowRight,
  MapPin,
  Bot,
  MessageSquare,
  Paperclip,
  BadgeCheck,
  AlertTriangle,
  Lock,
  Building2,
  Quote,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RentVerify NG — Verify before you pay" },
      {
        name: "description",
        content:
          "Search any Nigerian address, landlord or agent. See verified status, real tenant reviews, AI scam scoring and fraud reports before you transfer rent.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted by tenants across Lagos, Abuja & Port
              Harcourt
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Verify before you <span className="text-primary-glow">pay rent</span>.
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-2xl">
              Nigeria's first community verification platform for landlords, agents and rental
              properties. Stop rental scams before they cost you a year's rent.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.navigate({ to: "/search", search: { q } });
              }}
              className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl rounded-2xl bg-white/95 p-2 shadow-2xl"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by address, landlord, or agent name…"
                  className="border-0 shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground bg-transparent"
                />
              </div>
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                Verify now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 text-sm text-white/70">
              Try:{" "}
              <button
                onClick={() => router.navigate({ to: "/search", search: { q: "Lekki" } })}
                className="underline underline-offset-2"
              >
                Lekki
              </button>{" "}
              ·{" "}
              <button
                onClick={() => router.navigate({ to: "/search", search: { q: "Yaba" } })}
                className="underline underline-offset-2"
              >
                Yaba
              </button>{" "}
              ·{" "}
              <button
                onClick={() => router.navigate({ to: "/search", search: { q: "Wuse" } })}
                className="underline underline-offset-2"
              >
                Wuse
              </button>
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Your phone number stays private
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" /> Admin-reviewed evidence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" /> AI-powered scam detection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["10,000+", "Properties listed"],
            ["3,200+", "Verified landlords"],
            ["₦4.8B", "Estimated fraud prevented"],
            ["36", "States covered"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">{v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            How RentVerify protects you
          </h2>
          <p className="mt-3 text-muted-foreground">Three steps between you and a rental scam.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Search,
              title: "1. Search",
              text: "Look up any address, landlord or agent before paying a kobo.",
            },
            {
              Icon: Star,
              title: "2. Read real reviews",
              text: "Past tenants rate landlords and properties — no fake testimonials.",
            },
            {
              Icon: Flag,
              title: "3. Report fraud",
              text: "Spotted a scam? File a report; admins review and flag it publicly.",
            },
          ].map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">
              Everything in one place
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
              Built end-to-end for safer renting
            </h2>
            <p className="mt-3 text-muted-foreground">
              From discovery to inspection day, every feature is designed to keep scammers out and
              tenants informed.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: MapPin,
                title: "Interactive map search",
                text: "Filter by state and city, see verification status pinned on the map before you visit.",
                to: "/search",
              },
              {
                Icon: Bot,
                title: "AI scam-risk scoring",
                text: "Paste any listing description and get a 0–100 risk score with highlighted red-flag quotes.",
                to: "/risk-check",
              },
              {
                Icon: MessageSquare,
                title: "Anonymous in-app chat",
                text: "Message owners and agents without sharing your phone number until you're ready.",
                to: "/messages",
              },
              {
                Icon: Paperclip,
                title: "Attach screenshots & receipts",
                text: "Share evidence inside chat threads — admins can review suspicious payment requests.",
                to: "/messages",
              },
              {
                Icon: BadgeCheck,
                title: "Verified badges",
                text: "Properties and landlords reviewed by our moderation team get a public Verified badge.",
                to: "/search",
              },
              {
                Icon: Flag,
                title: "Community fraud reports",
                text: "Crowdsourced scam reports with admin moderation surface bad actors fast.",
                to: "/dashboard",
              },
            ].map(({ Icon, title, text, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RED FLAGS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> Spot a scam in seconds
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">
              7 red flags every Nigerian renter should know
            </h2>
            <p className="mt-3 text-muted-foreground">
              Most rental fraud follows the same script. If a listing or "agent" hits two or more of
              these, walk away — and report them on RentVerify so the next person doesn't lose their
              money.
            </p>
            <Link to="/risk-check" className="mt-6 inline-flex">
              <Button size="lg" variant="outline">
                <Bot className="mr-2 h-4 w-4" /> Run a free AI scam check
              </Button>
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              "Rent is 40%+ below market for the area",
              "Demands full payment before physical inspection",
              "Refuses video call or insists on WhatsApp-only contact",
              'Address is vague: "behind the filling station"',
              "Photos appear on multiple unrelated listings",
              'Pressure tactics: "pay today or lose it"',
              "C of O or allocation papers won't be shown until payment",
            ].map((flag, i) => (
              <li
                key={flag}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive font-display text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Tenants who didn't get scammed
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real outcomes from people who checked before they paid.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "The 'agent' wanted ₦1.2M before I'd even seen the flat. RentVerify already had three scam reports on his number. I dodged it.",
                name: "Chiamaka O.",
                role: "Tenant, Lekki",
              },
              {
                quote:
                  "I run a small agency in Abuja. Getting the Verified badge doubled the calls I get from serious tenants in two weeks.",
                name: "Bashir A.",
                role: "Agent, Wuse II",
              },
              {
                quote:
                  "Pasted the listing into the AI scam check and it flagged five red phrases instantly. Saved my sister a year's rent.",
                name: "Tunde O.",
                role: "Tenant, Yaba",
              },
            ].map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-background p-6">
                <Quote className="h-6 w-6 text-primary/40" />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-display font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Built for everyone in the rental chain
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you're searching, listing or moderating — RentVerify has a place for you.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Search,
              title: "Tenants",
              text: "Search, verify and chat with owners safely. Leave honest reviews after move-in.",
              cta: "Start searching",
              to: "/search",
            },
            {
              Icon: Building2,
              title: "Landlords & agents",
              text: "Get verified, earn the trust badge, and reach renters who actually pay.",
              cta: "List a property",
              to: "/submit",
            },
            {
              Icon: ShieldCheck,
              title: "Admins & community",
              text: "Help moderate reports and protect the community from repeat offenders.",
              cta: "Sign in",
              to: "/auth",
            },
          ].map(({ Icon, title, text, cta, to }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{text}</p>
              <Link
                to={to}
                className="mt-5 text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                {cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Frequently asked</h2>
            <p className="mt-3 text-muted-foreground">The questions tenants ask us most.</p>
          </div>
          <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
            {[
              {
                q: "Is RentVerify free to use?",
                a: "Yes. Searching properties, reading reviews, running an AI scam check and reporting fraud are completely free for tenants.",
              },
              {
                q: "How does a property get the Verified badge?",
                a: "Landlords or agents submit ownership/agency proof. Our admin team reviews documents and flags ID before approving the badge.",
              },
              {
                q: "Will my phone number be shown to landlords?",
                a: "No. In-app chat lets you talk to owners and agents anonymously. You only share contact details when you're comfortable.",
              },
              {
                q: "What if I get scammed despite using RentVerify?",
                a: "File a report with screenshots and receipts. Admins investigate, flag the listing publicly and can escalate repeat offenders to the EFCC.",
              },
              {
                q: "Which cities are supported?",
                a: "All 36 states. Lagos, Abuja, Port Harcourt, Ibadan and Kano have the deepest coverage today.",
              },
            ].map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium">
                  <span>{item.q}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-lg leading-none group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold">Are you a landlord or agent?</h2>
            <p className="mt-2 text-white/80 max-w-xl">
              List your verified properties to build trust with tenants and stand out from scammers.
            </p>
          </div>
          <Link to="/submit">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Users className="mr-2 h-4 w-4" /> List a property
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
