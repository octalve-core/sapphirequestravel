-- Sapphire Quest package-workflow expansion, 2026-11.
-- Apply to the verified Sapphire Quest Neon production branch AFTER backup.
-- Additive only: no existing enquiries or travel packages are deleted/rewritten.
BEGIN;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS rating_score numeric(2,1);
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS rating_source text NOT NULL DEFAULT '';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='travel_packages_rating_integrity') THEN
  ALTER TABLE travel_packages ADD CONSTRAINT travel_packages_rating_integrity
   CHECK ((rating_score IS NULL AND rating_count=0 AND rating_source='')
    OR (rating_score IS NOT NULL AND rating_score BETWEEN 1 AND 5 AND rating_count>0 AND length(trim(rating_source))>=12));
 END IF;
END $$;

CREATE TABLE IF NOT EXISTS package_enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reference text NOT NULL UNIQUE,
 package_slug text NOT NULL,
 package_title text NOT NULL,
 destination text NOT NULL,
 price_snapshot numeric(14,2),
 currency text NOT NULL DEFAULT 'NGN',
 preferred_date date NOT NULL,
 departure_city text NOT NULL,
 adults smallint NOT NULL CHECK (adults BETWEEN 1 AND 20),
 children smallint NOT NULL DEFAULT 0 CHECK (children BETWEEN 0 AND 20),
 infants smallint NOT NULL DEFAULT 0 CHECK (infants BETWEEN 0 AND 20),
 name text NOT NULL,
 email text NOT NULL,
 phone text NOT NULL,
 notes text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'new'
   CHECK (status IN ('new','contacted','quoted','follow_up','confirmed','closed')),
 assigned_to uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT package_enquiries_travellers CHECK (adults+children+infants<=30 AND infants<=adults)
);
CREATE INDEX IF NOT EXISTS package_enquiries_created_idx ON package_enquiries(created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS package_enquiries_status_date_idx ON package_enquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS package_enquiries_package_date_idx ON package_enquiries(package_slug,created_at DESC);
CREATE INDEX IF NOT EXISTS package_enquiries_travel_date_idx ON package_enquiries(preferred_date);
CREATE INDEX IF NOT EXISTS package_enquiries_email_idx ON package_enquiries(lower(email));

CREATE TABLE IF NOT EXISTS package_enquiry_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 enquiry_id uuid NOT NULL REFERENCES package_enquiries(id) ON DELETE CASCADE,
 staff_id uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 event_type text NOT NULL CHECK (event_type IN ('created','status','note','assignment')),
 content text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS package_enquiry_events_enquiry_idx ON package_enquiry_events(enquiry_id,created_at DESC);
COMMIT;
