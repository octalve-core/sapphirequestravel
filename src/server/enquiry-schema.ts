import { z } from "zod";
import { serviceFields, serviceNames, selectionLabel, type OtherService } from "@/features/booking/lib/service-options";
import { validCountryCodes, countryName } from "@/data/countries";

function isRealISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const airport = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Please choose an airport from the suggestions");
const leg = z.object({ origin: airport, destination: airport, date: z.string().max(10) });
export const flightRequestSchema = z.object({
  journey: z.enum(["return", "one-way", "multi-city"]),
  cabinClass: z.enum(["economy", "premium-economy", "business", "first"]),
  passengers: z.object({ adults: z.number().int().min(1).max(9), children: z.number().int().min(0).max(8), infants: z.number().int().min(0).max(8) }),
  directOnly: z.boolean(),
  flexibleDates: z.boolean(),
  legs: z.array(leg).min(1).max(5),
  returnDate: z.string().max(10).default(""),
});
export type FlightRequest = z.infer<typeof flightRequestSchema>;
export const serviceRequestSchema = z.object({
  destination: z.string().trim().toUpperCase().regex(/^(?:[A-Z]{3})?$/, "Select an airport from the suggestions or leave it blank"),
  destinationCountryCode: z.string().trim().toUpperCase().max(2).default(""),
  destinationCity: z.string().trim().max(100).default(""),
  startDate: z.string().max(10),
  travellers: z.number().int().min(1).max(30),
  category: z.string().trim().min(2).max(50),
  organisation: z.string().trim().max(120).default(""),
});


