-- Sapphire Quest initial schema. Execute once in a dedicated Neon development branch.
-- Use a separate production branch/database and least-privilege app credentials.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
  email text NOT NULL UNIQUE, password_hash text NOT NULL,
  role text NOT NULL CHECK(role IN ('owner','manager','agent','viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS staff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), staff_id uuid NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
  user_agent text, last_used_at timestamptz
);
CREATE INDEX IF NOT EXISTS staff_sessions_staff_idx ON staff_sessions(staff_id,expires_at);
CREATE TABLE IF NOT EXISTS enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE,
 service text NOT NULL CHECK(service IN ('flight','visa','holiday','corporate')),
 name text NOT NULL, email text NOT NULL, phone text NOT NULL,
 origin text, destination text, departure_date date, return_date date,
 travellers integer NOT NULL DEFAULT 1 CHECK(travellers BETWEEN 1 AND 100),
 notes text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','quoted','awaiting_customer','confirmed','closed')),
 assigned_to uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_worklist_idx ON enquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_email_idx ON enquiries(lower(email),created_at DESC);
CREATE TABLE IF NOT EXISTS enquiry_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), enquiry_id uuid NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
 staff_id uuid REFERENCES staff_users(id) ON DELETE SET NULL, event_type text NOT NULL CHECK(event_type IN ('created','status','note','assignment')),
 content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiry_events_lookup_idx ON enquiry_events(enquiry_id,created_at DESC);
CREATE TABLE IF NOT EXISTS travel_packages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, slug text NOT NULL UNIQUE,
 summary text NOT NULL DEFAULT '', destination text NOT NULL DEFAULT '',
 hero_image text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_staff_id uuid REFERENCES staff_users(id) ON DELETE SET NULL,
 action text NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_time_idx ON audit_events(created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
 token_hash text NOT NULL, bucket_start timestamptz NOT NULL,
 hits integer NOT NULL DEFAULT 1, PRIMARY KEY(token_hash,bucket_start)
);
COMMIT;
