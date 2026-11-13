import { brand } from "@/config/brand";

export function PrivacyDetails() {
  return (
    <section className="section-space">
      <div className="container-wide max-w-3xl space-y-7 text-sm leading-8 text-[#4f5e73]">
        <h2 className="text-xl font-medium text-navy">Information you share with us</h2>
        <p>
          When you make a travel enquiry, we receive the details you provide, which may
          include your name, email address, telephone number, destinations, travel dates,
          traveller numbers and any additional information in your message.
        </p>
        <h2 className="text-xl font-medium text-navy">How we use your information</h2>
        <p>
          We use enquiry information to respond to your request, explore appropriate
          itineraries, help coordinate travel services, keep necessary operational records
          and maintain the security of our website and staff workspace.
        </p>
        <h2 className="text-xl font-medium text-navy">Who can access your details</h2>
        <p>
          Authorised Sapphire Quest team members can access relevant enquiries to assist
          you. Where necessary to arrange your requested travel, selected details may be
          shared with airlines, accommodation partners or other travel providers with
          appropriate notice and, where required, your consent. We do not sell enquiry data.
        </p>
        <h2 className="text-xl font-medium text-navy">Destination search data</h2>
        <p>
          City suggestions used in our visa and corporate travel forms are powered by{" "}
          <a href="https://geodb-cities-api.wirefreethought.com/" target="_blank" rel="noopener noreferrer" className="text-sapphire underline">GeoDB Cities</a>,
          using place data from GeoNames and Wikidata. GeoDB is licensed under{" "}
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer" className="text-sapphire underline">Creative Commons Attribution 3.0</a>.
          Suggestions may not include smaller towns; our travel team will confirm your destination.
        </p>
        <h2 className="text-xl font-medium text-navy">Security and your choices</h2>
        <p>
          Our staff workspace uses access controls and essential session cookies. We retain
          information for operational needs and applicable recordkeeping obligations. You
          can ask about access, correction or deletion of your information, subject to
          relevant legal requirements.
        </p>
        <p>
          For privacy enquiries, contact
          {" "}<a href={"mailto:" + brand.email} className="text-sapphire underline">{brand.email}</a>.
        </p>
      </div>
    </section>
  );
}
