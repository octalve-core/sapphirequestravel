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
  try { const url=new URL(value);return url.protocol==="https:" || url.protocol==="http:"; } catch {return false;}
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
  details,
}).superRefine((x,ctx)=>{
  if(x.status==="published" && x.summary.length<20)ctx.addIssue({code:"custom",message:"Published packages need a meaningful short summary"});
});
export type PackageInput = z.infer<typeof packageSchema>;
export type PackageRecord = PackageInput & {id:string};
export const emptyPackage = (): PackageInput => ({title:"",slug:"",destination:"",summary:"",highlights:"",status:"draft",priceAmount:null,currency:"NGN",discountPercent:0,features:[],images:[],details:{blocks:[{kind:"paragraph",runs:[{text:""}]}]}});
