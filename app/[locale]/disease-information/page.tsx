import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHero } from "@/components/shared/page-hero";
import { DiseaseCard } from "@/components/disease/disease-card";
import type { Locale } from "@/lib/data/types";
import { getDiseaseCategories, getDiseases } from "@/lib/db/queries";
import { getDictionary } from "@/lib/i18n/request";

export default async function DiseaseInformationPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    query?: string;
    category?: string;
    sort?: "name" | "updated";
  }>;
}) {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = localeParam as Locale;
  const dictionary = getDictionary(locale);
  const diseases = getDiseases(locale, {
    query: resolvedSearchParams?.query,
    category: resolvedSearchParams?.category,
    sort: resolvedSearchParams?.sort || "name"
  });
  const categories = getDiseaseCategories(locale);

  return (
    <div className="page-stack">
      <div className="container section-tight">
        <Breadcrumbs
          items={[
            { label: dictionary.common.home, href: `/${locale}` },
            { label: dictionary.nav.diseaseInformation }
          ]}
        />
      </div>
      <PageHero
        eyebrow={dictionary.nav.diseaseInformation}
        title={dictionary.diseases.listingTitle}
        description={dictionary.diseases.listingBody}
      />
      <section className="container section">
        <form className="filter-panel" method="GET">
          <div className="field-group">
            <label htmlFor="query">{dictionary.diseases.searchLabel}</label>
            <input
              defaultValue={resolvedSearchParams?.query || ""}
              id="query"
              name="query"
              placeholder={dictionary.nav.searchPlaceholder}
              type="search"
            />
          </div>
          <div className="field-group">
            <label htmlFor="category">{dictionary.diseases.categoryLabel}</label>
            <select
              defaultValue={resolvedSearchParams?.category || "all"}
              id="category"
              name="category"
            >
              <option value="all">{dictionary.common.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="sort">{dictionary.diseases.sortLabel}</label>
            <select
              defaultValue={resolvedSearchParams?.sort || "name"}
              id="sort"
              name="sort"
            >
              <option value="name">{dictionary.diseases.sortName}</option>
              <option value="updated">{dictionary.diseases.sortUpdated}</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="primary-button" type="submit">
              {dictionary.common.search}
            </button>
            <a className="secondary-button" href={`/${locale}/disease-information`}>
              {dictionary.common.reset}
            </a>
          </div>
        </form>
        <p className="disclaimer-note">{dictionary.common.educationalDisclaimer}</p>
        {diseases.length ? (
          <div className="disease-grid">
            {diseases.map((disease) => (
              <DiseaseCard
                key={`${disease.slug}-${disease.locale}`}
                dictionary={dictionary}
                disease={disease}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">{dictionary.common.noResults}</div>
        )}
      </section>
    </div>
  );
}
