import "server-only";

import { getDatabase } from "@/lib/db/client";
import { dailyCornerSeeds, diseaseSeeds, eventSeeds } from "@/lib/data/seed";

let initialized = false;

export function initializeDatabase() {
  if (initialized) {
    return;
  }

  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS diseases (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      locale TEXT NOT NULL,
      name TEXT NOT NULL,
      aliases TEXT NOT NULL,
      category TEXT NOT NULL,
      short_description TEXT NOT NULL,
      summary_medical TEXT NOT NULL,
      summary_simple TEXT NOT NULL,
      causes TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      reference_links TEXT NOT NULL,
      published INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_diseases_slug_locale
      ON diseases (slug, locale);

    CREATE TABLE IF NOT EXISTS daily_corner_entries (
      id TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      quote TEXT,
      body TEXT NOT NULL,
      reminder_title TEXT,
      reminder_body TEXT,
      image TEXT,
      audio_url TEXT,
      published INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_daily_corner_locale_date
      ON daily_corner_entries (locale, date DESC);

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      organizer TEXT,
      location TEXT,
      image TEXT,
      link TEXT,
      published INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_locale_date
      ON events (locale, date ASC);

    CREATE TABLE IF NOT EXISTS donation_submissions (
      id TEXT PRIMARY KEY,
      donation_type TEXT NOT NULL,
      amount REAL NOT NULL,
      dedicate_to TEXT,
      note TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address TEXT NOT NULL,
      country TEXT NOT NULL,
      state_province TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      payment_type TEXT NOT NULL,
      consent_accepted INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users (email);

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_user_sessions_token
      ON user_sessions (token_hash);
  `);

  const diseaseCount =
    (db.prepare("SELECT COUNT(*) as count FROM diseases").get() as {
      count: number;
    }).count ?? 0;

  if (diseaseCount === 0) {
    const insertDisease = db.prepare(`
      INSERT INTO diseases (
        id, slug, locale, name, aliases, category, short_description,
        summary_medical, summary_simple, causes, symptoms, reference_links,
        published, updated_at
      ) VALUES (
        @id, @slug, @locale, @name, @aliases, @category, @shortDescription,
        @summaryMedical, @summarySimple, @causes, @symptoms, @references,
        @published, @updatedAt
      )
    `);

    const insertDaily = db.prepare(`
      INSERT INTO daily_corner_entries (
        id, locale, date, title, quote, body, reminder_title, reminder_body,
        image, audio_url, published
      ) VALUES (
        @id, @locale, @date, @title, @quote, @body, @reminderTitle,
        @reminderBody, @image, @audioUrl, @published
      )
    `);

    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, locale, title, summary, description, date, start_time, end_time,
        organizer, location, image, link, published
      ) VALUES (
        @id, @locale, @title, @summary, @description, @date, @startTime,
        @endTime, @organizer, @location, @image, @link, @published
      )
    `);

    const seedTransaction = db.transaction(() => {
      for (const disease of diseaseSeeds) {
        insertDisease.run({
          ...disease,
          aliases: JSON.stringify(disease.aliases),
          causes: JSON.stringify(disease.causes),
          symptoms: JSON.stringify(disease.symptoms),
          references: JSON.stringify(disease.references ?? []),
          published: disease.published ? 1 : 0
        });
      }

      for (const entry of dailyCornerSeeds) {
        insertDaily.run({
          ...entry,
          quote: entry.quote ?? null,
          reminderTitle: entry.reminderTitle ?? null,
          reminderBody: entry.reminderBody ?? null,
          image: entry.image ?? null,
          audioUrl: entry.audioUrl ?? null,
          published: entry.published ? 1 : 0
        });
      }

      for (const event of eventSeeds) {
        insertEvent.run({
          ...event,
          description: event.description ?? null,
          startTime: event.startTime ?? null,
          endTime: event.endTime ?? null,
          organizer: event.organizer ?? null,
          location: event.location ?? null,
          image: event.image ?? null,
          link: event.link ?? null,
          published: event.published ? 1 : 0
        });
      }
    });

    seedTransaction();
  }

  initialized = true;
}
