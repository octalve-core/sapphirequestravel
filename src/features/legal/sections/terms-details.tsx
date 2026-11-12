import { brand } from "@/config/brand";

export function TermsDetails() {
  return (
    <section className="section-space">
      <div className="container-wide max-w-3xl space-y-7 text-sm leading-8 text-[#4f5e73]">
        <h2 className="text-xl font-medium text-navy">How our travel service works</h2>
        <p>
          Sapphire Quest Travels & Tours Ltd helps travellers explore holiday packages, flights,
          visa assistance and personalised itineraries. Enquiries begin a conversation with our
          team. A booking is confirmed only when the applicable supplier issues confirmation and
          the customer accepts the agreed booking terms.
        </p>
        <h2 className="text-xl font-medium text-navy">Prices and arrangements</h2>
        <p>
          Package prices shown as “From” are starting prices based on the described travel style,
          room sharing and departure city. Your adviser will provide a complete breakdown of
          your itinerary, inclusions, travel dates and total cost before payment. Airline fares,
          rooms, excursions and third-party charges can vary with availability and travel dates.
        </p>
        <h2 className="text-xl font-medium text-navy">Travel documents</h2>
        <p>
          Travellers are responsible for accurate passenger details, valid passports, applicable
          entry permissions, health documents and compliance with destination requirements.
          Visa application support does not guarantee approval; visa decisions are made by the
          relevant authorities. We will help identify the documentation needed for your trip.
        </p>
        <h2 className="text-xl font-medium text-navy">Changes and cancellations</h2>
        <p>
          Flight, hotel and experience changes, cancellations and refunds follow the terms
          agreed for your specific booking and the rules of each provider. We will share
          relevant conditions before you authorise a booking.
        </p>
        <p>
          Questions about an itinerary or our services? Email
          {" "}<a href={"mailto:" + brand.email} className="text-sapphire underline">{brand.email}</a>.
        </p>
      </div>
    </section>
  );
}
