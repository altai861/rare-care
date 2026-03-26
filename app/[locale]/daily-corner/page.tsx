import { DailyEntry } from "@/components/daily-corner/daily-entry";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDailyCornerEntries } from "@/lib/db/queries";
import { getDictionary } from "@/lib/i18n/request";

export default async function DailyCornerPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const entries = getDailyCornerEntries(locale);

  return (
    <div className="page-stack">
      <div className="container section-tight">
        <Breadcrumbs
          items={[
            { label: dictionary.common.home, href: `/${locale}` },
            { label: dictionary.nav.dailyCorner }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.dailyCorner}
        title={dictionary.dailyCorner.title}
        description={dictionary.dailyCorner.body}
      />
      <section className="container section daily-list">
        {entries.map((entry, index) => (
          <DailyEntry
            key={entry.id}
            dictionary={dictionary}
            entry={entry}
            index={index}
          />
        ))}
      </section>
    </div>
  );
}
