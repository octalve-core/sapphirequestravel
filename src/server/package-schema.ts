import { z } from "zod";
const run = z.object({ text: z.string().max(1200), bold: z.boolean().optional(), italic: z.boolean().optional() });
const block = z.object({ kind: z.enum(["paragraph", "heading", "bullet", "numbered"]), runs: z.array(run).max(30) });
const details = z.object({ blocks: z.array(block).max(70) }).superRefine((x, ctx) => {
  const chars=x.blocks.flatMap(b=>b.runs).reduce((t,r)=>t+r.text.length,0);
  if(chars>12000)ctx.addIssue({code:"custom",message:"Description must be under 12,000 characters"});
});
const image = z.string().trim().max(600).refine(value => {
  if (!value) return true;
  if (value.startsWith("/images/") || value.startsWith("/branding/")) return /^[a-zA-Z0-9/_-]+\.(png|webp|jpg|jpeg)$/.test(value);
  try { const url=new URL(value);return url.protocol==="https:" && Boolean(url.hostname); } catch {return false;}
}, "Image must be a valid https URL or site image");
export const packageSchema=z.object({
  title:z.string().trim().min(4).max(120),
  slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(130),
  destination:z.string().trim().min(2).max(100),
  summary:z.string().trim().max(750),
  highlights:z.string().trim().max(320),
  status:z.enum(["draft","published"]),
  priceAmount:z.union([z.number().finite().positive().max(999999999),z.null()]),
  currency:z.enum(["NGN","USD","GBP","EUR"]),
  discountPercent:z.number().int().min(0).max(90),
  features:z.array(z.string().trim().min(2).max(200)).max(20),
  images:z.array(image).max(5),
  ratingScore:z.number().min(1).max(5).multipleOf(0.1).nullable().default(null),
  ratingCount:z.number().int().min(0).max(1000000).default(0),
  ratingSource:z.string().trim().max(250).default(""),
  details,
}).superRefine((x,ctx)=>{
  if(x.status==="published" && x.summary.length<20)ctx.addIssue({code:"custom",message:"Published packages need a meaningful short summary"});
  if ((x.ratingScore===null && (x.ratingCount!==0 || x.ratingSource)) ||
      (x.ratingScore!==null && (x.ratingCount<1 || x.ratingSource.length<12)))
    ctx.addIssue({code:"custom",message:"Only publish ratings backed by genuine customer feedback, with a review count and evidence source",path:["ratingScore"]});
  if(x.priceAmount===null && x.discountPercent>0)ctx.addIssue({code:"custom",message:"Add a base price before applying a discount",path:["discountPercent"]});
});
export type PackageInput = z.infer<typeof packageSchema>;
export type PackageRecord = PackageInput & {id:string};
export const emptyPackage = (): PackageInput => ({title:"",slug:"",destination:"",summary:"",highlights:"",status:"draft",priceAmount:null,currency:"NGN",discountPercent:0,features:[],images:[],ratingScore:null,ratingCount:0,ratingSource:"",details:{blocks:[{kind:"paragraph",runs:[{text:""}]}]}});
