import { Link } from "react-router-dom";
import clsx from "clsx";

const base =
  "group relative inline-flex items-center justify-center gap-2 font-sans text-[0.78rem] font-medium tracking-[0.14em] uppercase transition-colors duration-500 ease-lux";

const variants = {
  primary: "bg-ink text-canvas px-8 py-4 hover:bg-brass",
  ghost: "border border-ink/25 text-ink px-8 py-4 hover:border-brass hover:text-brass",
  light: "bg-paper text-ink px-8 py-4 hover:bg-cream",
};

export default function Button({ variant = "primary", to, href, children, className, ...rest }) {
  const cls = clsx(base, variants[variant], className);
  const inner = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button className={cls} {...rest}>{inner}</button>;
}
