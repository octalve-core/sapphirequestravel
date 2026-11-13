-- Additive visa enquiry tables. Apply to verified Sapphire Quest Neon branch after backup.
BEGIN;
CREATE TABLE IF NOT EXISTS visa_enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE,
 country_code char(2) NOT NULL, country_name text NOT NULL, city text NOT NULL,
 visa_type text NOT NULL, travel_purpose text NOT NULL,
 intended_travel_date date NOT NULL, travellers smallint NOT NULL CHECK (travellers BETWEEN 1 AND 30),
 name text NOT NULL, email text NOT NULL, phone text NOT NULL, notes text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','follow_up','confirmed','closed')),
 assigned_to uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS visa_enquiries_created_idx ON visa_enquiries(created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS visa_enquiries_status_idx ON visa_enquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS visa_enquiries_country_idx ON visa_enquiries(country_code,created_at DESC);
CREATE INDEX IF NOT EXISTS visa_enquiries_date_idx ON visa_enquiries(intended_travel_date);
CREATE INDEX IF NOT EXISTS visa_enquiries_email_idx ON visa_enquiries(lower(email));
CREATE TABLE IF NOT EXISTS visa_enquiry_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 enquiry_id uuid NOT NULL REFERENCES visa_enquiries(id) ON DELETE CASCADE,
 staff_id uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 event_type text NOT NULL CHECK(event_type IN ('created','status','note','assignment')),
 content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS visa_enquiry_events_item_idx ON visa_enquiry_events(enquiry_id,created_at DESC);
COMMIT;
