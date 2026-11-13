import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("visa and tours remove unwanted technical and introductory copy while retaining provider credit", () => {
 const visa=read("src/features/booking/components/visa-request-fields.tsx");
 const tour=read("src/features/booking/components/tour-request-fields.tsx");
 const privacy=read("src/features/legal/sections/privacy-details.tsx");
 assert.doesNotMatch(visa,/Select a suggested city, or type the correct city/);
 assert.doesNotMatch(visa,/City suggestions:.*GeoDB Cities/);
 assert.doesNotMatch(tour,/Choose a published Sapphire Quest experience and personalise/);
 assert.match(visa,/CityField/);
 assert.match(tour,/Select a published package/);
 assert.match(privacy,/GeoDB Cities/);
 assert.match(privacy,/creativecommons\.org\/licenses\/by\/3\.0/);
});

test("location pin receives guaranteed CSS spacing in visa and airport inputs", () => {
 const styles=read("src/app/globals.css");
 const visa=read("src/features/booking/components/visa-request-fields.tsx");
 const airport=read("src/features/booking/components/airport-combobox.tsx");
 assert.match(styles,/\.booking-input\.booking-location \{ padding-left:46px/);
 assert.match(styles,/\.booking-input\.booking-airport \{ padding-left:43px/);
 assert.match(visa,/booking-input booking-location/);
 assert.match(airport,/booking-input booking-airport/);
 assert.match(airport,/aria-required=\{required\} required=\{required\}/);
 assert.match(airport,/onBlur=\{\(\) => \{ if \(!required && !value\) setSearch\(""\); \}\}/);
});

test("corporate requests capture a true city and country before an optional airport", () => {
 const fields=read("src/features/booking/components/service-request-fields.tsx");
 const wizard=read("src/features/booking/components/enquiry-wizard.tsx");
 const options=read("src/features/booking/lib/service-options.ts");
 assert.match(fields,/Destination country/);
 assert.match(fields,/Meeting \/ event city/);
 assert.match(fields,/CityField/);
 assert.match(fields,/Preferred nearby airport \(optional\)/);
 assert.match(fields,/required=\{false\}/);
 assert.match(fields,/destinationCity: city, destination: ""/);
 assert.match(options,/destinationCountryCode: string/);
 assert.match(options,/destinationCity: string/);
 assert.match(wizard,/validCountryCodes\.has\(x\.destinationCountryCode\)/);
 assert.match(wizard,/x\.destinationCity\.trim\(\)\.length < 2/);
 assert.match(wizard,/serviceRequest: service === "corporate"/);
 assert.match(wizard,/countryName\(other\.corporate\.destinationCountryCode\)/);
});

test("corporate server rejects missing or malformed destinations and keeps optional airport", () => {
 const schema=read("src/server/enquiry-schema.ts");
 const api=read("src/app/api/enquiries/route.ts");
 assert.match(schema,/validCountryCodes\.has\(request\.destinationCountryCode\)/);
 assert.match(schema,/request\.destinationCity\.length < 2/);
 assert.match(schema,/corporate"\) add\("Complete the corporate travel details"/);
 assert.match(schema,/Destination city: /);
 assert.match(schema,/Preferred nearby airport: /);
 assert.match(schema,/Travel team to advise/);
 assert.match(schema,/serviceRequestSchema/);
 assert.match(api,/consentOrigin\(req\)/);
 assert.match(api,/consumeRateLimit/);
 assert.match(api,/enquirySchema\.safeParse/);
 assert.match(api,/INSERT INTO enquiries/);
});

test("CEO attribution matches the requested display while preserving company narrative", () => {
 const source=read("src/features/about/sections/ceo-message.tsx");
 assert.match(source,/Sapphire Quest Travel &amp; Tour Ltd<\/p>/);
 assert.match(source,/Dr\. Aderonke A\. Akerele/);
 assert.match(source,/ceo-portrait\.webp/);
});

test("contact page is a spacious icon-led, accessible set of real contact links", () => {
 const ui=read("src/features/contact/sections/contact-options.tsx");
 assert.match(ui,/Mail, MessageCircle, PhoneCall/);
 assert.match(ui,/Instagram/);
 assert.match(ui,/mailto:/);
 assert.match(ui,/tel:/);
 assert.match(ui,/wa\.me\//);
 assert.match(ui,/noopener noreferrer/);
 assert.match(ui,/aria-labelledby="contact-methods-heading"/);
 assert.match(ui,/href="\/request"/);
 assert.doesNotMatch(ui,/placeholder@|example\.com|lorem/i);
});

test("affected marketing pages have canonical metadata, no weak origin change", () => {
 for (const [path,canonical] of [
   ["src/app/contact/page.tsx","/contact"],
   ["src/app/request/page.tsx","/request"],
   ["src/app/visa-assistance/page.tsx","/visa-assistance"],
   ["src/app/corporate-travel/page.tsx","/corporate-travel"],
   ["src/app/about/page.tsx","/about"],
 ]) {
   const source=read(path);
   assert.ok(source.includes('canonical:"'+canonical+'"')||source.includes('canonical: "'+canonical+'"'),path);
 }
 const c=read("next.config.ts");
 assert.match(c,/X-Content-Type-Options/);
 assert.match(c,/Strict-Transport-Security/);
 assert.match(c,/X-Permitted-Cross-Domain-Policies/);
});

test("public form keeps visa option labels out of the server-side Zod bundle", () => {
 const visa=read("src/features/booking/components/visa-request-fields.tsx");
 const wizard=read("src/features/booking/components/enquiry-wizard.tsx");
 const schema=read("src/server/visa-enquiry-schema.ts");
 const options=read("src/data/visa-options.ts");
 assert.match(visa,/data\/visa-options/);
 assert.match(wizard,/data\/visa-options/);
 assert.doesNotMatch(visa,/server\/visa-enquiry-schema/);
 assert.doesNotMatch(wizard,/server\/visa-enquiry-schema/);
 assert.match(schema,/import \{ visaTypes, visaPurposes \} from/);
 assert.match(options,/Visitor \/ Tourist/);
});
