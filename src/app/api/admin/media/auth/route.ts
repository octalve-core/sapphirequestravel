import { NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { currentStaff, canManage } from "@/server/auth";
export const runtime="nodejs";
export async function GET() {
 const staff=await currentStaff();
 if(!staff||!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 const privateKey=process.env.IMAGEKIT_PRIVATE_KEY;
 const publicKey=process.env.IMAGEKIT_PUBLIC_KEY;
 if(!privateKey||!publicKey)return NextResponse.json({error:"Image uploads have not been connected. Use an image URL for now."},{status:503});
 const token=randomUUID();const expire=Math.floor(Date.now()/1000)+120;
 const signature=createHmac("sha1",privateKey).update(token+expire).digest("hex");
 return NextResponse.json({token,expire,signature,publicKey},{headers:{"Cache-Control":"no-store"}});
}
