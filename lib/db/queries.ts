import "server-only";

import crypto from "node:crypto";

import type {
  ContactMessage,
  DailyCornerEntry,
  Disease,
  DonationSubmission,
  EventItem,
  Locale
} from "@/lib/data/types";
import { getDatabase } from "@/lib/db/client";
import { initializeDatabase } from "@/lib/db/init";
import type {
  ContactFormValues,
  DonationFormValues
} from "@/lib/validation/forms";

type DiseaseRow = {
  id: string;
  slug: string;
  locale: Locale;
  name: string;
  aliases: string;
  category: string;
  short_description: string;
  summary_medical: string;
  summary_simple: string;
  causes: string;
  symptoms: string;
  reference_links: string;
  published: number;
  updated_at: string;
};

type DailyRow = {
  id: string;
  locale: Locale;
  date: string;
  title: string;
  quote: string | null;
  body: string;
  reminder_title: string | null;
  reminder_body: string | null;
  image: string | null;
  audio_url: string | null;
  published: number;
};

type EventRow = {
  id: string;
  locale: Locale;
  title: string;
  summary: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  organizer: string | null;
  location: string | null;
  image: string | null;
  link: string | null;
  published: number;
};

function parseDisease(row: DiseaseRow): Disease {
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    name: row.name,
    aliases: JSON.parse(row.aliases),
    category: row.category,
    shortDescription: row.short_description,
    summaryMedical: row.summary_medical,
    summarySimple: row.summary_simple,
    causes: JSON.parse(row.causes),
    symptoms: JSON.parse(row.symptoms),
    references: JSON.parse(row.reference_links),
    published: Boolean(row.published),
    updatedAt: row.updated_at
  };
}

function parseDailyEntry(row: DailyRow): DailyCornerEntry {
  return {
    id: row.id,
    locale: row.locale,
    date: row.date,
    title: row.title,
    quote: row.quote ?? undefined,
    body: row.body,
    reminderTitle: row.reminder_title ?? undefined,
    reminderBody: row.reminder_body ?? undefined,
    image: row.image ?? undefined,
    audioUrl: row.audio_url ?? undefined,
    published: Boolean(row.published)
  };
}

function parseEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    locale: row.locale,
    title: row.title,
    summary: row.summary,
    description: row.description ?? undefined,
    date: row.date,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    organizer: row.organizer ?? undefined,
    location: row.location ?? undefined,
    image: row.image ?? undefined,
    link: row.link ?? undefined,
    published: Boolean(row.published)
  };
}

export function getDiseases(
  locale: Locale,
  {
    query,
    category,
    sort = "name"
  }: {
    query?: string;
    category?: string;
    sort?: "name" | "updated";
  } = {}
) {
  initializeDatabase();
  const db = getDatabase();

  const clauses = ["locale = @locale", "published = 1"];
  const params: Record<string, string> = { locale };

  if (query) {
    clauses.push(
      "(LOWER(name) LIKE @query OR LOWER(aliases) LIKE @query OR LOWER(short_description) LIKE @query)"
    );
    params.query = `%${query.toLowerCase()}%`;
  }

  if (category && category !== "all") {
    clauses.push("category = @category");
    params.category = category;
  }

  const orderBy = sort === "updated" ? "updated_at DESC" : "name COLLATE NOCASE ASC";

  const rows = db
    .prepare(
      `SELECT * FROM diseases WHERE ${clauses.join(" AND ")} ORDER BY ${orderBy}`
    )
    .all(params) as DiseaseRow[];

  return rows.map(parseDisease);
}

export function getDiseaseBySlug(locale: Locale, slug: string) {
  initializeDatabase();
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT * FROM diseases WHERE locale = ? AND slug = ? AND published = 1 LIMIT 1"
    )
    .get(locale, slug) as DiseaseRow | undefined;

  return row ? parseDisease(row) : null;
}

export function getDiseaseCategories(locale: Locale) {
  initializeDatabase();
  const db = getDatabase();
  const rows = db
    .prepare(
      "SELECT DISTINCT category FROM diseases WHERE locale = ? AND published = 1 ORDER BY category COLLATE NOCASE ASC"
    )
    .all(locale) as { category: string }[];

  return rows.map((row) => row.category);
}

export function getDailyCornerEntries(locale: Locale) {
  initializeDatabase();
  const db = getDatabase();
  const rows = db
    .prepare(
      "SELECT * FROM daily_corner_entries WHERE locale = ? AND published = 1 ORDER BY date DESC"
    )
    .all(locale) as DailyRow[];

  return rows.map(parseDailyEntry);
}

export function getUpcomingEvents(locale: Locale) {
  initializeDatabase();
  const db = getDatabase();
  const rows = db
    .prepare(
      "SELECT * FROM events WHERE locale = ? AND published = 1 ORDER BY date ASC"
    )
    .all(locale) as EventRow[];

  return rows.map(parseEvent);
}

export function createDonationSubmission(values: DonationFormValues) {
  initializeDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();
  const status: DonationSubmission["status"] =
    process.env.NODE_ENV === "production" ? "pending" : "paid";
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO donation_submissions (
      id, donation_type, amount, dedicate_to, note, first_name, last_name,
      address, country, state_province, city, postal_code, email, phone,
      payment_type, consent_accepted, status, created_at
    ) VALUES (
      @id, @donationType, @amount, @dedicateTo, @note, @firstName, @lastName,
      @address, @country, @stateProvince, @city, @postalCode, @email, @phone,
      @paymentType, @consentAccepted, @status, @createdAt
    )
  `).run({
    id,
    donationType: values.donationType,
    amount: values.amount,
    dedicateTo: values.dedicateTo || null,
    note: values.note || null,
    firstName: values.firstName,
    lastName: values.lastName,
    address: values.address,
    country: values.country,
    stateProvince: values.stateProvince,
    city: values.city,
    postalCode: values.postalCode,
    email: values.email,
    phone: values.phone || null,
    paymentType: values.paymentType,
    consentAccepted: 1,
    status,
    createdAt: now
  });

  return {
    id,
    status,
    createdAt: now
  };
}

export function createContactMessage(values: ContactFormValues): ContactMessage {
  initializeDatabase();
  const db = getDatabase();
  const contact: ContactMessage = {
    id: crypto.randomUUID(),
    name: values.name,
    email: values.email,
    subject: values.subject,
    message: values.message,
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO contact_messages (id, name, email, subject, message, created_at)
    VALUES (@id, @name, @email, @subject, @message, @createdAt)
  `).run(contact);

  return contact;
}
