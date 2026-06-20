import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  status: "pending" | "verified" | "flagged" | "rejected";
};

const STATUS_COLOR: Record<MapPin["status"], string> = {
  verified: "#10B981",
  pending: "#F59E0B",
  flagged: "#EF4444",
  rejected: "#6B7280",
};

export function PropertyMap({
  pins,
  height = 480,
  onPinClick,
}: {
  pins: MapPin[];
  height?: number;
  onPinClick?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const layerRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView(
          [9.082, 8.6753],
          6,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapRef.current as any;

      // clear previous layer
      if (layerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (layerRef.current as any).remove();
      }
      const group = L.layerGroup().addTo(map);
      layerRef.current = group;

      const valid = pins.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      valid.forEach((p) => {
        const color = STATUS_COLOR[p.status];
        const icon = L.divIcon({
          className: "rv-pin",
          html: `<span style="display:inline-block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(group);
        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:180px">
            <div style="font-weight:600;margin-bottom:2px">${escapeHtml(p.title)}</div>
            ${p.subtitle ? `<div style="font-size:12px;color:#475569;margin-bottom:6px">${escapeHtml(p.subtitle)}</div>` : ""}
            <div style="font-size:11px;text-transform:capitalize;color:${color};font-weight:600">${p.status}</div>
            <a href="/properties/${p.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:#0B3D2E;text-decoration:underline">View details</a>
          </div>`,
        );
        if (onPinClick) marker.on("click", () => onPinClick(p.id));
      });

      if (valid.length > 0) {
        const bounds = L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.2), { maxZoom: 13 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pins, onPinClick]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapRef.current) (mapRef.current as any).remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-2xl overflow-hidden border border-border"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
