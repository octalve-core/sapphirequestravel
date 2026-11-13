import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("package workflow migration is additive and separate from the travel enquiry table", () => {
  const migration = read("db/migrations/002_package_workflows.sql");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS package_enquiries/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS package_enquiry_events/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS rating_score/);
  assert.match(migration, /package_enquiries_status_date_idx/);
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE FROM|UPDATE enquiries)\b/i);
});
test("package enquiry form requires consent and validated traveller counts", () => {
  const source = read("src/server/package-enquiry-schema.ts");
  assert.match(source, /consent: z\.literal\(true\)/);
  assert.match(source, /infants > data\.adults/);
  assert.match(source, /realDate/);
  assert.match(source, /follow_up/);
});
