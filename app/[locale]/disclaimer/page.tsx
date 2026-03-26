import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function DisclaimerPage({
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
            { label: dictionary.footer.disclaimer }
          ]}
        />
      </div>
      <PageHero
        title={dictionary.legal.disclaimerTitle}
        description={dictionary.common.educationalDisclaimer}
      />
      <section className="container section prose-panel">
        <p>
          {locale === "mn"
            ? "Rare Care дээрх өвчний тайлбар, шинж тэмдэг, өдөр тутмын зөвлөгөө нь боловсролын зорилготой. Оношилгоо, эмчилгээ, эмийн зөвлөгөөг зөвхөн эмч мэргэжилтэн өгнө."
            : "Disease descriptions, symptom summaries, and daily support content on Rare Care are educational. Diagnosis, treatment, and medication guidance should come from a licensed clinician."}
        </p>
        <p>
          {locale === "mn"
            ? "Шинж тэмдэг хүчтэй өөрчлөгдөх, шинэ зовиур нэмэгдэх, эсвэл яаралтай тусламж хэрэгтэй санагдвал эмнэлгийн байгууллагад шууд хандана уу."
            : "If symptoms change suddenly, new urgent concerns appear, or emergency care may be needed, seek direct medical attention."}
        </p>
      </section>
    </div>
  );
}
