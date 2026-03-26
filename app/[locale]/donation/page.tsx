import { DonationForm } from "@/components/donation/donation-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function DonationPage({
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
            { label: dictionary.nav.donate }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.donate}
        title={dictionary.donation.title}
        description={dictionary.donation.intro}
      />
      <section className="container section">
        <DonationForm dictionary={dictionary} locale={locale} />
      </section>
    </div>
  );
}
