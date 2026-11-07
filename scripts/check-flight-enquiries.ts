import { enquirySchema, enquiryNotes } from "../src/server/enquiry-schema";
import { strict as assert } from "node:assert";

const day = (ahead: number) => new Date(Date.now() + ahead * 86_400_000).toISOString().slice(0, 10);
const first = { origin: "ABV", destination: "LHR", date: day(14) };
const second = { origin: "LHR", destination: "JFK", date: day(19) };
const third = { origin: "JFK", destination: "LOS", date: day(24) };
const sample = {
  service: "flight", name: "Test Traveller", email: "traveller@example.org", phone: "+234 801 111 2222",
  origin: first.origin, destination: first.destination, departureDate: first.date,
  returnDate: "", travellers: 3, notes: "Need wheelchair access", consent: true,
  flightRequest: {
    journey: "multi-city", cabinClass: "premium-economy", passengers: { adults: 2, children: 1, infants: 0 },
    directOnly: true, flexibleDates: true, legs: [first, second, third], returnDate: "",
  },
} as const;

const valid = enquirySchema.safeParse(sample);
assert.equal(valid.success, true, JSON.stringify(!valid.success ? valid.error.issues : ""));
if (!valid.success) process.exit(1);
const note = enquiryNotes(valid.data);
for (const marker of ["Multi-city", "Premium Economy", "2 adult(s)", "Direct only preference: Yes", "Flight 3: JFK → LOS", "Need wheelchair access"]) {
  assert.ok(note.includes(marker), `Missing requested detail: ${marker}`);
}
const invalids = [
  { ...sample, flightRequest: { ...sample.flightRequest, legs: [first, { ...second, date: day(2) }] } },
  { ...sample, flightRequest: { ...sample.flightRequest, legs: [{ ...first, destination: first.origin }, second] } },
  { ...sample, flightRequest: { ...sample.flightRequest, passengers: { adults: 1, children: 1, infants: 2 } } },
  { ...sample, flightRequest: { ...sample.flightRequest, journey: "one-way" } },
  { ...sample, travellers: 7 },
];
for (const [index, candidate] of invalids.entries()) {
  assert.equal(enquirySchema.safeParse(candidate).success, false, `Invalid itinerary ${index + 1} must be rejected`);
}
const roundTrip = {
  ...sample, travellers: 1, returnDate: day(21),
  flightRequest: { ...sample.flightRequest, journey: "return", cabinClass: "economy", passengers: { adults: 1, children: 0, infants: 0 }, legs: [first], returnDate: day(21) },
};
assert.equal(enquirySchema.safeParse(roundTrip).success, true);
const oneWay = { ...roundTrip, returnDate: "", flightRequest: { ...roundTrip.flightRequest, journey: "one-way", returnDate: "" } };
assert.equal(enquirySchema.safeParse(oneWay).success, true);
console.log("Flight itinerary validation passed: multi-city, return, one-way, passenger limits and invalid routes.");
