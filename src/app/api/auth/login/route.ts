import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { COOKIE_NAME } from "@/server/auth";
import { randomToken,tokenHash,consentOrigin,consumeRateLimit,requestIp } from "@/server/security";
export const runtime="nodejs";
const schema=z.object({email:z.string().email().max(200).transform(x=>x.trim().toLowerCase()),password:z.string().min(1).max(500)});
export async function POST(req:NextRequest){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid request origin"},{status:403});
 if(Number(req.headers.get("content-length")??0)>4096)return NextResponse.json({error:"Request too large"},{status:413});
 let x:unknown;try{x=await req.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
 const result=schema.safeParse(x);if(!result.success)return NextResponse.json({error:"Invalid email or password"},{status:401});
 try{
  if(await consumeRateLimit(`login:${result.data.email}:${requestIp(req)}`,7,15))return NextResponse.json({error:"Too many sign-in attempts. Try again later."},{status:429});
  const sql=db();const rows=await sql`SELECT id,password_hash FROM staff_users WHERE email=${result.data.email} AND active=true LIMIT 1`;
  const user=rows[0];if(!user||!(await compare(result.data.password,String(user.password_hash))))return NextResponse.json({error:"Invalid email or password"},{status:401});
  const token=randomToken();await sql`INSERT INTO staff_sessions(staff_id,token_hash,expires_at,user_agent) VALUES(${String(user.id)},${tokenHash(token)},now()+interval '7 days',${req.headers.get("user-agent")?.slice(0,255)??null})`;
  await sql`INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id) VALUES(${String(user.id)},'login','staff_session',${String(user.id)})`;
  const response=NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  response.cookies.set(COOKIE_NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:7*24*60*60});
  return response;
 }catch(e){console.error("Auth unavailable",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Sign-in service unavailable"},{status:503})}
}
