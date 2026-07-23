import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Seo, { breadcrumbLd } from "../components/ui/Seo.jsx";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";
import RelatedPages from "../components/sections/RelatedPages.jsx";
import CtaBand from "../components/sections/CtaBand.jsx";
import Media from "../components/ui/Media.jsx";
import { PROJECT } from "../lib/site.js";
import { IMG, px } from "../lib/images.js";
import { useI18n } from "../lib/i18n.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Regulatory status. Nothing here is inferred — where the official listing
   does not publish a figure, the row says so. */
const STATUS = [
  { kKey: "rera.status.reraLabel", v: PROJECT.rera },
  { kKey: "rera.status.regulatorLabel", vKey: "rera.status.regulatorValue" },
  { kKey: "rera.status.portalLabel", v: "haryanarera.gov.in" },
  { kKey: "rera.status.projectLabel", v: `${PROJECT.name} · ${PROJECT.configs}` },
  { kKey: "rera.status.developerLabel", v: PROJECT.developer },
  { kKey: "rera.status.addressLabel", v: PROJECT.address },
  { kKey: "rera.status.possessionLabel", v: PROJECT.possession },
  { kKey: "rera.status.priceLabel", v: PROJECT.price },
];

const PROTECTIONS = [
  { tKey: "rera.prot.carpet", dKey: "rera.prot.carpetD" },
  { tKey: "rera.prot.funds", dKey: "rera.prot.fundsD" },
  { tKey: "rera.prot.timelines", dKey: "rera.prot.timelinesD" },
  { tKey: "rera.prot.advertising", dKey: "rera.prot.advertisingD" },
  { tKey: "rera.prot.defect", dKey: "rera.prot.defectD" },
  { tKey: "rera.prot.forum", dKey: "rera.prot.forumD" },
];

const VERIFY = [
  { n: "01", tKey: "rera.verify.open", dKey: "rera.verify.openD" },
  { n: "02", tKey: "rera.verify.search", dKey: "rera.verify.searchD" },
  { n: "03", tKey: "rera.verify.read", dKey: "rera.verify.readD" },
  { n: "04", tKey: "rera.verify.progress", dKey: "rera.verify.progressD" },
  { n: "05", tKey: "rera.verify.cross", dKey: "rera.verify.crossD" },
];

const DOCUMENTS = [
  "rera.docs.certificate",
  "rera.docs.licence",
  "rera.docs.layout",
  "rera.docs.title",
  "rera.docs.carpet",
  "rera.docs.cost",
  "rera.docs.draft",
  "rera.docs.payment",
  "rera.docs.completion",
  "rera.docs.spec",
  "rera.docs.escrow",
  "rera.docs.receipts",
];

const FAQ_ITEMS = [
  {
    q: "What is the RERA number of M3M Brabus?",
    a: "The official M3M listing does not publish a RERA registration number for M3M Brabus at this stage — it is marked as on request. We do not publish a number we cannot source. Please enquire and we will share the registration status in writing as it stands, and you can confirm it independently on the HARERA portal.",
    qKey: "rera.faq.q1",
    aKey: "rera.faq.a1",
  },
  {
    q: "How do I verify M3M Brabus on the HARERA portal myself?",
    a: "Visit haryanarera.gov.in, select the Gurugram authority, and use the public search of registered projects. Search by the promoter name as well as the project name, since a project can be filed under a name that differs from its marketing name. Any registered project displays its registration number, validity, sanctioned plans and declared completion date.",
    qKey: "rera.faq.q2",
    aKey: "rera.faq.a2",
  },
  {
    q: "Should I pay a booking amount before a registration number is confirmed?",
    a: "Take no step on our word alone. Ask for the registration certificate, the licence and approvals, the draft agreement and the full cost sheet in writing, verify the record on the HARERA portal yourself, and take independent legal advice before committing any money.",
    qKey: "rera.faq.q3",
    aKey: "rera.faq.a3",
  },
];

