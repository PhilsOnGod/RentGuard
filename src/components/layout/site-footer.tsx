import { Link } from "@tanstack/react-router";
import { Shield, Mail, Twitter, Instagram } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-gradient-to-b from-secondary/40 to-secondary/70">
      <div className="mx-auto max-w-6xl px-4 py-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </span>
            RentVerify <span className="text-primary">NG</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Nigeria's community-powered registry for landlords, agents and rental properties. Verify
            before you pay rent.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="mailto:hello@rentverify.ng"
              aria-label="Email"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background hover:bg-secondary transition"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background hover:bg-secondary transition"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background hover:bg-secondary transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <FooterCol
          title="Product"
          links={[
            { to: "/search", label: "Search & verify" },
            { to: "/risk-check", label: "AI scam check" },
            { to: "/submit", label: "List a property" },
            { to: "/messages", label: "Messages" },
          ]}
        />

        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "How it works" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/profile", label: "Your profile" },
          ]}
        />

        <div className="md:col-span-3">
          <div className="font-medium mb-3 text-sm">Stay safe</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Always inspect in person before paying.</li>
            <li>• Verify landlord ID against a government document.</li>
            <li>• Never pay rent to a personal account on day one.</li>
            <li>• Use in-app chat — don't share your phone first.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} RentVerify NG · Built to fight rental fraud in Nigeria.</p>
          <p className="flex items-center gap-3">
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <span aria-hidden>·</span>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <span aria-hidden>·</span>
            <Link to="/about" className="hover:text-foreground">
              Contact
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="md:col-span-2">
      <div className="font-medium mb-3 text-sm">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
