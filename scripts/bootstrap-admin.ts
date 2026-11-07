import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";

/**
 * Provision the first staff owner from a trusted local terminal.
 * Never pass credentials as command arguments or commit them to source.
 */
async function main(): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();

  if (
    !url ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 16 ||
    !name ||
    name.length < 3 ||
    name.length > 120 ||
    /(?:env:|remove-item|erroraction)/i.test(name)
  ) {
    console.error(
      "Set DATABASE_URL, ADMIN_NAME (a real person's name), ADMIN_EMAIL, and ADMIN_PASSWORD (16+ characters). Run db/schema.sql first."
    );
    process.exitCode = 1;
    return;
  }

  const sql = neon(url);
  const existing = await sql`SELECT id FROM staff_users LIMIT 1`;
  if (existing.length > 0) {
    console.error(
      "Bootstrap denied: a staff account already exists. Use audited user-management processes instead."
    );
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hash(password, 12);
  const created = await sql`
    INSERT INTO staff_users (name, email, password_hash, role)
    SELECT ${name}, ${email}, ${passwordHash}, 'owner'
    WHERE NOT EXISTS (SELECT 1 FROM staff_users)
    RETURNING id
  `;
  if (created.length === 0) {
    console.error("Bootstrap denied: an administrator already exists.");
    process.exitCode = 1;
    return;
  }

  console.log("First owner created. Remove all temporary administrator credentials from your shell.");
}

void main().catch(() => {
  console.error(
    "Administrator bootstrap failed. Check the Neon connection string, permissions, and database schema."
  );
  process.exitCode = 1;
});
