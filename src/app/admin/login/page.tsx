import type { Metadata } from "next";
import { LoginScreen } from "@/features/admin/sections/login-screen";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Team sign in",robots:{index:false,follow:false}};
export default function LoginPage(){return <LoginScreen/>}
