import "server-only";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { tokenHash } from "@/server/security";
export const COOKIE_NAME="sq_staff_session";
export type Staff={id:string,name:string,email:string,role:"owner"|"manager"|"agent"|"viewer"};
export async function currentStaff():Promise<Staff|null>{
 const jar=await cookies();const token=jar.get(COOKIE_NAME)?.value;
 if(!token||token.length>200||!process.env.DATABASE_URL)return null;
 try {const sql=db();const rows=await sql`SELECT u.id,u.name,u.email,u.role FROM staff_sessions s JOIN staff_users u ON u.id=s.staff_id WHERE s.token_hash=${tokenHash(token)} AND s.revoked_at IS NULL AND s.expires_at>now() AND u.active=true LIMIT 1`;const user=rows[0];if(!user)return null;return {id:String(user.id),name:String(user.name),email:String(user.email),role:user.role as Staff["role"]};}catch{return null}
}
export function canEdit(staff:Staff){return staff.role==="owner"||staff.role==="manager"||staff.role==="agent"}
export function canManage(staff:Staff){return staff.role==="owner"||staff.role==="manager"}
