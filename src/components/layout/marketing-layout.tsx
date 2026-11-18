import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/features/contact/components/floating-whatsapp";
import { TravelOfferPopup } from "@/features/home/components/travel-offer-popup";
export function MarketingLayout({children}:{children:React.ReactNode}){return <><Header/><main id="main-content" className="scroll-mt-[84px]">{children}</main><Footer/><FloatingWhatsApp/><TravelOfferPopup/></>}
