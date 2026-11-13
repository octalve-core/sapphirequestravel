"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { packageEnquiryStatuses, type PackageEnquiryStatus } from "@/server/package-enquiry-schema";
import { packageStatusLabels } from "@/features/admin/lib/package-status";

type StaffOption = { id: string; name: string };

export function PackageEnquiryActions({
  id, status: initialStatus, assignedTo: initialAssignedTo, assignees,
}: {
  id: string;
  status: PackageEnquiryStatus;
  assignedTo: string | null;
  assignees: StaffOption[];
}) {
  const router = useRouter();
  const [status,setStatus] = useState(initialStatus);
  const [assigned,setAssigned] = useState(initialAssignedTo || "");
  const [note,setNote] = useState("");
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState("");
  const [error,setError] = useState(false);

  async function change(payload: object) {
    if (busy) return;
    setBusy(true); setFeedback(""); setError(false);
    try {
      const result = await fetch("/api/admin/package-enquiries/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: {ok?:boolean;error?:string} = await result.json();
      if (!result.ok || !data.ok) {
        setError(true); setFeedback(data.error || "Unable to save this update.");
        return;
      }
      setFeedback("Saved successfully.");
      if ("action" in payload && (payload as {action:string}).action === "note") setNote("");
      router.refresh();
    } catch {
      setError(true); setFeedback("Network error. Try again.");
    } finally { setBusy(false); }
  }

  function noteSubmit(event:FormEvent) {
    event.preventDefault();
    if (note.trim().length >= 2) void change({action:"note",note});
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-navy">Manage request</h2>
        <p className="mt-2 text-xs leading-6 text-muted">Keep your team informed with statuses, assignments and private notes.</p>
      </div>
      <div>
        <label htmlFor="package-status" className="label-field">Status</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <select id="package-status" className="input-field min-w-0 flex-1" value={status} onChange={e=>setStatus(e.target.value as PackageEnquiryStatus)}>
            {packageEnquiryStatuses.map(v=><option key={v} value={v}>{packageStatusLabels[v]}</option>)}
          </select>
          <button type="button" disabled={busy} onClick={()=>void change({action:"status",status})} className="rounded-lg bg-sapphire px-4 text-xs font-medium text-white disabled:opacity-50">Update</button>
        </div>
      </div>
      <div>
        <label htmlFor="package-assignee" className="label-field">Assigned team member</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <select id="package-assignee" className="input-field min-w-0 flex-1" value={assigned} onChange={e=>setAssigned(e.target.value)}>
            <option value="">Unassigned</option>
            {assignees.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
          <button type="button" disabled={busy} onClick={()=>void change({action:"assign",staffId:assigned || null})} className="rounded-lg border border-sapphire px-4 text-xs font-medium text-sapphire disabled:opacity-50">Assign</button>
        </div>
      </div>
      <form onSubmit={noteSubmit} className="space-y-3 border-t border-[#e9edf4] pt-5">
        <label htmlFor="package-note" className="label-field">Add private note</label>
        <textarea id="package-note" required minLength={2} maxLength={2000} rows={4} className="input-field resize-y py-3" value={note} onChange={e=>setNote(e.target.value)} placeholder="Call outcome, client preferences, supplier quote or next steps..."/>
        <button type="submit" disabled={busy||note.trim().length<2} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sapphire px-5 text-xs font-medium text-white disabled:opacity-50">
          <Save size={15}/> Save note
        </button>
      </form>
      {feedback && <p role="status" className={"rounded-lg px-4 py-3 text-xs " + (error?"bg-red-50 text-red-700":"bg-green-50 text-green-800")}>{feedback}</p>}
    </div>
  );
}
