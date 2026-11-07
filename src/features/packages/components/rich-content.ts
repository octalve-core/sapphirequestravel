/** Deliberately small, HTML-free rich text model. Safe to render as React text nodes. */
export type RichRun = { text: string; bold?: boolean; italic?: boolean };
export type RichBlock = { kind: "paragraph" | "heading" | "bullet" | "numbered"; runs: RichRun[] };
export type RichContent = { blocks: RichBlock[] };
export const emptyContent = (): RichContent => ({ blocks: [{ kind: "paragraph", runs: [{ text: "" }] }] });
export function escapeText(text: string): string { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
export function asSafeContent(input: unknown): RichContent {
  if (!input || typeof input !== "object") return emptyContent();
  const blocks = (input as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks) || blocks.length > 70) return emptyContent();
  let total = 0;
  const cleaned: RichBlock[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") return emptyContent();
    const b = block as { kind?: unknown; runs?: unknown };
    if (!["paragraph", "heading", "bullet", "numbered"].includes(String(b.kind)) || !Array.isArray(b.runs) || b.runs.length > 30) return emptyContent();
    const runs: RichRun[] = [];
    for (const part of b.runs) {
      if (!part || typeof part !== "object" || typeof (part as RichRun).text !== "string") return emptyContent();
      const p = part as RichRun;
      if (p.text.length > 1200) return emptyContent();
      total += p.text.length;
      if (total > 12000) return emptyContent();
      runs.push({ text: p.text, bold: p.bold === true, italic: p.italic === true });
    }
    cleaned.push({ kind: b.kind as RichBlock["kind"], runs });
  }
  return { blocks: cleaned };
}
export function richIsValid(input: unknown) {
  if (JSON.stringify(input).length > 20000) return false;
  const clean = asSafeContent(input);
  return JSON.stringify(clean) === JSON.stringify(input) || JSON.stringify(clean.blocks) === JSON.stringify((input as RichContent)?.blocks);
}
