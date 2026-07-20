import { Phone, MessageCircle, Mail } from "lucide-react";
import { useEnquiry } from "./ui/Enquiry.jsx";
import { useI18n } from "../lib/i18n.jsx";
import { PROJECT } from "../lib/site.js";

/** Sticky bottom action bar — mobile only. */
export default function MobileCTA() {
  const { openEnquiry } = useEnquiry();
  const { t } = useI18n();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden">
      <a
        href={`tel:${PROJECT.phone}`}
        className="flex items-center justify-center gap-2 py-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-ink"
      >
        <Phone size={15} /> {t("m.call")}
      </a>
      <a
        href={`https://wa.me/${PROJECT.whatsapp}`}
        className="flex items-center justify-center gap-2 border-x border-line py-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-ink"
      >
        <MessageCircle size={15} /> {t("m.whatsapp")}
      </a>
      <button
        type="button"
        onClick={() => openEnquiry()}
        className="flex items-center justify-center gap-2 bg-brass py-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-obsidian"
      >
        <Mail size={15} /> {t("m.enquire")}
      </button>
    </div>
  );
}
