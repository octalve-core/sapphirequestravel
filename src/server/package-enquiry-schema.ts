import { z } from "zod";

export const packageEnquiryStatuses = [
  "new", "contacted", "quoted", "follow_up", "confirmed", "closed",
] as const;
export type PackageEnquiryStatus = (typeof packageEnquiryStatuses)[number];

function realDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export const packageEnquirySchema = z.object({
  preferredDate: z.string().length(10),
  departureCity: z.string().trim().min(2).max(90),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  infants: z.number().int().min(0).max(20),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200).transform((v) => v.toLowerCase()),
  phone: z.string().trim().regex(/^[0-9+()\s-]{7,30}$/).max(30),
  notes: z.string().trim().max(2000).default(""),
  consent: z.literal(true),
  website: z.string().max(160).default(""),
}).superRefine((data, ctx) => {
  const today = new Date().toISOString().slice(0, 10);
  const upperDate = new Date();
  upperDate.setUTCFullYear(upperDate.getUTCFullYear() + 2);
  if (!realDate(data.preferredDate) || data.preferredDate < today || data.preferredDate > upperDate.toISOString().slice(0, 10)) {
    ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Choose an available future date within two years." });
  }
  if (data.adults + data.children + data.infants > 30 || data.infants > data.adults) {
    ctx.addIssue({ code: "custom", path: ["adults"], message: "Up to 30 travellers; each infant must accompany an adult." });
  }
});
export type PackageEnquiryInput = z.infer<typeof packageEnquirySchema>;

export const packageEnquiryFiltersSchema = z.object({
  q: z.string().trim().max(100).default(""),
  status: z.enum(["all", ...packageEnquiryStatuses]).default("all"),
  package: z.string().trim().max(130).regex(/^[a-z0-9-]*$/).default(""),
  from: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).default(""),
  to: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export type PackageEnquiryFilters = z.infer<typeof packageEnquiryFiltersSchema>;

export const packageEnquiryChangeSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), status: z.enum(packageEnquiryStatuses) }),
  z.object({ action: z.literal("note"), note: z.string().trim().min(2).max(2000) }),
  z.object({ action: z.literal("assign"), staffId: z.string().uuid().nullable() }),
]);
