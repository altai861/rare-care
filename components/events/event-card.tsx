import { CalendarDays, MapPin, Users } from "lucide-react";

import type { EventItem } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDisplayDate } from "@/lib/utils";

export function EventCard({
  event,
  dictionary
}: {
  event: EventItem;
  dictionary: Dictionary;
}) {
  return (
    <article className={`event-card tone-${event.image ?? "forum"}`}>
      <div className="event-poster" aria-hidden="true">
        <span>
          {event.image === "fundraiser"
            ? dictionary.nav.donate
            : dictionary.siteName}
        </span>
      </div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p>{event.summary}</p>
        <dl className="event-meta">
          <div>
            <dt>
              <CalendarDays size={16} />
            </dt>
            <dd>
              {formatDisplayDate(event.date, event.locale)}
              {event.startTime ? ` · ${event.startTime}` : ""}
              {event.endTime ? `-${event.endTime}` : ""}
            </dd>
          </div>
          {event.organizer ? (
            <div>
              <dt>
                <Users size={16} />
              </dt>
              <dd>
                {dictionary.events.organizer}: {event.organizer}
              </dd>
            </div>
          ) : null}
          {event.location ? (
            <div>
              <dt>
                <MapPin size={16} />
              </dt>
              <dd>
                {dictionary.events.location}: {event.location}
              </dd>
            </div>
          ) : null}
        </dl>
        <a href={event.link || "#"}>{dictionary.events.register}</a>
      </div>
    </article>
  );
}
