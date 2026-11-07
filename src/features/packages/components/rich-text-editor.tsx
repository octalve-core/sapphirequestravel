"use client";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading3, RotateCcw } from "lucide-react";
import { asSafeContent, escapeText, type RichContent, type RichRun, type RichBlock } from "@/features/packages/components/rich-content";

function runMarkup(run: RichRun): string {
  let s = escapeText(run.text);
  if (run.bold) s = `<strong>${s}</strong>`;
  if (run.italic) s = `<em>${s}</em>`;
  return s;
}
function markup(content: RichContent) {
  const blocks = asSafeContent(content).blocks;
  let html = "", pending = "" as "" | "bullet" | "numbered";
  for (const b of blocks) {
    if (pending && pending !== b.kind) { html += pending === "bullet" ? "</ul>" : "</ol>"; pending = ""; }
    if (b.kind === "bullet" || b.kind === "numbered") {
      if (!pending) { html += b.kind === "bullet" ? "<ul>" : "<ol>"; pending = b.kind; }
      html += `<li>${b.runs.map(runMarkup).join("")}</li>`;
    } else html += `<${b.kind === "heading" ? "h3" : "p"}>${b.runs.map(runMarkup).join("") || "<br>"}</${b.kind === "heading" ? "h3" : "p"}>`;
  }
  if (pending) html += pending === "bullet" ? "</ul>" : "</ol>";
  return html;
}
function collectRuns(node: Node, marks: { bold?: boolean; italic?: boolean } = {}): RichRun[] {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ? [{ text: node.textContent, ...marks }] : [];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const tag = (node as Element).tagName.toLowerCase();
  const next = { ...marks, bold: marks.bold || tag === "strong" || tag === "b", italic: marks.italic || tag === "em" || tag === "i" };
  if (tag === "br") return [{ text: "\n", ...marks }];
  return Array.from(node.childNodes).flatMap(child => collectRuns(child, next));
}
function readContent(root: HTMLElement): RichContent {
  const blocks: RichBlock[] = [];
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) { const text = node.textContent?.trim(); if (text) blocks.push({ kind: "paragraph", runs: [{ text }] }); continue; }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = (node as Element).tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const kind: RichBlock["kind"] = tag === "ul" ? "bullet" : "numbered";
      for (const li of Array.from((node as Element).children)) if (li.tagName.toLowerCase() === "li") blocks.push({ kind, runs: collectRuns(li) });
    } else blocks.push({ kind: /^h[1-6]$/.test(tag) ? "heading" : "paragraph", runs: collectRuns(node) });
  }
  return { blocks: blocks.slice(0, 70) };
}
export function RichTextEditor({ value, onChange }: { value: RichContent; onChange: (value: RichContent) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const [initialMarkup] = useState(() => markup(value));
  useEffect(() => { if (editor.current) editor.current.innerHTML = initialMarkup; }, [initialMarkup]); // Seed once; preserve the caret while typing.
  function command(name: string, argument?: string) { editor.current?.focus(); document.execCommand(name, false, argument); if (editor.current) onChange(readContent(editor.current)); }

  return <div className="overflow-hidden rounded-xl border border-[#d9e0eb] bg-white">
    <div className="flex flex-wrap gap-1 border-b border-[#e8edf4] bg-[#f6f8fc] p-2" role="toolbar" aria-label="Text formatting">
      <button type="button" aria-label="Bold" title="Bold" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("bold")}><Bold size={17}/></button>
      <button type="button" aria-label="Italic" title="Italic" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("italic")}><Italic size={17}/></button>
      <button type="button" aria-label="Heading" title="Heading" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("formatBlock", "h3")}><Heading3 size={17}/></button>
      <button type="button" aria-label="Bulleted list" title="Bulleted list" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("insertUnorderedList")}><List size={17}/></button>
      <button type="button" aria-label="Numbered list" title="Numbered list" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("insertOrderedList")}><ListOrdered size={17}/></button>
      <button type="button" aria-label="Undo" title="Undo" className="rounded-md p-2 text-navy hover:bg-white" onMouseDown={e => e.preventDefault()} onClick={() => command("undo")}><RotateCcw size={17}/></button>
    </div>
    <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-label="Package details" aria-multiline="true" className="prose min-h-[190px] max-h-[450px] overflow-y-auto p-4 text-sm leading-7 text-[#263449] outline-none [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc" onInput={e => onChange(readContent(e.currentTarget))}
      onPaste={e => { e.preventDefault(); const text=e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text.slice(0,12000)); }} />
    <div className="border-t border-[#e9edf5] px-4 py-2 text-[11px] text-muted">Format descriptions, highlights and bullet lists. Pasted text is plain text for safety.</div>
  </div>;
}
