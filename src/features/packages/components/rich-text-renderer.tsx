import type { ReactNode } from "react";
import { asSafeContent, type RichRun } from "@/features/packages/components/rich-content";
function renderRuns(runs: RichRun[]): ReactNode { return runs.map((run,i) => {
  let value: ReactNode = run.text;
  if (run.bold) value = <strong>{value}</strong>;
  if (run.italic) value = <em>{value}</em>;
  return <span key={i}>{value}</span>;
}); }
export function RichTextRenderer({ content }: { content: unknown }) {
  const blocks = asSafeContent(content).blocks;
  const nodes: ReactNode[] = [];
  for (let i = 0; i < blocks.length;) {
    const b = blocks[i];
    if (b.kind === "bullet" || b.kind === "numbered") {
      const group = [b]; let j = i + 1;
      while (j < blocks.length && blocks[j].kind === b.kind) group.push(blocks[j++]);
      const items = group.map((item,k) => <li key={k}>{renderRuns(item.runs)}</li>);
      nodes.push(b.kind === "bullet" ? <ul className="list-disc space-y-2 pl-6" key={i}>{items}</ul> : <ol className="list-decimal space-y-2 pl-6" key={i}>{items}</ol>);
      i = j; continue;
    }
    nodes.push(b.kind === "heading" ? <h3 className="text-xl font-medium text-navy" key={i}>{renderRuns(b.runs)}</h3> : <p key={i}>{renderRuns(b.runs)}</p>);
    i++;
  }
  return <div className="space-y-4 text-sm leading-8 text-[#46546a]">{nodes}</div>;
}
