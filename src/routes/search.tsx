import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Search as SearchIcon, MapPin, Bed, Loader2, Map as MapIcon, List } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import { PropertyMap, type MapPin as Pin } from "@/components/property-map";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
  state: z.string().optional().catch(""),
  city: z.string().optional().catch(""),
  view: z.enum(["list", "map"]).optional().catch("list"),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Search & verify · RentVerify NG" }] }),
  component: SearchPage,
});

type Row = {
  id: string;
  address: string;
  city: string;
  state: string;
  property_type: string;
  bedrooms: number | null;
  annual_rent_naira: number | null;
  status: "pending" | "verified" | "flagged" | "rejected";
  landlord_name: string | null;
  agent_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

function SearchPage() {
  const { q = "", state = "", city = "", view = "list" } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  const [results, setResults] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTerm(q);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const t = q.trim();
    let builder = supabase
      .from("properties")
      .select(
        "id,address,city,state,property_type,bedrooms,annual_rent_naira,status,landlord_name,agent_name,latitude,longitude",
      )
      .order("status", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100);
    if (state) builder = builder.eq("state", state);
    if (city) builder = builder.eq("city", city);
    const finalQuery = t
      ? builder.or(
          `address.ilike.%${t}%,city.ilike.%${t}%,state.ilike.%${t}%,landlord_name.ilike.%${t}%,agent_name.ilike.%${t}%`,
        )
      : builder;
    finalQuery.then(({ data, error }) => {
      if (!error) setResults((data ?? []) as Row[]);
      setLoading(false);
    });
  }, [q, state, city]);

  // Build state/city options from current results (works well for our dataset)
  const states = useMemo(
    () => Array.from(new Set(results.map((r) => r.state).filter(Boolean))).sort(),
    [results],
  );
  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          results
            .filter((r) => !state || r.state === state)
            .map((r) => r.city)
            .filter(Boolean),
        ),
      ).sort(),
    [results, state],
  );

  function setSearch(
    next: Partial<{ q: string; state: string; city: string; view: "list" | "map" }>,
  ) {
    navigate({ to: "/search", search: { q, state, city, view, ...next } });
  }

  const pins: Pin[] = results
    .filter((r) => r.latitude != null && r.longitude != null)
    .map((r) => ({
      id: r.id,
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      title: r.address,
      subtitle: `${r.city}, ${r.state}${r.annual_rent_naira ? ` · ${formatNaira(r.annual_rent_naira)}/yr` : ""}`,
      status: r.status,
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Search the registry</h1>
          <p className="mt-2 text-white/80">
            Filter by state and city, switch between list and map.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch({ q: term });
            }}
            className="mt-6 flex gap-2 rounded-2xl bg-white p-2 shadow-lg max-w-2xl"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Lekki Phase 1, Mr. Adeyemi, FastHomes Realty"
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            value={state}
            onChange={(e) => setSearch({ state: e.target.value, city: "" })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setSearch({ city: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            disabled={cities.length === 0}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {(state || city || q) && (
            <button
              onClick={() => navigate({ to: "/search", search: { view } })}
              className="text-xs text-muted-foreground underline"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto inline-flex rounded-md border border-border bg-card p-1">
            <button
              onClick={() => setSearch({ view: "list" })}
              className={`px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setSearch({ view: "map" })}
              className={`px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Searching…"
              : `${results.length} result${results.length === 1 ? "" : "s"}${q ? ` for "${q}"` : ""}`}
            {view === "map" && pins.length < results.length && ` · ${pins.length} mapped`}
          </p>
          <Link to="/submit">
            <Button variant="outline" size="sm">
              + Add a property
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : view === "map" ? (
          pins.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <MapIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                No mapped properties match your filters.
              </p>
            </div>
          ) : (
            <div>
              <PropertyMap pins={pins} height={520} />
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <Legend color="#10B981" label="Verified" />
                <Legend color="#F59E0B" label="Pending" />
                <Legend color="#EF4444" label="Flagged" />
              </div>
            </div>
          )
        ) : results.length === 0 ? (
          <EmptyState q={q} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <Link
                key={r.id}
                to="/properties/$id"
                params={{ id: r.id }}
                className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">{r.address}</h3>
                  <VerifiedBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {r.city}, {r.state}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-md bg-secondary px-2 py-0.5 capitalize">
                    {r.property_type.replace("_", " ")}
                  </span>
                  {r.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" />
                      {r.bedrooms} bed
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-primary">
                    {formatNaira(r.annual_rent_naira)}
                    <span className="text-xs font-normal text-muted-foreground">/yr</span>
                  </span>
                </div>
                {(r.landlord_name || r.agent_name) && (
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {r.landlord_name ? `Landlord: ${r.landlord_name}` : `Agent: ${r.agent_name}`}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-full border-2 border-white shadow"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
      <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <h3 className="mt-4 font-display text-xl font-semibold">No matches{q && ` for "${q}"`}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Be the first to add this property to the registry.
      </p>
      <Link to="/submit" className="mt-6 inline-block">
        <Button>List this property</Button>
      </Link>
    </div>
  );
}
