/** Shared labels for the public enquiry form and server-side validation. */
export type Service = "flight" | "visa" | "holiday" | "corporate";
export type OtherService = Exclude<Service, "flight">;
export type ServiceSelection = {
  destination: string;
  startDate: string;
  travellers: number;
  category: string;
};

export const serviceFields: Record<OtherService, {
  destinationLabel: string;
  dateLabel: string;
  categoryLabel: string;
  helper: string;
  categories: readonly { value: string; label: string }[];
}> = {
  visa: {
    destinationLabel: "Destination",
    dateLabel: "Intended travel date",
    categoryLabel: "Travel purpose",
    helper: "Choose an airport in the country you plan to visit.",
    categories: [
      { value: "tourism", label: "Tourism" },
      { value: "business", label: "Business" },
      { value: "study", label: "Study" },
      { value: "family-visit", label: "Family visit" },
      { value: "transit", label: "Transit" },
      { value: "other", label: "Other" },
    ],
  },
  holiday: {
    destinationLabel: "Tour destination",
    dateLabel: "Preferred start date",
    categoryLabel: "Tour style",
    helper: "Choose the closest airport to your preferred destination.",
    categories: [
      { value: "vacation", label: "Vacation" },
      { value: "family-holiday", label: "Family holiday" },
      { value: "honeymoon", label: "Honeymoon" },
      { value: "adventure", label: "Adventure" },
      { value: "cultural", label: "Cultural" },
      { value: "custom", label: "Custom trip" },
    ],
  },
  corporate: {
    destinationLabel: "Travel destination",
    dateLabel: "Preferred travel date",
    categoryLabel: "Travel type",
    helper: "Choose the nearest airport to the meeting or event destination.",
    categories: [
      { value: "conference", label: "Conference or event" },
      { value: "delegation", label: "Delegation" },
      { value: "staff-travel", label: "Staff travel" },
      { value: "training", label: "Training" },
      { value: "group-trip", label: "Group trip" },
      { value: "other", label: "Other" },
    ],
  },
};

export const serviceNames: Record<Service, string> = {
  flight: "Flights", visa: "Visa", holiday: "Tours", corporate: "Corporate travel",
};

export function isOtherService(service: Service): service is OtherService {
  return service !== "flight";
}

export function selectionLabel(service: OtherService, category: string): string {
  return serviceFields[service].categories.find(item => item.value === category)?.label ?? category;
}
