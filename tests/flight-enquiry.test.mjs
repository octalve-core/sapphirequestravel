import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('flight enquiry presents return, one-way and multi-city with a dedicated second step', () => {
 const ui = read('src/features/booking/components/enquiry-wizard.tsx');
 assert.match(ui, /"multi-city"/);
 assert.match(ui, /"one-way"/);
 assert.match(ui, /"return"/);
 assert.match(ui, /Flight class/);
 assert.match(ui, /directOnly/);
 assert.match(ui, /flexibleDates/);
 assert.match(ui, /Add another flight/);
 assert.match(ui, /PassengerPicker/);
 assert.match(ui, /Continue to personal details/);
 assert.match(ui, /flightRequest: service === "flight"/);
});

test('api stores all flight preferences in the agent-readable enquiry record', () => {
 const api = read('src/app/api/enquiries/route.ts');
 const schema = read('src/server/enquiry-schema.ts');
 assert.match(api, /enquiryNotes\(x\)/);
 assert.match(schema, /FLIGHT ENQUIRY/);
 assert.match(schema, /Direct only preference/);
 assert.match(schema, /returnDate/);
 assert.match(schema, /chronological order/);
 assert.match(schema, /flightRequestSchema/);
});

test('airport search uses a durable local dataset with an optional Amadeus adapter', () => {
 const search = read('src/server/airport-search.ts');
 const entries = JSON.parse(read('src/data/airport-directory.json'));
 assert.ok(entries.length >= 12);
 assert.ok(entries.some(x => x.code === 'ABV'));
 assert.match(search, /airport-directory\.json/);
 assert.match(search, /AMADEUS_CLIENT_ID/);
 assert.match(search, /directory/);
 assert.ok(existsSync(new URL('../scripts/refresh-airports.py', import.meta.url)));
 assert.match(read('.github/workflows/refresh-airports.yml'), /refresh-airports\.py/);
});

test('tours, visas and corporate requests have structured first-step fields and same contact step', () => {
 const wizard = read('src/features/booking/components/enquiry-wizard.tsx');
 const fields = read('src/features/booking/components/service-request-fields.tsx');
 const options = read('src/features/booking/lib/service-options.ts');
 const schema = read('src/server/enquiry-schema.ts');
 assert.match(wizard, /ServiceRequestFields/);
 assert.match(wizard, /Contact details/);
 assert.match(wizard, /serviceRequest: service === "corporate"/);
 assert.match(wizard, /<VisaRequestFields/);
 assert.match(wizard, /<TourRequestFields/);
 assert.match(wizard, /"\/api\/visa-enquiries"/);
 assert.match(wizard, /"\/api\/packages\/"\+encodeURIComponent\(tour\.slug\)/);
 assert.match(fields, /AirportCombobox/);
 assert.match(fields, /startDate/);
 assert.match(fields, /travellers/);
 assert.match(fields, /category/);
 for(const item of ['tourism','vacation','conference']) assert.ok(options.includes(item));
 assert.match(schema, /serviceRequestSchema/);
 assert.match(schema, /serviceFields\[v.service\]/);
 assert.match(read('src/app/api/enquiries/route.ts'), /\$\{x.travellers\}/);
});

test('booking layout uses compact controls and a separate swap column', () => {
 const ui = read('src/features/booking/components/enquiry-wizard.tsx');
 const css = read('src/app/globals.css');
 assert.match(css, /\.booking-input/);
 assert.match(ui, /grid-cols-\[minmax\(0,1fr\)_36px_minmax\(0,1fr\)\]/);
 assert.match(ui, /Direct flights and flexible dates are preferences, subject to availability/);
 assert.doesNotMatch(ui, /agent-assisted/);
 assert.doesNotMatch(ui, /not a confirmed booking/);
});

test('agent dashboard presents destination and planned date for non-flight enquiries', () => {
 const view = read('src/features/admin/components/enquiry-detail-view.tsx');
 const loader = read('src/features/admin/sections/enquiry-detail-section.tsx');
 assert.match(loader, /EnquiryDetailView/);
 assert.match(view, /Destination airport/);
 assert.match(view, /Preferred travel date/);
 assert.match(view, /Travel details and notes/);
});
