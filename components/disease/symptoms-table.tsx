import type { Disease } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SymptomsTable({
  disease,
  dictionary
}: {
  disease: Disease;
  dictionary: Dictionary;
}) {
  return (
    <div className="symptoms-table-wrapper">
      <table className="symptoms-table">
        <thead>
          <tr>
            <th>{dictionary.diseases.symptomMedicalTerm}</th>
            <th>{dictionary.diseases.symptomDescription}</th>
            <th>{dictionary.diseases.symptomSynonyms}</th>
            <th>{dictionary.diseases.symptomFrequency}</th>
            <th>{dictionary.diseases.symptomSystem}</th>
          </tr>
        </thead>
        <tbody>
          {disease.symptoms.map((symptom) => (
            <tr key={symptom.medicalTerm}>
              <td>{symptom.medicalTerm}</td>
              <td>{symptom.description}</td>
              <td>{symptom.synonyms?.join(", ") || "-"}</td>
              <td>{symptom.frequency || "-"}</td>
              <td>{symptom.bodySystem || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
