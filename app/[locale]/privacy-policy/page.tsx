import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function PrivacyPage({
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
            { label: dictionary.footer.privacy }
          ]}
        />
      </div>
      <PageHero
        title={dictionary.legal.privacyTitle}
        description={
          locale === "mn"
            ? "Rare Care нь хэрэглэгчийн мэдээллийг хамгийн бага хэмжээнд, тодорхой зорилгоор, зөвшөөрөлтэйгээр цуглуулна."
            : "Rare Care collects the minimum personal information needed for clear support flows, with consent and purpose limitation."
        }
      />
      <section className="container section prose-panel">
        <p>
          {locale === "mn"
            ? "Хандив болон холбоо барих маягтаар ирсэн мэдээллийг зөвхөн тухайн хүсэлтийн дагуу дотоод бүртгэлд хадгална. Бид картын дэлгэрэнгүй мэдээллийг хадгалахгүй."
            : "Information submitted through donation and contact forms is stored only to manage those requests. We do not store raw card details."}
        </p>
        <p>
          {locale === "mn"
            ? "Ирээдүйн олон нийтийн боломжууд хэрэгжихээс өмнө нэмэлт нууцлал, зохицуулалтын бодлого боловсруулна."
            : "Additional privacy policies will be introduced before broader community features are launched."}
        </p>
      </section>
    </div>
  );
}
