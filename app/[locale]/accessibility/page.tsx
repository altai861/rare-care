import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function AccessibilityPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);

  return (
    <div className="page-stack">
      <div className="container section-tight">
        <Breadcrumbs
          items={[
            { label: dictionary.common.home, href: `/${locale}` },
            { label: dictionary.nav.accessibility }
          ]}
        />
      </div>
      <PageHero
        title={dictionary.legal.accessibilityTitle}
        description={
          locale === "mn"
            ? "Rare Care нь гар, гар утас, дэлгэц уншигч, тод контрастын хэрэглээг дэмжих суурь зарчмуудтайгаар бүтээгдсэн."
            : "Rare Care is built with semantic structure, keyboard access, visible focus states, and room to expand accessibility support over time."
        }
      />
      <section className="container section prose-panel">
        <p>
          {locale === "mn"
            ? "Энэ MVP хувилбар нь ойлгомжтой гарчиг, шошготой форм, гарын тусламжтай удирдлага, харагдах фокус төлөвийг багтаана."
            : "This MVP includes structured headings, labeled forms, keyboard-friendly navigation, and visible focus states."}
        </p>
        <p>
          {locale === "mn"
            ? "Өдрийн буланд аудио холбоос дэмжих суурийг бэлтгэсэн. Цаашид фонтын хэмжээ, контрастын тохиргоо, контентын уншлага нэмэх боломжтой."
            : "Daily Corner already supports optional audio links. Future iterations can add stronger contrast preferences, font controls, and richer audio support."}
        </p>
      </section>
    </div>
  );
}
