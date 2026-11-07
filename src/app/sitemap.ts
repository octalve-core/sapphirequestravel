import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const root="https://sapphirequestravel.com";return ["","/services","/packages","/destinations","/visa-assistance","/corporate-travel","/about","/contact","/request","/privacy","/terms"].map(path=>({url:`${root}${path}`,changeFrequency:"monthly" as const,priority:path===""?1:0.6}));}
