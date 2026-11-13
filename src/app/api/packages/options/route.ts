import { NextResponse } from "next/server";
import { publicPackageCatalog } from "@/server/package-catalog";
export const runtime="nodejs";
export async function GET() {
  try {
    const rows=(await publicPackageCatalog()).filter(x=>x.status==="published").slice(0,100);
    return NextResponse.json({packages:rows.map(x=>({
      slug:x.slug,title:x.title,destination:x.destination,summary:x.summary,
      highlights:x.highlights,features:x.features.slice(0,7),
      image:x.images[0]||x.details.home?.image||"/images/hero-packages.webp",
      price:x.priceAmount==null?null:Math.round(x.priceAmount*(100-x.discountPercent)/100),
      currency:x.currency,
    }))},{headers:{"Cache-Control":"no-store"}});
  } catch {
    return NextResponse.json({error:"Packages are temporarily unavailable",packages:[]},{status:503});
  }
}
