import { EventCard } from "@/components/events/event-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";
import { getUpcomingEvents } from "@/lib/db/queries";

export default async function EventsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const events = getUpcomingEvents(locale);

  return (
    <div className="page-stack">
      <div className="container section-tight">
        <Breadcrumbs
          items={[
            { label: dictionary.common.home, href: `/${locale}` },
            { label: dictionary.nav.events }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.events}
        title={dictionary.events.title}
        description={dictionary.events.body}
      />
      <section className="container section event-list">
        {events.map((event) => (
          <EventCard key={event.id} dictionary={dictionary} event={event} />
        ))}
      </section>
    </div>
  );
}
