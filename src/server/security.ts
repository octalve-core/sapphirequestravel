import "server-only";
import { createHmac, randomBytes, createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/server/db";
export function randomToken(){return randomBytes(32).toString("base64url")}
export function tokenHash(value:string){return createHash("sha256").update(value).digest("hex")}
export function consentOrigin(req:NextRequest){const origin=req.headers.get("origin");if(!origin)return false;try{return new URL(origin).host===req.nextUrl.host&&new URL(origin).protocol===req.nextUrl.protocol}catch{return false}}
export function fingerprint(value:string){const secret=process.env.RATE_LIMIT_SECRET;if(!secret||secret.length<32)throw new Error("RATE_LIMIT_SECRET must be at least 32 characters");return createHmac("sha256",secret).update(value).digest("hex")}
export async function consumeRateLimit(identity:string,maxHits:number,windowMinutes:number){
 const sql=db();const interval=Math.floor(Date.now()/(windowMinutes*60000))*(windowMinutes*60000);
 const start=new Date(interval).toISOString();const hash=fingerprint(identity);
 const rows=await sql`INSERT INTO rate_limit_buckets(token_hash,bucket_start,hits) VALUES (${hash},${start}::timestamptz,1)
 ON CONFLICT(token_hash,bucket_start) DO UPDATE SET hits=rate_limit_buckets.hits+1 RETURNING hits`;
 return Number(rows[0]?.hits??999)>maxHits;
}
export function requestIp(req:NextRequest){return req.headers.get("x-real-ip")??req.headers.get("x-vercel-forwarded-for")??"unresolved"}
