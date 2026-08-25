import L from "leaflet";
import { AlertCircle, CheckCircle, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import {
  getMapAddressFromBackend,
  saveMapAddressToBackend,
} from "../../utils/adminStorage";

// Fix default leaflet marker icons (broken in bundlers without this workaround)
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

interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Recenter the map when the previewed coordinates change.
 * Kept as a child of MapContainer so it has access to the map instance.
 */
function Recenter({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function MapAddressManagement() {
  const [savedAddress, setSavedAddress] = useState<string>("");
  const [inputAddress, setInputAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [geocode, setGeocode] = useState<GeocodeResult | null>(null);

  // Load saved address on mount; fall back to default when empty.
  useEffect(() => {
    getMapAddressFromBackend()
      .then((addr) => {
        const effective =
          addr && addr.trim().length > 0 ? addr : DEFAULT_ADDRESS;
        setSavedAddress(effective);
        setInputAddress(effective);
        setLoading(false);
      })
      .catch(() => {
        setSavedAddress(DEFAULT_ADDRESS);
        setInputAddress(DEFAULT_ADDRESS);
        setLoading(false);
      });
  }, []);

  const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address,
    )}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent.
        "User-Agent": "OverflowOfJo-Admin/1.0 (caffeine.ai)",
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Geocoding request failed (${res.status}).`);
    }
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(
        "No matching location found. Try a more specific address.",
      );
    }
    const first = data[0];
    const lat = Number.parseFloat(first.lat);
    const lon = Number.parseFloat(first.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error("Geocoding returned invalid coordinates.");
    }
    return { lat, lon, displayName: first.display_name };
  };

  const handleSearch = async () => {
    const trimmed = inputAddress.trim();
    if (trimmed.length === 0) {
      setError("Enter an address to search.");
      setGeocode(null);
      return;
    }
    setError("");
    setSuccess("");
    setSearching(true);
    setGeocode(null);
    try {
      const result = await geocodeAddress(trimmed);
      setGeocode(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to geocode address.",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!geocode) {
      setError("Search and confirm a location before saving.");
      return;
    }
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await saveMapAddressToBackend(inputAddress.trim());
      setSavedAddress(inputAddress.trim());
      setSuccess("Map address saved.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setInputAddress(DEFAULT_ADDRESS);
    setGeocode(null);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-7 h-7 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">
          Loading map address…
        </span>
      </div>
    );
  }

  return (
    <section
      data-ocid="map_address.section"
      className="bg-admin-card border border-admin-border rounded-lg p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-md bg-admin-accent/15 border border-admin-accent/30 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4.5 h-4.5 text-admin-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-admin-text">
            Map Address
          </h3>
          <p className="text-xs text-admin-muted mt-0.5">
            Set the address shown on the public Find Us Online map. Search to
            preview the pin location, then save.
          </p>
        </div>
      </div>

      {/* Saved address line */}
      <div className="mb-4 text-xs text-admin-muted">
        Currently saved:{" "}
        <span className="text-admin-text font-medium">
          {savedAddress || DEFAULT_ADDRESS}
        </span>
      </div>

      {/* Address input + search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          data-ocid="map_address.input"
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Enter a street address, city, or place"
          className="flex-1 px-3 py-2 text-sm bg-admin-input border border-admin-border rounded-md text-admin-text placeholder:text-admin-muted focus:outline-none focus:border-admin-accent/60 focus:ring-1 focus:ring-admin-accent/40 transition-colors"
        />
        <div className="flex gap-2">
          <button
            data-ocid="map_address.search_button"
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-admin-accent text-admin-accent-text rounded-md hover:bg-admin-accent-hover disabled:opacity-50 transition-all"
          >
            {searching ? (
              <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            {searching ? "Searching…" : "Search"}
          </button>
          <button
            data-ocid="map_address.reset_button"
            type="button"
            onClick={handleResetDefault}
            disabled={searching || saving}
            className="px-3 py-2 text-sm border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-accent/50 rounded-md disabled:opacity-50 transition-all"
          >
            Default
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          data-ocid="map_address.error_state"
          className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 mb-3"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          data-ocid="map_address.success_state"
          className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2 mb-3"
        >
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Geocoded result + map preview */}
      {geocode && (
        <div className="mb-4">
          <div className="text-xs text-admin-muted mb-1">
            Resolved location:
          </div>
          <div className="text-sm text-admin-text font-medium mb-1">
            {geocode.displayName}
          </div>
          <div className="text-xs text-admin-muted font-mono mb-3">
            {geocode.lat.toFixed(6)}, {geocode.lon.toFixed(6)}
          </div>

          <div
            data-ocid="map_address.preview"
            className="w-full h-64 rounded-md overflow-hidden border border-admin-border bg-admin-input"
          >
            <MapContainer
              center={[geocode.lat, geocode.lon]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[geocode.lat, geocode.lon]}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold mb-0.5">Selected pin</div>
                    <div className="text-gray-700">{geocode.displayName}</div>
                  </div>
                </Popup>
              </Marker>
              <Recenter lat={geocode.lat} lon={geocode.lon} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Save action — disabled until a geocode has been confirmed */}
      <div className="flex items-center gap-3">
        <button
          data-ocid="map_address.save_button"
          type="button"
          onClick={handleSave}
          disabled={!geocode || saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-admin-accent text-admin-accent-text rounded-md hover:bg-admin-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          {saving ? "Saving…" : "Save Address"}
        </button>
        {!geocode && (
          <span className="text-xs text-admin-muted">
            Search and confirm a location before saving.
          </span>
        )}
      </div>
    </section>
  );
}
