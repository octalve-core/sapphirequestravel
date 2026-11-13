"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, CalendarPlus, FilePenLine, LoaderCircle, Mail, Phone } from "lucide-react";

const statuses = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "quoted", label: "Quoted" },
  { value: "awaiting_customer", label: "Awaiting customer" },
  { value: "confirmed", label: "Confirmed" },
  { value: "closed", label: "Closed" },
] as const;

export function EnquiryActions({ id, status, editable, agents, assignedTo, email, phone }: {
  id: string;
  status: string;
  editable: boolean;
  agents: { id: string; name: string }[];
  assignedTo: string | null;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [current, setCurrent] = useState(status);
  const [assigned, setAssigned] = useState(assignedTo ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dirty = current !== status || assigned !== (assignedTo ?? "");
  const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  const safePhone = phone.replace(/[^\d+]/g, "");

  async function update(payload: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/enquiries/" + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) {
        setFeedback(result.error || "We couldn't save this change.");
        return false;
      }
      setFeedback("Changes saved.");
      router.refresh();
      return true;
    } catch {
      setFeedback("Connection problem. Nothing was confirmed saved; please retry.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-5">
    <div>
      <label htmlFor="enquiry-status" className="mb-2 block text-[12px] font-medium text-[#354964]">Status</label>
      <select id="enquiry-status" className="input-field min-h-11 text-[13px]"
        disabled={!editable || busy} value={current} onChange={event=>setCurrent(event.target.value)}>
        {statuses.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
    <div>
      <label htmlFor="enquiry-assignee" className="mb-2 block text-[12px] font-medium text-[#354964]">Assigned staff</label>
      <select id="enquiry-assignee" className="input-field min-h-11 text-[13px]"
        disabled={!editable || busy} value={assigned} onChange={event=>setAssigned(event.target.value)}>
        <option value="">Unassigned</option>
        {agents.map(agent=><option key={agent.id} value={agent.id}>{agent.name}</option>)}
      </select>
    </div>
    <button type="button" disabled={!editable || busy || !dirty}
      onClick={()=>void update({ action: "manage", status: current, staffId: assigned || null })}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sapphire px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#0348bf] disabled:cursor-not-allowed disabled:opacity-50">
      {busy ? <LoaderCircle size={16} className="animate-spin"/> : <Check size={16}/>}
      Update enquiry
    </button>

    <div className="border-t border-[#e7edf5] pt-5">
      <h3 className="mb-3 text-[13px] font-medium text-navy">Quick actions</h3>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" disabled={!editable || busy}
          onClick={()=>{
            setNote(prev=>prev.trim() && prev.trim()!=="Follow-up:" ? prev : "Follow-up: ");
            noteRef.current?.focus();
            noteRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }}
          className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-[#dce6f3] px-1 text-center text-[11px] font-medium text-[#385171] hover:bg-[#f3f7ff] disabled:opacity-50">
          <CalendarPlus size={19} className="text-sapphire"/>Follow-up
        </button>
        {safeEmail ?
          <a href={"mailto:"+safeEmail} className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-[#dce6f3] px-1 text-center text-[11px] font-medium text-[#385171] hover:bg-[#f3f7ff]"><Mail size={19} className="text-sapphire"/>Email</a> :
          <span className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-[#dce6f3] text-[11px] text-muted opacity-50">No email</span>}
        {safePhone ?
          <a href={"tel:"+safePhone} className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-[#dce6f3] px-1 text-center text-[11px] font-medium text-[#385171] hover:bg-[#f3f7ff]"><Phone size={19} className="text-sapphire"/>Call</a> :
          <span className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-[#dce6f3] text-[11px] text-muted opacity-50">No phone</span>}
      </div>
    </div>

    <div className="border-t border-[#e7edf5] pt-5">
      <label htmlFor="enquiry-internal-note" className="mb-3 flex items-center gap-2 text-[13px] font-medium text-navy">
        <FilePenLine size={17} className="text-sapphire"/>Internal note <span className="text-[11px] font-normal text-muted">(staff only)</span>
      </label>
      <textarea ref={noteRef} id="enquiry-internal-note"
        value={note} maxLength={2000} disabled={!editable || busy}
        onChange={event=>setNote(event.target.value)}
        placeholder="Log updates, follow-up actions or quotation context..."
        className="w-full min-h-28 resize-y rounded-xl border border-[#dbe4ef] bg-white p-3 text-[12px] leading-6 text-navy placeholder:text-[#8796ab] focus:outline-2 focus:outline-sapphire"/>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] tabular-nums text-muted">{note.length}/2000</span>
        <button type="button"
          disabled={!editable || busy || note.trim().length < 2 || note.trim() === "Follow-up:"}
          onClick={async()=>{if(await update({action:"note",note}))setNote("");}}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbdcf3] bg-[#f4f8ff] px-4 text-[12px] font-medium text-sapphire hover:bg-[#e6f0ff] disabled:opacity-50">Save note</button>
      </div>
    </div>
    {feedback && <p role="status" aria-live="polite" className="rounded-lg bg-[#eef5ff] p-3 text-[12px] text-[#325078]">{feedback}</p>}
    {!editable && <p className="text-[12px] text-muted">Your role can view enquiries but cannot update them.</p>}
  </div>;
}