export default function ReraPage() {
  const root = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);

        gsap.from(q(".rise"), {
          autoAlpha: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.07,
          scrollTrigger: { trigger: q(".rise")[0], start: "top 86%" },
        });

        q(".sec").forEach((el) => {
          gsap.from(el.querySelectorAll(".sec-rise"), {
            autoAlpha: 0, y: 22, duration: 0.85, ease: "power3.out", stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
        });

        const wrap = q(".rera-img")[0];
        if (wrap) {
          gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
          gsap.to(wrap, {
            clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power3.inOut",
            scrollTrigger: { trigger: wrap, start: "top 84%" },
          });
          gsap.to(q(".rera-img-inner"), {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Seo
        title="M3M Brabus RERA | Status & How to Verify on HARERA"
        description="M3M Brabus RERA status — no registration number is published on the official listing. What HARERA is, how to verify a Gurugram project, and what to ask for."
        path="/rera"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "RERA", path: "/rera" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "RERA", path: "/rera" }]} />
      <PageHeader
        eyebrow={t("rera.eyebrow")}
        title={t("rera.title")}
        accent={t("rera.accent")}
        lede={`${PROJECT.rera}. ${t("rera.ledeA")} ${PROJECT.name} ${t("rera.ledeB")}`}
      />

      {/* status */}
      <section className="container-lux pb-[clamp(4rem,11vh,7rem)]">
        <dl className="border-t border-line">
          {STATUS.map((s) => (
            <div
              key={s.kKey}
              className="rise grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8"
            >
              <dt className="mono text-[0.6rem] tracking-[0.2em] text-ink-faint">{t(s.kKey)}</dt>
              <dd className="text-ink">{s.vKey ? t(s.vKey) : s.v}</dd>
            </div>
          ))}
        </dl>
        <p className="rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          {t("rera.statusNote")}
        </p>
      </section>

      {/* what HARERA is */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="sec-rise max-w-[18ch] font-display text-[clamp(1.9rem,4vw,3rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink">
              {t("rera.headlineA")}{" "}
              <span className="font-serif italic text-brass">{t("rera.headlineB")}</span>
            </h2>
            <p className="sec-rise mt-6 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("rera.whatP1")}
            </p>
            <p className="sec-rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("rera.whatP2")}
            </p>
            <p className="sec-rise mt-4 max-w-[54ch] leading-relaxed text-ink-soft">
              {t("rera.whatP3")}
            </p>
          </div>

          <figure className="rera-img relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line">
            <div className="rera-img-inner ed-breath absolute inset-0 scale-[1.06]">
              <Media
                src={px(IMG.arrival, 1400)}
                alt={`${PROJECT.name} ${t("rera.arrivalAlt")} ${PROJECT.location}`}
                sizes="(max-width:1024px) 100vw, 46vw"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,transparent_55%,rgba(8,6,5,0.65))]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/10" />
            <span className="mono absolute bottom-5 left-5 text-[0.58rem] tracking-[0.2em] text-brass-soft">
              {PROJECT.address}
            </span>
          </figure>
        </div>
      </section>

      {/* protections */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <div className="grid gap-x-14 gap-y-0 md:grid-cols-2">
          {PROTECTIONS.map((p) => (
            <div key={p.tKey} className="sec-rise group border-b border-line py-6">
              <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                {t(p.tKey)}
              </h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">{t(p.dKey)}</p>
            </div>
          ))}
        </div>
        <p className="mono mt-6 text-[0.58rem] tracking-[0.2em] text-ink-faint">
          {t("rera.protNote")}
        </p>
      </section>

      {/* how to verify */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <ol className="border-t border-line">
          {VERIFY.map((v) => (
            <li
              key={v.n}
              className="sec-rise group border-b border-line py-6 transition-colors duration-500 hover:bg-brass/[0.035]"
            >
              <div>
                <h3 className="font-display text-xl text-ink transition-colors duration-300 group-hover:text-brass-soft">
                  {t(v.tKey)}
                </h3>
                <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{t(v.dKey)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="sec-rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          {t("rera.verifyNote")}
        </p>
      </section>

      {/* documents checklist */}
      <section className="sec container-lux pb-[clamp(4rem,11vh,7rem)]">
        <ul className="border-t border-line">
          {DOCUMENTS.map((d) => (
            <li
              key={d}
              className="sec-rise flex items-start gap-4 border-b border-line py-4 text-ink-soft"
            >
              <Check size={13} strokeWidth={2} className="mt-1.5 shrink-0 text-brass" />
              <span className="max-w-[70ch] leading-relaxed">{t(d)}</span>
            </li>
          ))}
        </ul>
        <p className="sec-rise mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
          {t("rera.docsNote")}
        </p>
      </section>

      {/* faqs */}
      <section className="sec container-lux pb-[clamp(4rem,12vh,8rem)]">
        <dl className="border-t border-line">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q} className="sec-rise border-b border-line py-6">
              <dt className="font-display text-xl text-ink md:text-2xl">{t(f.qKey)}</dt>
              <dd className="mt-3 max-w-[68ch] leading-relaxed text-ink-soft">{t(f.aKey)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedPages links={["/overview", "/possession", "/reviews", "/contact"]} />

      <CtaBand title={t("rera.ctaTitle")} accent={t("rera.ctaAccent")} subject="RERA" />
    </div>
  );
}
