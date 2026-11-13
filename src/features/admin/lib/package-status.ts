export const packageStatusLabels = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  follow_up: "Follow-up",
  confirmed: "Confirmed",
  closed: "Closed",
} as const;

export const packageStatusClasses = {
  new: "bg-[#eef5ff] text-[#0957b3]",
  contacted: "bg-[#fff7e9] text-[#94620a]",
  quoted: "bg-[#f0eaff] text-[#6344a1]",
  follow_up: "bg-[#fff4eb] text-[#a75c19]",
  confirmed: "bg-[#e8f8f0] text-[#13714e]",
  closed: "bg-[#f1f2f5] text-[#5f6878]",
} as const;
