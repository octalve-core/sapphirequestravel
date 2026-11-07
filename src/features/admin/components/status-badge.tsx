import { cn } from "@/lib/utils";
const colors:Record<string,string>={new:"bg-blue-50 text-blue-700",reviewing:"bg-amber-50 text-amber-700",quoted:"bg-indigo-50 text-indigo-700",awaiting_customer:"bg-orange-50 text-orange-700",confirmed:"bg-emerald-50 text-emerald-700",closed:"bg-slate-100 text-slate-600"};
export function StatusBadge({status}:{status:string}){return <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold capitalize",colors[status]??"bg-slate-100 text-slate-600")}>{status.replaceAll("_"," ")}</span>}
