import { Volume2 } from "lucide-react";

import type { DailyCornerEntry } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDisplayDate } from "@/lib/utils";

export function DailyEntry({
  entry,
  index,
  dictionary
}: {
  entry: DailyCornerEntry;
  index: number;
  dictionary: Dictionary;
}) {
  const reversed = index % 2 === 1;

  return (
    <article className={`daily-entry${reversed ? " is-reversed" : ""}`}>
      <div className={`daily-illustration tone-${entry.image ?? "calm"}`}>
        <div className="daily-figure" />
      </div>
      <div className="daily-copy">
        <p className="daily-date">{formatDisplayDate(entry.date, entry.locale)}</p>
        <h2>{entry.title}</h2>
        {entry.quote ? <blockquote>{entry.quote}</blockquote> : null}
        <p>{entry.body}</p>
        {entry.reminderTitle || entry.reminderBody ? (
          <div className="reminder-box">
            {entry.reminderTitle ? <h3>{entry.reminderTitle}</h3> : null}
            {entry.reminderBody ? <p>{entry.reminderBody}</p> : null}
          </div>
        ) : null}
        {entry.audioUrl ? (
          <a className="audio-link" href={entry.audioUrl}>
            <Volume2 size={18} />
            {dictionary.common.audio}
          </a>
        ) : null}
      </div>
    </article>
  );
}
