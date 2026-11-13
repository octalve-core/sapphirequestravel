import "server-only";
import directory from "@/data/airport-directory.json";
import { airports as curated } from "@/data/airports";
import type { AirportSuggestion } from "@/server/airport-types";

/** Resolve IATA city labels server-side; never send the directory to the client. */
const cities = new Map<string, AirportSuggestion>();
for (const entry of directory) {
  if (entry.code && entry.city && !cities.has(entry.code))
    cities.set(entry.code, entry);
}
for (const entry of curated) cities.set(entry.code, entry);

export function describeAirport(code: string | null | undefined): string {
  const normalized = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) return "Not specified";
  const match = cities.get(normalized);
  return match ? match.city + " (" + normalized + ")" : "Airport code " + normalized + " — city unavailable";
}
export function airportDisplay(code: string | null | undefined): {
  code: string; city: string; description: string; known: boolean;
} {
  const normalized = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized))
    return { code: "", city: "Not specified", description: "No airport selected", known: false };
  const found = cities.get(normalized);
  return {
    code: normalized, city: found?.city || "City unavailable",
    description: found ? (found.name || found.city) + " · " + found.country : "Location not in current airport directory",
    known: Boolean(found),
  };
}
