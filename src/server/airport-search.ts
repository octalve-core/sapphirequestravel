import "server-only";
import { airports } from "@/data/airports";
import type { AirportResults } from "@/server/airport-types";
let tokenCache: { value: string; expiresAt: number } | null = null;
const allowed = /^[a-zA-Z0-9 .,'()-]{1,40}$/;

async function getToken(api: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AMADEUS_CLIENT_ID || "",
    client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
  });
  const response = await fetch(`${api}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error("Airport provider authentication failed");
  const data: { access_token: string; expires_in?: number } = await response.json();
  if (!data.access_token) throw new Error("Airport provider token missing");
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Math.max(60, (data.expires_in || 1800) - 90) * 1000 };
  return data.access_token;
}

export async function searchAirports(query: string): Promise<AirportResults> {
  const q = query.trim().slice(0, 40);
  if (!q || !allowed.test(q)) return { results: airports.slice(0, 12), source: "curated", live: false };
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    const api = process.env.AMADEUS_ENVIRONMENT === "production" ? "https://api.amadeus.com" : "https://test.api.amadeus.com";
    try {
      const token = await getToken(api);
      const url = new URL(`${api}/v1/reference-data/locations`);
      url.searchParams.set("keyword", q);
      url.searchParams.set("subType", "AIRPORT");
      url.searchParams.set("page[limit]", "12");
      url.searchParams.set("view", "LIGHT");
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error("Airport provider unavailable");
      const data: { data?: { iataCode?: string; name?: string; address?: { cityName?: string; countryName?: string } }[] } = await response.json();
      const results = (data.data || []).filter(a => /^[A-Z]{3}$/.test(a.iataCode || "")).map(a => ({
        code: a.iataCode!, city: a.address?.cityName || a.name || "Airport", country: a.address?.countryName || "", name: a.name || "",
      }));
      return { results, source: "amadeus", live: process.env.AMADEUS_ENVIRONMENT === "production" };
    } catch {
      // Never claim full, current coverage when the provider is unavailable.
    }
  }
  const lower = q.toLowerCase();
  return { results: airports.filter(a => `${a.code} ${a.city} ${a.country}`.toLowerCase().includes(lower)).slice(0, 12), source: "curated", live: false };
}
