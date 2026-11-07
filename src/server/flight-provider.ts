import "server-only";
/** Provider-neutral contract for the licensed flight-inventory phase. */
export type FlightQuery={from:string,to:string,departureDate:string,returnDate?:string,adults:number,currency:"NGN"|"USD"};
export type FlightOffer={provider:string,id:string,currency:string,total:string,airline:string,departAt:string,arriveAt:string,validUntil?:string};
export interface FlightProvider {search(query:FlightQuery):Promise<FlightOffer[]>;reprice?(offerId:string):Promise<FlightOffer>}
/** IMPORTANT: No provider is enabled by default. Do not show invented fares or charge cards. */
export async function getFlightProvider():Promise<FlightProvider|null>{return null}
