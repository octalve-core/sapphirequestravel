import { NextRequest,NextResponse } from "next/server";
import { db } from "@/server/db";
import { COOKIE_NAME } from "@/server/auth";
import { tokenHash,consentOrigin } from "@/server/security";
export const runtime="nodejs";
export async function POST(req:NextRequest){if(!consentOrigin(req))return NextResponse.json({error:"Invalid request origin"},{status:403});const token=req.cookies.get(COOKIE_NAME)?.value;if(token){try{const sql=db();await sql`UPDATE staff_sessions SET revoked_at=now() WHERE token_hash=${tokenHash(token)}`}catch(e){console.error("Failed to revoke session",e)}}const res=NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});res.cookies.set(COOKIE_NAME,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});return res}
