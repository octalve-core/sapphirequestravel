export type AirportSuggestion = { code: string; city: string; country: string; name?: string };
export type AirportResults = { results: AirportSuggestion[]; source: "amadeus" | "curated"; live: boolean };
