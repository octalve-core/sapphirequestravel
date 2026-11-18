import { brand } from "@/config/brand";

/** WhatsApp click-to-chat uses an international number without '+' or punctuation. */
export function whatsappLink(message: string): string {
  return "https://wa.me/" + brand.phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(message);
}
