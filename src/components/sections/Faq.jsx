import Accordion from "../ui/Accordion.jsx";
import { Reveal } from "../ui/Reveal.jsx";
import { ldJson } from "../ui/Seo.jsx";
import { FAQS } from "../../lib/site.js";

export default function Faq() {
  return (
    <section className="py-16 md:py-24">
      {/* FAQPage structured data for AEO / rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <div className="container-lux grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="kicker mb-5">Answers</p>
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.06] text-ink">
            Everything you <span className="font-serif font-light italic text-champagne-soft">need to know.</span>
          </h2>
        </Reveal>

        {/* Answers stay in the DOM whether open or shut — the structured data
            above is only worth having if the prose backing it is crawlable. */}
        <Accordion items={FAQS} />
      </div>
    </section>
  );
}
