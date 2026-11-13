"use client";

import { AirportCombobox } from "@/features/booking/components/airport-combobox";
import { CityField } from "@/features/booking/components/visa-request-fields";
import { countries } from "@/data/countries";
import { serviceFields, type OtherService, type ServiceSelection } from "@/features/booking/lib/service-options";

type Props = {
  service: OtherService;
  value: ServiceSelection;
  onChange: (value: ServiceSelection) => void;
  idPrefix: string;
  minDate: string;
};

/** Destination + schedule + traveller count + context are captured before contact details. */
export function ServiceRequestFields({ service, value, onChange, idPrefix, minDate }: Props) {
  const fields = serviceFields[service];
  const set = <K extends keyof ServiceSelection>(key: K, next: ServiceSelection[K]) => onChange({ ...value, [key]: next });
  return <div className="space-y-4">
    {service === "corporate" ? (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="booking-label" htmlFor={idPrefix + "-corporate-country"}>Destination country</label>
          <select id={idPrefix + "-corporate-country"} required className="booking-input"
            value={value.destinationCountryCode}
            onChange={e => onChange({
              ...value, destinationCountryCode: e.target.value, destinationCity: "", destination: "",
            })}>
            <option value="">Select destination country</option>
            {countries.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </div>
        <CityField key={value.destinationCountryCode || "none"}
          id={idPrefix + "-corporate-city"} label="Meeting / event city"
          country={value.destinationCountryCode} city={value.destinationCity}
          onChange={city => set("destinationCity", city)}/>
        <div className="min-w-0 sm:col-span-2">
          <AirportCombobox key={idPrefix + "-corporate-airport-" + value.destinationCountryCode}
            id={idPrefix + "-corporate-airport"}
            label="Preferred nearby airport (optional)"
            value={value.destination} onChange={code => set("destination", code)}
            placeholder="Search an airport near your venue"
            required={false}/>
        </div>
      </div>
    ) : (
      <AirportCombobox
        key={idPrefix + "-" + service + "-destination"}
        id={idPrefix + "-" + service + "-destination"}
        label={fields.destinationLabel}
        value={value.destination}
        onChange={code => set("destination", code)}
        placeholder="Search city, airport or IATA code"
        helper={fields.helper}
      />
    )}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="min-w-0">
        <label className="booking-label" htmlFor={`${idPrefix}-${service}-date`}>{fields.dateLabel}</label>
        <input id={`${idPrefix}-${service}-date`} type="date" required min={minDate} className="booking-input" value={value.startDate} onChange={e => set("startDate", e.target.value)}/>
      </div>
      <div className="min-w-0">
        <label className="booking-label" htmlFor={`${idPrefix}-${service}-travellers`}>Travellers</label>
        <select id={`${idPrefix}-${service}-travellers`} className="booking-input" value={value.travellers} onChange={e => set("travellers", Number(e.target.value))}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? "traveller" : "travellers"}</option>)}
        </select>
      </div>
      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <label className="booking-label" htmlFor={`${idPrefix}-${service}-category`}>{fields.categoryLabel}</label>
        <select id={`${idPrefix}-${service}-category`} className="booking-input" value={value.category} onChange={e => set("category", e.target.value)}>
          {fields.categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
    </div>
  </div>;
}
