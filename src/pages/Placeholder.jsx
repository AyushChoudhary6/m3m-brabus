import { Reveal } from "../components/ui/Reveal.jsx";
import Button from "../components/ui/Button.jsx";

export default function Placeholder({ title }) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-brass/10 blur-[120px]" />
      <div className="container-lux">
        <Reveal>
          <p className="kicker">M3M Brabus</p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,7vw,5rem)] leading-[0.98] text-ink">
            <span className="italic">{title}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            This page is being crafted with the same detail as the residences
            themselves. In the meantime, register your interest to receive the
            brochure and price sheet first.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button to="/contact">Register Interest</Button>
            <Button variant="ghost" to="/">Back to Home</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
