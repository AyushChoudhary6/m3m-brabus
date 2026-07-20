import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { trackWhatsApp, trackCall } from "../../lib/analytics.js";
import { whatsappUrl } from "../../lib/whatsapp.js";
import { PROJECT } from "../../lib/site.js";

/**
 * Floating WhatsApp + call buttons (PRD Ch.17 — mobile: floating WhatsApp,
 * call button). In Indian luxury real estate one-tap WhatsApp routinely
 * out-converts forms, so it gets a permanent, zero-friction position.
 *
 * The message is built per route by src/lib/whatsapp.js — pathname is passed
 * explicitly so a client-side navigation rebuilds the link instead of leaving
 * the visitor asking for whatever page they first landed on.
 */

export default function WhatsAppFloat() {
  const { pathname } = useLocation();
  const [up, setUp] = useState(false);

  // lift above the mobile action bar once the user starts scrolling
  useEffect(() => {
    const onScroll = () => setUp(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed right-4 z-[45] flex flex-col gap-3 transition-all duration-500 ease-lux lg:right-6 ${
        up ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      } bottom-24 lg:bottom-8`}
    >
      <a
        href={whatsappUrl({ pathname })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsApp("float")}
        aria-label="Chat on WhatsApp"
        data-cursor="CHAT"
        className="group grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105 lg:h-14 lg:w-14"
      >
        <MessageCircle size={22} />
      </a>
      <a
        href={`tel:${PROJECT.phone}`}
        onClick={() => trackCall("float")}
        aria-label="Call sales"
        data-cursor="CALL"
        className="grid h-12 w-12 place-items-center rounded-full border border-brass/50 bg-paper/90 text-brass shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur transition-colors duration-300 hover:bg-brass hover:text-obsidian lg:h-14 lg:w-14"
      >
        <Phone size={19} />
      </a>
    </div>
  );
}
