-- Sapphire Quest safe additive migration. RUN ON production / neondb in Neon SQL Editor.
-- Does not drop, truncate, or overwrite existing customer/staff/package data.
BEGIN;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS highlights text NOT NULL DEFAULT '';
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS price_amount numeric(14,2);
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS discount_percent smallint NOT NULL DEFAULT 0;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{"blocks":[]}'::jsonb;
CREATE INDEX IF NOT EXISTS travel_packages_status_updated_idx ON travel_packages(status,updated_at DESC);
-- Demonstration content stays PRIVATE (draft). No actual travel service or price is promised.
INSERT INTO travel_packages(title,slug,summary,destination,status,highlights,currency,features,details)
VALUES
 ('SAMPLE — Singapore City Discovery','sample-singapore-city-discovery','Demonstration itinerary for a Singapore travel enquiry. This listing must be reviewed and replaced with real arrangements before publication.','Singapore','draft','Sample package — not a live offer','NGN','["Customisable dates","Accommodation preferences","Flight enquiry support"]'::jsonb,'{"blocks":[{"kind":"heading","runs":[{"text":"What a tailored journey could include"}]},{"kind":"paragraph","runs":[{"text":"This is a demonstration listing for staff editing. Replace every detail with confirmed supplier information before publishing."}]}]}'::jsonb),
 ('SAMPLE — Dubai Business Visit','sample-dubai-business-visit','Demonstration corporate-trip package for internal content-management testing only.','Dubai, UAE','draft','Sample corporate travel request','NGN','["Conference travel coordination","Itinerary planning","Group enquiry support"]'::jsonb,'{"blocks":[{"kind":"paragraph","runs":[{"text":"Demo entry only. This does not represent inventory or a confirmed rate."}]}]}'::jsonb),
 ('SAMPLE — UK City Break','sample-uk-city-break','Demonstration UK city-break listing to test images, bullet lists, descriptions and discounts.','London, United Kingdom','draft','Example only — no confirmed travel arrangements','NGN','["Flexible dates","Visa guidance on request","Personalised quote"]'::jsonb,'{"blocks":[{"kind":"paragraph","runs":[{"text":"Replace these example details after arranging the genuine package."}]}]}'::jsonb)
ON CONFLICT(slug) DO NOTHING;
COMMIT;
