import { z } from "zod";
export const enquirySchema=z.object({
 service:z.enum(["flight","visa","holiday","corporate"]),
 name:z.string().trim().min(2).max(100),
 email:z.string().trim().email().max(200).transform(x=>x.toLowerCase()),
 phone:z.string().trim().min(7).max(30).regex(/^[0-9+()\s-]+$/),
 origin:z.string().trim().max(3).optional().default(""),
 destination:z.string().trim().max(3).optional().default(""),
 departureDate:z.string().max(10).optional().default(""),
 returnDate:z.string().max(10).optional().default(""),
 travellers:z.coerce.number().int().min(1).max(100).default(1),
 notes:z.string().trim().max(3000).default(""),
 website:z.string().max(200).optional().default(""),
 consent:z.literal(true)
}).superRefine((v,ctx)=>{
 if(v.service==="flight"){
 if(!/^[A-Z]{3}$/.test(v.origin)||!/^[A-Z]{3}$/.test(v.destination)||v.origin===v.destination)ctx.addIssue({code:"custom",message:"Please select different origin and destination airports",path:["destination"]});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.departureDate)||Number.isNaN(Date.parse(v.departureDate)))ctx.addIssue({code:"custom",message:"Departure date required",path:["departureDate"]});
 if(v.departureDate&&v.departureDate<new Date().toISOString().slice(0,10))ctx.addIssue({code:"custom",message:"Departure date must be in the future",path:["departureDate"]});
 if(v.returnDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.returnDate)||v.returnDate<v.departureDate))ctx.addIssue({code:"custom",message:"Return must be after departure",path:["returnDate"]});
 } else if(!v.notes||v.notes.length<6)ctx.addIssue({code:"custom",message:"Please describe your request",path:["notes"]});
});
export type EnquiryInput=z.infer<typeof enquirySchema>;
