import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, CircleDollarSign, HeartHandshake, Users2 } from "lucide-react";

import homePageImage from "@/artifacts/home-page-image.png";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Locale } from "@/lib/data/types";
import { getDailyCornerEntries, getUpcomingEvents } from "@/lib/db/queries";
import { getDictionary } from "@/lib/i18n/request";
import { formatMonthDay } from "@/lib/utils";

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const events = getUpcomingEvents(locale).slice(0, 1);
  const entries = getDailyCornerEntries(locale).slice(0, 1);
  const actionLinks = [
    {
      icon: BookOpenText,
      href: `/${locale}/disease-information`,
      title: dictionary.home.helpCards[0].title,
      body: dictionary.home.helpCards[0].body,
      cta: dictionary.common.learnMore
    },
    {
      icon: Users2,
      href: `/${locale}/community`,
      title: dictionary.home.helpCards[1].title,
      body: dictionary.home.helpCards[1].body,
      cta: dictionary.common.joinGroup
    },
    {
      icon: CircleDollarSign,
      href: `/${locale}/donation`,
      title: dictionary.home.helpCards[2].title,
      body: dictionary.home.helpCards[2].body,
      cta: dictionary.common.applyNow
    },
    {
      icon: HeartHandshake,
      href: `/${locale}/daily-corner`,
      title: dictionary.home.helpCards[3].title,
      body: dictionary.home.helpCards[3].body,
      cta: dictionary.common.readNow
    }
  ];

  return (
    <div className="page-stack">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="hero-stage hero-stage-home">
            <Image
              alt="Rare Care homepage cover artwork showing online rare disease support in Mongolia"
              className="home-hero-image"
              priority
              sizes="100vw"
              src={homePageImage}
            />
          </div>
          <div className="hero-content-card hero-content-below">
            <h1>{dictionary.home.heroTitle}</h1>
            <p>{dictionary.home.heroBody}</p>
            <div className="hero-actions">
              <Link className="primary-button" href={`/${locale}/disease-information`}>
                {dictionary.nav.diseaseInformation}
              </Link>
              <Link className="secondary-button" href={`/${locale}/donation`}>
                {dictionary.nav.donate}
              </Link>
            </div>
            <p className="hero-aside">{dictionary.home.heroAside}</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <SectionHeading title={dictionary.home.aboutTitle} />
        <div className="about-panel">
          <div className="about-badge">{dictionary.home.aboutTitle}</div>
          <p>{dictionary.home.aboutBody}</p>
        </div>
      </section>

      <section className="container section">
        <SectionHeading title={dictionary.home.helpTitle} />
        <div className="help-grid">
          {actionLinks.map((item) => (
            <article key={item.href} className="help-card">
              <item.icon className="help-icon" size={24} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <Link href={item.href}>
                {item.cta}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHeading title={`${dictionary.common.upcomingEvents} & ${dictionary.nav.dailyCorner}`} />
        <div className="preview-grid">
          <div className="preview-card">
            <h3>{dictionary.common.upcomingEvents}</h3>
            {events.map((event) => (
              <div key={event.id}>
                <p className="preview-meta">
                  {formatMonthDay(event.date, locale)}
                  {event.startTime ? ` · ${event.startTime}` : ""}
                </p>
                <h4>{event.title}</h4>
                <p>{event.summary}</p>
              </div>
            ))}
            <Link href={`/${locale}/events`}>{dictionary.common.learnMore}</Link>
          </div>
          <div className="preview-card is-tip">
            <h3>{dictionary.common.everydayTips}</h3>
            {entries.map((entry) => (
              <div key={entry.id}>
                {entry.quote ? <blockquote>{entry.quote}</blockquote> : null}
                <p>{entry.reminderBody || entry.body}</p>
              </div>
            ))}
            <Link href={`/${locale}/daily-corner`}>{dictionary.common.readNow}</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="donation-callout">
          <p>{dictionary.home.donationQuote}</p>
          <Link className="primary-button" href={`/${locale}/donation`}>
            {dictionary.common.makeDonation}
          </Link>
        </div>
      </section>
    </div>
  );
}
