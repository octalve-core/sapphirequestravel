import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
export function MarketingLayout({children}:{children:React.ReactNode}){return <><Header/><main id="main-content">{children}</main><Footer/></>}
