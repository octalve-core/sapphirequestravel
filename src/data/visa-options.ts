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
