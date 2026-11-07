import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
const url=process.env.DATABASE_URL;
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password=process.env.ADMIN_PASSWORD;
const name=process.env.ADMIN_NAME?.trim() || "Sapphire Quest Owner";
if(!url||!email||!password||password.length<16||!email.includes("@")){
 console.error("Set DATABASE_URL, ADMIN_EMAIL and a strong ADMIN_PASSWORD (16+ characters). Run db/schema.sql first.");process.exit(1)
}
const sql=neon(url);const existing=await sql`SELECT id FROM staff_users LIMIT 1`;
if(existing.length){console.error("Bootstrap denied: a staff account already exists. Use an audited admin user-management process.");process.exit(1)}
await sql`INSERT INTO staff_users(name,email,password_hash,role) VALUES(${name},${email},${await hash(password,12)},'owner')`;
console.log("First owner created. Unset ADMIN_PASSWORD and ADMIN_EMAIL from your shell.");
