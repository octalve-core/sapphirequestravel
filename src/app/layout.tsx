import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
const geist=Geist({subsets:["latin"],display:"swap",variable:"--font-geist"});
export const metadata:Metadata={title:{default:"Sapphire Quest | Travel, thoughtfully arranged",template:"%s | Sapphire Quest"},description:"Thoughtful travel management, flight enquiries, visa assistance and conference travel for individuals and organisations.",metadataBase:new URL("https://sapphirequesttravel.com"),openGraph:{type:"website",title:"Sapphire Quest Travels & Tours",description:"Connecting people. Enabling possibilities.",images:["/images/hero-runway.webp"]},robots:{index:true,follow:true}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#0755db"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={geist.variable}><a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-3">Skip to content</a>{children}</body></html>}
