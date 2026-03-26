import Link from "next/link";
import { notFound } from "next/navigation";

import { SymptomsTable } from "@/components/disease/symptoms-table";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import type { Locale } from "@/lib/data/types";
import { getDiseaseBySlug } from "@/lib/db/queries";
import { getDictionary } from "@/lib/i18n/request";
import { formatDisplayDate } from "@/lib/utils";

export default async function DiseaseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const disease = getDiseaseBySlug(locale, slug);

  if (!disease) {
    notFound();
  }

  return (
    <div className="page-stack">
      <div className="container section-tight">
        <Breadcrumbs
          items={[
            { label: dictionary.common.home, href: `/${locale}` },
            {
              label: dictionary.nav.diseaseInformation,
              href: `/${locale}/disease-information`
            },
            { label: disease.name }
          ]}
        />
      </div>
      <PageHero
        title={disease.name}
        description={`${dictionary.diseases.aliases}: ${disease.aliases.join(", ")}`}
      />
      <section className="container section">
        <div className="disease-summary-grid">
          <article className="content-panel">
            <h2>{dictionary.diseases.medicalSummary}</h2>
            <p>{disease.summaryMedical}</p>
          </article>
          <article className="content-panel is-soft">
            <h2>{dictionary.diseases.simpleSummary}</h2>
            <p>{disease.summarySimple}</p>
            <div className="support-aside">
              <strong>{dictionary.diseases.relatedSupport}</strong>
              <p>{dictionary.common.educationalDisclaimer}</p>
            </div>
          </article>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <h2>{dictionary.diseases.causes}</h2>
          <p>{disease.shortDescription}</p>
        </div>
        <div className="cause-grid">
          {disease.causes.map((cause) => (
            <article key={cause.title} className="cause-card">
              <div className="cause-visual" aria-hidden="true" />
              <h3>{cause.title}</h3>
              <p>{cause.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-dark">
        <div className="container">
          <div className="section-heading light">
            <h2>{dictionary.diseases.symptoms}</h2>
            <p>{dictionary.common.educationalDisclaimer}</p>
          </div>
          <SymptomsTable dictionary={dictionary} disease={disease} />
        </div>
      </section>
      <section className="container section">
        <div className="detail-footer-bar">
          <p>
            {dictionary.diseases.updated}: {formatDisplayDate(disease.updatedAt, locale)}
          </p>
          <Link className="secondary-button" href={`/${locale}/donation`}>
            {dictionary.common.makeDonation}
          </Link>
        </div>
      </section>
    </div>
  );
}
