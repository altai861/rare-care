export type Locale = "mn" | "en";

export type Disease = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  category: string;
  shortDescription: string;
  summaryMedical: string;
  summarySimple: string;
  causes: {
    title: string;
    description: string;
    image?: string;
  }[];
  symptoms: {
    medicalTerm: string;
    description: string;
    synonyms?: string[];
    frequency?: string;
    bodySystem?: string;
  }[];
  references?: {
    title: string;
    url: string;
  }[];
  locale: Locale;
  published: boolean;
  updatedAt: string;
};

export type DailyCornerEntry = {
  id: string;
  date: string;
  title: string;
  quote?: string;
  body: string;
  reminderTitle?: string;
  reminderBody?: string;
  image?: string;
  audioUrl?: string;
  locale: Locale;
  published: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  summary: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  organizer?: string;
  location?: string;
  image?: string;
  link?: string;
  locale: Locale;
  published: boolean;
};

export type DonationSubmission = {
  id: string;
  donationType: "one_time" | "monthly";
  amount: number;
  dedicateTo?: string;
  note?: string;
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  stateProvince: string;
  city: string;
  postalCode: string;
  email: string;
  phone?: string;
  paymentType: "credit_card" | "qpay";
  consentAccepted: boolean;
  status: "pending" | "paid" | "failed";
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};