export const enquirySchema = z.object({
  service: z.enum(["flight", "visa", "holiday", "corporate"]),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200).transform(x => x.toLowerCase()),
  phone: z.string().trim().min(7).max(30).regex(/^[0-9+()\s-]+$/),
  origin: z.string().trim().toUpperCase().max(3).optional().default(""),
  destination: z.string().trim().toUpperCase().max(3).optional().default(""),
  departureDate: z.string().max(10).optional().default(""),
  returnDate: z.string().max(10).optional().default(""),
  travellers: z.coerce.number().int().min(1).max(100).default(1),
  notes: z.string().trim().max(3000).default(""),
  website: z.string().max(200).optional().default(""),
  consent: z.literal(true),
  flightRequest: flightRequestSchema.optional(), // Legacy clients can still submit a simple itinerary.
  serviceRequest: serviceRequestSchema.optional(), // Structured visa, tour and corporate requests.
}).superRefine((v, ctx) => {
  const add = (message: string, path: (string | number)[]) => ctx.addIssue({ code: "custom", message, path });
  if (v.service !== "flight") {
    if (v.flightRequest) add("Flight details only apply to flight requests", ["flightRequest"]);
    const request = v.serviceRequest;
    if (request) {
      if (v.service === "corporate") {
        if (!validCountryCodes.has(request.destinationCountryCode))
          add("Select the destination country", ["serviceRequest", "destinationCountryCode"]);
        if (request.destinationCity.length < 2 ||
            !/^[\p{L}\p{M}\p{N} .,'-]{2,100}$/u.test(request.destinationCity))
          add("Enter a valid destination city", ["serviceRequest", "destinationCity"]);
      }
      const category = serviceFields[v.service].categories;
      if (!category.some(item => item.value === request.category)) add("Please select a valid travel purpose or style", ["serviceRequest", "category"]);
      if (!isRealISODate(request.startDate) || request.startDate < new Date().toISOString().slice(0, 10)) add("Please choose a valid future date", ["serviceRequest", "startDate"]);
      if (v.destination !== request.destination || v.departureDate !== request.startDate || v.travellers !== request.travellers) add("The submitted travel details do not match", ["serviceRequest"]);
      if (v.service !== "corporate" && request.organisation) add("Organisation is only available for corporate travel", ["serviceRequest", "organisation"]);
    } else if (v.service === "corporate") add("Complete the corporate travel details", ["serviceRequest"]);
    else if (v.notes.trim().length < 6) add("Please describe your travel requirements", ["notes"]);
    return;
  }
  if (v.serviceRequest) add("This service selection is not a flight request", ["serviceRequest"]);
  if (!/^[A-Z]{3}$/.test(v.origin) || !/^[A-Z]{3}$/.test(v.destination) || v.origin === v.destination) {
    add("Please select different departure and arrival airports", ["destination"]);
  }
  if (!isRealISODate(v.departureDate)) add("Please select a valid departure date", ["departureDate"]);
  if (v.departureDate && v.departureDate < new Date().toISOString().slice(0, 10)) add("Departure cannot be in the past", ["departureDate"]);
  if (v.returnDate && (!isRealISODate(v.returnDate) || v.returnDate < v.departureDate)) add("Return must be on or after departure", ["returnDate"]);
  const flight = v.flightRequest;
  if (!flight) return;
  const sum = flight.passengers.adults + flight.passengers.children + flight.passengers.infants;
  if (sum > 9 || flight.passengers.infants > flight.passengers.adults) add("Maximum nine passengers; each infant requires an adult", ["flightRequest", "passengers"]);
  if (v.travellers !== sum) add("Traveller count does not match the passengers selected", ["travellers"]);
  if (flight.journey === "multi-city" && flight.legs.length < 2) add("Multi-city requires at least two flights", ["flightRequest", "legs"]);
  if (flight.journey !== "multi-city" && flight.legs.length !== 1) add("This journey type requires one outbound flight", ["flightRequest", "legs"]);
  let previousDate = "";
  flight.legs.forEach((item, index) => {
    if (item.origin === item.destination) add(`Flight ${index + 1} must use different airports`, ["flightRequest", "legs", index]);
    if (!isRealISODate(item.date) || item.date < new Date().toISOString().slice(0, 10)) add(`Flight ${index + 1} requires a future date`, ["flightRequest", "legs", index, "date"]);
    if (previousDate && item.date < previousDate) add("Flights must be in chronological order", ["flightRequest", "legs", index, "date"]);
    previousDate = item.date;
  });
  const first = flight.legs[0];
  if (first && (first.origin !== v.origin || first.destination !== v.destination || first.date !== v.departureDate)) {
    add("First flight does not match the journey details", ["flightRequest", "legs", 0]);
  }
  if (flight.journey === "return") {
    if (!isRealISODate(flight.returnDate) || flight.returnDate < (first?.date || "")) add("Round trips require a valid return date", ["flightRequest", "returnDate"]);
    if (v.returnDate !== flight.returnDate) add("Return date does not match", ["returnDate"]);
  } else if (flight.returnDate || v.returnDate) add("Only round trips have a return date", ["returnDate"]);
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

/** Store readable itinerary details in the existing notes column.
 *  This is deployment-safe before any schema migration, and visible to all agents.
 */
export function enquiryNotes(x: EnquiryInput): string {
  if (x.service !== "flight") {
    if (!x.serviceRequest) return x.notes;
    const selection = x.serviceRequest;
    const service = x.service as OtherService;
    const lines = [
      `${serviceNames[service].toUpperCase()} ENQUIRY — customer-selected details`,
      ...(service === "corporate" ? [
        "Destination city: " + selection.destinationCity + ", " + countryName(selection.destinationCountryCode),
        "Preferred nearby airport: " + (selection.destination || "Travel team to advise"),
      ] : ["Destination airport: " + selection.destination]),
      `Preferred travel date: ${selection.startDate}`,
      `Travellers: ${selection.travellers}`,
      `${serviceFields[service].categoryLabel}: ${selectionLabel(service, selection.category)}`,
      ...(selection.organisation ? [`Organisation: ${selection.organisation}`] : []),
    ];
    if (x.notes) lines.push("", "Additional details:", x.notes);
    return lines.join("\n");
  }
  if (!x.flightRequest) return x.notes;
  const f = x.flightRequest;
  const cabin = { economy: "Economy", "premium-economy": "Premium Economy", business: "Business", first: "First Class" }[f.cabinClass];
  const lines = [
    "FLIGHT ENQUIRY — customer-selected details",
    `Journey: ${f.journey === "multi-city" ? "Multi-city" : f.journey === "return" ? "Round trip" : "One way"}`,
    `Cabin: ${cabin}`,
    `Passengers: ${f.passengers.adults} adult(s), ${f.passengers.children} child(ren), ${f.passengers.infants} infant(s)`,
    `Direct only preference: ${f.directOnly ? "Yes" : "No"}`,
    `Flexible dates (±3 days): ${f.flexibleDates ? "Yes" : "No"}`,
    ...f.legs.map((leg, index) => `Flight ${index + 1}: ${leg.origin} → ${leg.destination} | ${leg.date}`),
    ...(f.journey === "return" ? [`Return date: ${f.returnDate}`] : []),
  ];
  if (x.notes) lines.push("", "Customer message:", x.notes);
  return lines.join("\n");
}
