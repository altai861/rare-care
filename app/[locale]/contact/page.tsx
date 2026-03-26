import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/request";

export default async function ContactPage({
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
            { label: dictionary.nav.contact }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.contact}
        title={dictionary.contact.title}
        description={dictionary.contact.body}
      />
      <section className="container section contact-layout">
        <ContactForm dictionary={dictionary} />
        <aside className="content-panel is-soft">
          <h2>{dictionary.contact.organization}</h2>
          <p>
            {locale === "mn"
              ? "Имэйл: support@rarecare.mn"
              : "Email: support@rarecare.mn"}
          </p>
          <p>
            {locale === "mn"
              ? "Улаанбаатар хот дахь гэр бүл, асран хамгаалагч, сайн дурынхны хамтын сүлжээ."
              : "A collaborative network of families, caregivers, and volunteers based in Ulaanbaatar."}
          </p>
        </aside>
      </section>
    </div>
  );
}
