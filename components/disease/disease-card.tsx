import Link from "next/link";

import type { Disease, Locale } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function DiseaseCard({
  disease,
  locale,
  dictionary
}: {
  disease: Disease;
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <article className="disease-card">
      <div className="pill">{disease.category}</div>
      <h3>{disease.name}</h3>
      <p className="aliases">
        <strong>{dictionary.diseases.aliases}:</strong> {disease.aliases.join(", ")}
      </p>
      <p>{disease.shortDescription}</p>
      <Link href={`/${locale}/disease-information/${disease.slug}`}>
        {dictionary.common.learnMore}
      </Link>
    </article>
  );
}
