import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <div className="page-hero-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="hero-figure" aria-hidden="true">
          {children ?? <div className="hero-orbit" />}
        </div>
      </div>
    </section>
  );
}
