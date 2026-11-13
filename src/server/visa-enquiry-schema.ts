import { z } from "zod";
import { validCountryCodes } from "@/data/countries";

export const visaTypes = [
  { value: "visitor", label: "Visitor / Tourist" },
  { value: "business", label: "Business" },
  { value: "student", label: "Study" },
  { value: "work", label: "Work" },
  { value: "family", label: "Family / Dependent" },
  { value: "transit", label: "Transit" },
  { value: "medical", label: "Medical" },
  { value: "unsure", label: "Not sure — advise me" },
] as const;
export const visaPurposes = [
  { value: "tourism", label: "Holiday / Tourism" },
  { value: "family-visit", label: "Visit family or friends" },
  { value: "business", label: "Business meetings" },
  { value: "conference", label: "Conference / Event" },
  { value: "study", label: "Education" },
  { value: "employment", label: "Employment" },
  { value: "medical", label: "Medical treatment" },
  { value: "other", label: "Other" },
] as const;
const dateIsReal=(text:string)=>/^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text+"T00:00:00Z")) && new Date(text+"T00:00:00Z").toISOString().slice(0,10)===text;
export const visaEnquirySchema=z.object({
  countryCode:z.string().trim().toUpperCase().refine(c=>validCountryCodes.has(c), "Select a valid destination country."),
  city:z.string().trim().min(2).max(100),
  visaType:z.enum(visaTypes.map(t=>t.value) as [typeof visaTypes[number]["value"],...typeof visaTypes[number]["value"][]]),
  travelPurpose:z.enum(visaPurposes.map(t=>t.value) as [typeof visaPurposes[number]["value"],...typeof visaPurposes[number]["value"][]]),
  intendedDate:z.string().length(10),
  travellers:z.number().int().min(1).max(30),
  name:z.string().trim().min(2).max(100),
  email:z.string().trim().email().max(200).transform(v=>v.toLowerCase()),
  phone:z.string().trim().regex(/^[0-9+()\s-]{7,30}$/),
  notes:z.string().trim().max(3000).default(""),
  consent:z.literal(true),
  website:z.string().max(200).default(""),
}).superRefine((v,ctx)=>{
  const today=new Date().toISOString().slice(0,10);
  const limit=new Date();limit.setUTCFullYear(limit.getUTCFullYear()+3);
  if(!dateIsReal(v.intendedDate)||v.intendedDate<today||v.intendedDate>limit.toISOString().slice(0,10))
    ctx.addIssue({code:"custom",message:"Select a valid future travel date.",path:["intendedDate"]});
});
export type VisaEnquiryInput=z.infer<typeof visaEnquirySchema>;
export const visaStatusValues=["new","contacted","quoted","follow_up","confirmed","closed"] as const;
export const visaChangeSchema=z.discriminatedUnion("action",[
  z.object({action:z.literal("status"),status:z.enum(visaStatusValues)}),
  z.object({action:z.literal("note"),note:z.string().trim().min(2).max(2000)}),
  z.object({action:z.literal("assign"),staffId:z.string().uuid().nullable()}),
]);
