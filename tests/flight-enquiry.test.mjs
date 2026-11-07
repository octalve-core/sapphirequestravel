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
