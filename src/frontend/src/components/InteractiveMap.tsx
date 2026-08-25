import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { getMapAddressFromBackend } from "../utils/adminStorage";

// Fix default marker icon paths under Vite/bundler.
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_ADDRESS = "5334 Lamm Rd, Wilson, NC 27893";
// Known coordinates for the default address (fallback when geocoding fails).
const DEFAULT_COORDS: [number, number] = [35.7248, -77.938];

interface NominatimResult {
  lat: string;
  lon: string;
}

async function geocodeAddress(address: string): Promise<[number, number]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address,
  )}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      // Nominatim requires a descriptive User-Agent.
      "User-Agent": "WaveWilsonChurch/1.0 (contact@wavewilsonchurch.org)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = (await res.json()) as NominatimResult[];
  if (!data || data.length === 0) throw new Error("No geocoding results");
  const { lat, lon } = data[0];
  const latitude = Number.parseFloat(lat);
  const longitude = Number.parseFloat(lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude))
    throw new Error("Invalid geocoding coordinates");
  return [latitude, longitude];
}

// Recenter the map when the pin position changes.
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [map, center[0], center[1]]);
  return null;
}

export default function InteractiveMap() {
  const [address, setAddress] = useState<string>(DEFAULT_ADDRESS);
  const [coords, setCoords] = useState<[number, number]>(DEFAULT_COORDS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved address from backend on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getMapAddressFromBackend();
        if (cancelled) return;
        setAddress(saved?.trim() ? saved : DEFAULT_ADDRESS);
      } catch {
        if (!cancelled) setAddress(DEFAULT_ADDRESS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Geocode whenever the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const result = await geocodeAddress(address);
        if (cancelled) return;
        setCoords(result);
      } catch {
        if (cancelled) return;
        // Fall back to known coordinates for the default address.
        setCoords(DEFAULT_COORDS);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const directionsHref = useMemo(
    () =>
      `https://www.openstreetmap.org/directions?from=&to=${encodeURIComponent(
        address,
      )}`,
    [address],
  );

  return (
    <div
      ref={containerRef}
      className="bg-cream-dark rounded-sm overflow-hidden shadow-warm border border-[var(--accent-yellow)]/30 hover:border-[var(--accent-yellow)] transition-colors sm:col-span-2 lg:col-span-1"
    >
      <div className="relative h-48 overflow-hidden bg-cream-dark">
        {loading ? (
          <div
            data-ocid="map.loading_state"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2 text-brown-mid">
              <svg
                className="animate-spin w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="font-body text-xs">Loading map…</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={coords}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ background: "var(--card)" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords}>
              <Recenter center={coords} />
            </Marker>
          </MapContainer>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-brown-mid mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-body font-semibold text-brown-dark text-sm">
              Wave Wilson Church
            </p>
            <p className="font-body text-xs text-brown-light break-words">
              {address}
            </p>
            {error && (
              <p
                data-ocid="map.error_state"
                className="font-body text-[10px] text-brown-light/70 mt-1"
              >
                Showing approximate location.
              </p>
            )}
          </div>
        </div>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="map.directions_link"
          className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-brown-dark bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)] px-3 py-1.5 rounded-sm hover:bg-[var(--accent-yellow-hover)] transition-colors"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}
