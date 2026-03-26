import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function CommunityPage({
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
            { label: dictionary.nav.community }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.community}
        title={dictionary.community.title}
        description={dictionary.community.body}
      />
      <section className="container section">
        <div className="three-up-grid">
          <article className="content-panel">
            <h2>{dictionary.community.welcome}</h2>
            <p>
              {locale === "mn"
                ? "Rare Care-ийн олон нийтийн хэсэг нь гэр бүлүүд хоорондоо холбогдох ирээдүйн орон зайг тайван, аюулгүй байдлаар бэлтгэж байна."
                : "The Rare Care community area is a simple first step toward future connection spaces for patients, caregivers, and families."}
            </p>
          </article>
          <article className="content-panel is-soft">
            <h2>{dictionary.community.safety}</h2>
            <p>
              {locale === "mn"
                ? "Нууцлал, зохистой хяналт, аюулгүй дүрэмгүйгээр нээлттэй хэлэлцүүлэг эхлүүлэхгүй. Хувийн мэдээллийг хамгийн бага хэмжээнд цуглуулах зарчмыг баримтална."
                : "We will not open broader discussions without moderation, privacy controls, and clearer safety policies. The MVP keeps data collection minimal."}
            </p>
          </article>
          <article className="content-panel">
            <h2>{dictionary.community.future}</h2>
            <p>
              {locale === "mn"
                ? "Дараагийн шатанд өвчний бүлгүүд, нэрээ нууцалсан нийтлэл, профайл болон оролцооны тохиргоо нэмэгдэх боломжтой."
                : "Future phases can add disease-based groups, anonymous posting, profiles, and stronger moderation workflows."}
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
