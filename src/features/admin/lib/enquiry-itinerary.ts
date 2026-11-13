/** Parse saved human-readable flight details without guessing missing data. */
export type FlightLeg = { number: number; origin: string; destination: string; date: string };
export type FlightDetails = {
  structured: boolean;
  journey: string | null; cabin: string | null;
  adults: number | null; children: number | null; infants: number | null;
  directOnly: boolean | null; flexibleDates: boolean | null;
  legs: FlightLeg[]; returnDate: string | null; message: string;
};
function capture(lines: string, key: string): string | null {
  const line = lines.split("\n").find(value => value.startsWith(key + ": "));
  return line?.slice(key.length + 2).trim() || null;
}
function bool(value: string | null): boolean | null {
  return value === "Yes" ? true : value === "No" ? false : null;
}
export function parseFlightDetails(
  service: string, notes: string | null,
  origin: string | null, destination: string | null,
  departureDate: string | null, returnDate: string | null,
): FlightDetails {
  const content = (notes || "").replace(/\r\n?/g, "\n");
  const structured = service === "flight" && content.startsWith("FLIGHT ENQUIRY — customer-selected details\n");
  if (!structured) return {
    structured: false, journey: null, cabin: null, adults: null,
    children: null, infants: null, directOnly: null, flexibleDates: null,
    legs: origin && destination ? [{ number: 1, origin, destination, date: departureDate || "" }] : [],
    returnDate: returnDate || null, message: content.trim(),
  };

  const divider = content.indexOf("\nCustomer message:");
  const data = divider < 0 ? content : content.slice(0, divider);
  const message = divider < 0 ? "" : content.slice(divider + "\nCustomer message:".length).trim();
  const passenger = capture(data, "Passengers")?.match(/^(\d+) adult\(s\), (\d+) child\(ren\), (\d+) infant\(s\)$/);
  const legs: FlightLeg[] = [];
  for (const match of data.matchAll(/^Flight (\d+): ([A-Z]{3}) → ([A-Z]{3}) \| (\d{4}-\d{2}-\d{2})$/gm)) {
    if (legs.length >= 5) break;
    legs.push({ number: Number(match[1]), origin: match[2], destination: match[3], date: match[4] });
  }
  return {
    structured: true, journey: capture(data, "Journey"), cabin: capture(data, "Cabin"),
    adults: passenger ? Number(passenger[1]) : null,
    children: passenger ? Number(passenger[2]) : null,
    infants: passenger ? Number(passenger[3]) : null,
    directOnly: bool(capture(data, "Direct only preference")),
    flexibleDates: bool(capture(data, "Flexible dates (±3 days)")),
    legs: legs.length ? legs : (origin && destination ? [{ number: 1, origin, destination, date: departureDate || "" }] : []),
    returnDate: capture(data, "Return date") || returnDate || null,
    message,
  };
}
