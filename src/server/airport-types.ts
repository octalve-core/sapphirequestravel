export type AirportSuggestion = {
  code: string;
  city: string;
  country: string;
  name?: string;
  scheduled?: boolean;
  rank?: number;
};
export type AirportResults = {
  results: AirportSuggestion[];
  source: "amadeus" | "directory" | "curated";
  live: boolean;
};
