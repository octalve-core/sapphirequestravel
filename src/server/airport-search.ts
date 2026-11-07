import "server-only";
import snapshot from "@/data/airport-directory.json";
import { airports as curated } from "@/data/airports";
import type { AirportSuggestion, AirportResults } from "@/server/airport-types";

let tokenCache: { value: string; expiresAt: number } | null = null;
const allowed = /^[\p{L}\p{N} .,'()\-]{0,45}$/u;
const directory = snapshot as AirportSuggestion[];

function localSearch(q: string): AirportSuggestion[] {
  const query = q.trim().toLocaleLowerCase();
  const entries: AirportSuggestion[] = directory.length > 1000 ? directory : curated;
  if (!query) {
    const top = ["LOS", "ABV", "PHC", "KAN", "LHR", "LGW", "DXB", "DOH", "JFK", "SIN", "JNB", "ACC"];
    return top.map(code => entries.find(a => a.code === code) || curated.find(a => a.code === code)).filter((a): a is AirportSuggestion => Boolean(a));
  }
  return entries
    .map(a => {
      const code = a.code.toLowerCase();
      const city = a.city.toLowerCase();
      const name = (a.name || "").toLowerCase();
      const country = a.country.toLowerCase();
      let match = -1;
      if (code === query) match = 100;
      else if (code.startsWith(query)) match = 84;
      else if (city === query) match = 82;
      else if (city.startsWith(query)) match = 72;
      else if (name.startsWith(query)) match = 65;
      else if (city.includes(query)) match = 48;
      else if (name.includes(query)) match = 40;
      else if (country === query) match = 35;
      else if (country.startsWith(query) && query.length >= 3) match = 24;
      if (match < 0) return { a, score: -1 };
      return { a, score: match + Math.min(a.rank || 0, 9) };
    })
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.a.city.localeCompare(b.a.city))
    .slice(0, 15)
    .map(x => x.a);
}

async function getToken(api: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  const response = await fetch(`${api}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID || "",
      client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
    }),
    cache: "no-store", signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error("Airport provider authentication unavailable");
  const data: { access_token?: string; expires_in?: number } = await response.json();
  if (!data.access_token) throw new Error("Airport provider token missing");
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Math.max(60, (data.expires_in || 1800) - 90) * 1000 };
  return data.access_token;
}

export async function searchAirports(query: string): Promise<AirportResults> {
  const q = query.trim().slice(0, 45);
  const local = localSearch(allowed.test(q) ? q : "");
  const fallback: AirportResults = { results: local, source: directory.length > 1000 ? "directory" : "curated", live: false };
  if (!q || q.length < 2 || !allowed.test(q)) return fallback;
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) return fallback;
  const base = process.env.AMADEUS_ENVIRONMENT === "production" ? "https://api.amadeus.com" : "https://test.api.amadeus.com";
  try {
    const token = await getToken(base);
    const url = new URL(`${base}/v1/reference-data/locations`);
    url.searchParams.set("keyword", q); url.searchParams.set("subType", "AIRPORT"); url.searchParams.set("page[limit]", "12");
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(4500), next: { revalidate: 180 } });
    if (!response.ok) return fallback;
    const payload: { data?: Array<{ iataCode?: string; name?: string; address?: { cityName?: string; countryName?: string } }> } = await response.json();
    const matches = (payload.data || []).filter(a => /^[A-Z]{3}$/.test(a.iataCode || "")).map(a => ({
      code: a.iataCode!, city: a.address?.cityName || a.name || "Airport", country: a.address?.countryName || "", name: a.name || "",
    }));
    const seen = new Set<string>();
    const results = [...matches, ...local].filter(a => { if (seen.has(a.code)) return false; seen.add(a.code); return true; }).slice(0, 15);
    return { results, source: "amadeus", live: process.env.AMADEUS_ENVIRONMENT === "production" };
  } catch {
    return fallback;
  }
}
