import { strict as assert } from "node:assert";
import { parseFlightDetails } from "../src/features/admin/lib/enquiry-itinerary";

const raw=[
  "FLIGHT ENQUIRY — customer-selected details",
  "Journey: Multi-city",
  "Cabin: First Class",
  "Passengers: 1 adult(s), 0 child(ren), 0 infant(s)",
  "Direct only preference: No",
  "Flexible dates (±3 days): Yes",
  "Flight 1: ABV → LOS | 2026-11-14",
  "Flight 2: LOS → DOH | 2026-11-14",
  "Flight 3: DOH → DXB | 2026-11-17",
  "Flight 4: DXB → ABV | 2026-11-20",
  "",
  "Customer message:",
  "Please confirm the timetable before I book.",
].join("\n");
const flight=parseFlightDetails("flight",raw,"ABV","LOS","2026-11-14",null);
assert.equal(flight.structured,true);
assert.equal(flight.journey,"Multi-city");
assert.equal(flight.cabin,"First Class");
assert.equal(flight.adults,1);
assert.equal(flight.children,0);
assert.equal(flight.infants,0);
assert.equal(flight.directOnly,false);
assert.equal(flight.flexibleDates,true);
assert.equal(flight.legs.length,4);
assert.deepEqual(flight.legs[2],{number:3,origin:"DOH",destination:"DXB",date:"2026-11-17"});
assert.equal(flight.message,"Please confirm the timetable before I book.");
const legacy=parseFlightDetails("flight","Need baggage allowance","ABV","LHR","2026-11-14",null);
assert.equal(legacy.structured,false);
assert.equal(legacy.legs.length,1);
assert.equal(legacy.legs[0].destination,"LHR");
assert.equal(legacy.cabin,null);
assert.equal(legacy.message,"Need baggage allowance");
const corporate=parseFlightDetails("corporate",raw,"ABV","LOS","2026-11-14",null);
assert.equal(corporate.structured,false);
assert.equal(corporate.message,raw);
console.log("Enquiry itinerary parser: structured flights, legacy fallback and non-flight isolation PASS.");
