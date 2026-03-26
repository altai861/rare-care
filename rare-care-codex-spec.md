# Rare Care Website — Codex Implementation Spec

## 1. Project Summary

Build a responsive website called **Rare Care** for people with rare diseases in Mongolia.

The platform should provide:
- reliable disease information in Mongolian
- emotional support through Daily Corner and community-oriented content
- events and donation / financial assistance pathways
- a trustworthy, calm, human-centered experience

The capstone paper describes the homepage, disease information flow, Daily Corner, and donation flow as the core prototype areas, and positions the platform around three central needs: information access, emotional support, and financial assistance.

---

## 2. What Codex Should Build

### Core pages
1. Homepage
2. Disease Information listing page
3. Disease Detail page
4. Daily Corner page
5. Donation page
6. Events page
7. Community page
8. Contact Us page
9. Privacy Policy / Disclaimer pages

### Priority order
1. Homepage
2. Disease listing
3. Disease detail
4. Daily Corner
5. Donation
6. Events
7. Community
8. Contact / legal pages

---

## 3. Product Goals

### Primary goals
- Help users browse and understand rare disease information easily
- Present medical content in both simple and more medical forms
- Create a warm, low-stress, trustworthy interface
- Support fundraising and financial assistance pathways
- Leave room for future community features, moderation, and accessibility expansion

### MVP approach
Start with the most important informational and content flows first. Community can be simple in the first version.

---

## 4. Design Direction

Use the provided screenshots as the visual source of truth.

### Visual style
- Primary colors:
  - deep blue header/nav
  - medium blue section panels
  - light blue cards or content areas
  - yellow donation CTA buttons
  - soft gray page background
- Rounded buttons
- Spacious sections
- Friendly illustrations and medical support visuals
- Reusable footer across all pages

### Tone
- trustworthy
- warm
- accessible
- supportive
- non-corporate
- calm and hopeful

### Layout characteristics
- top navigation bar with:
  - Accessibility
  - Events
  - Daily Corner
  - Contact Us
  - language switch
  - search
  - Disease Information
  - Community
  - Donate
  - user/menu icons
- breadcrumbs on inner pages
- footer with grouped navigation links
- desktop-first but fully responsive

---

## 5. Required Pages and Features

## 5.1 Homepage

### Sections
1. Header / navigation
2. Hero banner
3. About Us
4. “How Can Rare Care Help You?” section
5. Events & Daily Corner preview
6. Donation CTA section
7. Footer

### Hero requirements
- large illustrated banner
- mission-oriented copy around:
  - reliable disease information
  - community care
  - financial assistance pathways
  - support for Mongolians living with rare diseases

### About Us
- concise introduction
- should emphasize privacy, trustworthy information, collaboration, and social value

### Help section
Include 4 core actions:
- Find Reliable Disease Information
- Communicate with People / Join Group
- Apply for Financial Assistance
- Discover Helpful Everyday Tips

Each should have a CTA button and route to the appropriate page.

### Events & Daily Corner section
- left block: upcoming event preview
- right block: daily tip / everyday tip preview

### Donation CTA
- quote section
- strong button to donation page

---

## 5.2 Disease Information Listing Page

This should act as the central disease database.

### Features
- page banner / hero
- breadcrumbs
- search input
- category filters
- disease results list or grid

### Filters
- search by disease name
- search by alias / alternative names
- category filtering
- alphabetical sort
- optional pagination

### Disease card structure
Each disease item should include:
- disease name
- alternative names
- short description
- category
- “Learn More” CTA

### Suggested categories
Keep category definitions data-driven. Seed with categories such as:
- Birth defects
- Blood diseases
- Cancer
- Endocrine diseases
- Gastrointestinal diseases
- Genetic diseases
- Infectious diseases
- Kidney diseases
- Neurological diseases
- Respiratory diseases

---

## 5.3 Disease Detail Page

This must be a reusable dynamic page template, not a one-off hardcoded page.

### Header area
- breadcrumbs:
  - Home
  - Disease Information
  - Disease Name
- disease title
- list of alternative names / aliases

### Main information block
Two-column layout:
- left: more medical / technical summary
- right: simpler patient-friendly explanation

### Causes section
- section title
- explanation of likely causes
- card(s) for cause groups such as genetic mutations
- optional visual / illustration area

### Symptoms section
- visually distinct section
- introduction paragraph
- structured symptom table / list

### Symptom item structure
- medical term
- description
- synonyms
- frequency
- body system
- optional severity / frequency indicator

### Disease data model
```ts
type Disease = {
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
  locale: "mn" | "en";
  published: boolean;
  updatedAt: string;
};
```

---

## 5.4 Daily Corner Page

This page should support emotional support content and reflections.

### Features
- breadcrumbs
- multiple daily insight entries
- alternating text/image layout
- decorative dividers or separators

### Each entry should support
- date
- title
- quote or insight
- body text
- reminder title
- reminder body
- image
- optional audio playback link

### Daily Corner data model
```ts
type DailyCornerEntry = {
  id: string;
  date: string;
  title: string;
  quote?: string;
  body: string;
  reminderTitle?: string;
  reminderBody?: string;
  image?: string;
  audioUrl?: string;
  locale: "mn" | "en";
  published: boolean;
};
```

### Accessibility note
Build support for optional audio on entries from the beginning, even if no audio is available initially.

---

## 5.5 Donation Page

The donation page should include a complete form layout similar to the screenshots.

### Required sections
1. Breadcrumbs
2. Introductory support text
3. Donation setup
4. Donor information
5. Payment section
6. Consent and anti-spam area

### Donation setup fields
- One-Time / Monthly
- amount presets:
  - 50
  - 100
  - 250
  - 500
  - 1000
  - Other amount
- dedicate this donation
- write note to us

### Donor information fields
- first name
- last name
- address
- country
- state/province
- city
- postal code
- email
- phone number

### Payment section
- total donation amount
- payment type:
  - Credit Card
  - QPay

### Compliance
- privacy / personal information consent checkbox
- CAPTCHA integration placeholder
- disabled submit button until required conditions are met

### Donation submission model
```ts
type DonationSubmission = {
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
```

### MVP payment behavior
- save donation intent to database
- mock successful payment in development
- keep payment integration abstract so real gateways can be added later

---

## 5.6 Events Page

### Features
- list of events
- poster/image
- title
- date/time
- organizer
- summary
- details page or modal optional
- CTA like “Learn More” or “Register”

### Event model
```ts
type EventItem = {
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
  published: boolean;
};
```

---

## 5.7 Community Page

Keep this simple for MVP.

### MVP version
- welcome section
- privacy and safety message
- explanation of future community purpose
- optionally a “coming soon” state or a simple static support group list

### Future expansion
- moderated discussions
- anonymous posting
- disease-based groups
- user profiles with privacy controls

---

## 5.8 Contact Us Page

### Fields
- name
- email
- subject
- message

### Additional content
- contact email / organization details if available
- simple acknowledgement message after submit

---

## 6. Navigation and Shared UX

### Header
- consistent on all pages
- active link highlighting
- search bar in header
- language switcher
- responsive mobile menu

### Footer
- consistent on all pages
- grouped links
- branding / logo area
- privacy / disclaimer / accessibility links

### Breadcrumbs
Required on:
- Disease listing
- Disease detail
- Daily Corner
- Donation
- Events
- Community
- Contact

---

## 7. Search

### MVP scope
Global search in header should search:
- disease names
- alternative names / aliases

Search results should route to the Disease Information listing page with query/filter applied.

---

## 8. Localization

The project should be built with bilingual support from day one.

### Locales
- Mongolian
- English

### Requirements
- do not hardcode UI strings directly inside components
- organize content by locale
- disease content should be able to exist per locale
- nav, footer, buttons, labels, and form messages should be translatable

---

## 9. Accessibility Requirements

Minimum requirements:
- semantic HTML
- keyboard accessibility
- proper labels for all inputs
- alt text for non-decorative images
- visible focus states
- sufficient contrast
- screen-reader-friendly headings and landmarks
- support optional audio on Daily Corner entries

---

## 10. Content Rules

### Content style
- simple and calm
- medically responsible
- easy to understand
- not alarmist
- supportive to patients and caregivers

### Medical disclaimer
Every disease-related informational area should include a note that the content is educational and does not replace professional medical advice.

### Trust rule
Do not present unsupported medical claims. Structure disease content so references can be attached later.

---

## 11. Does This Project Need a Backend?

## Yes — a backend is recommended.

A purely static frontend can render the pages, but this project includes features that are much easier and safer with server-side functionality.

### Backend is needed for
- donation form submission and payment workflow
- storing donation records
- contact form handling
- search beyond static client filtering if data grows
- future authentication / user accounts
- community features
- protected admin or content-management functions
- event and Daily Corner content management
- disease content storage and updating
- spam protection / CAPTCHA verification
- rate limiting and auditability

### What can be static in early MVP
- homepage sections
- basic disease content seeded from local files
- Daily Corner content seeded from local files
- event preview cards
- disclaimer / legal pages

### Practical recommendation
Build it as a full-stack app from the start, but keep the first version simple:
- server-rendered pages
- database for submissions and content
- seed files for initial disease and Daily Corner content
- mocked payment flow initially

---

## 12. Recommended Full-Stack Framework

## Recommended choice: Next.js + TypeScript

Use **Next.js App Router** as the main full-stack framework.

### Why Next.js fits this project well
- good for content-heavy websites
- supports server-rendered pages
- supports route handlers for API endpoints
- supports server-side mutations via Server Functions / Server Actions
- good for SEO
- easy deployment
- large ecosystem
- React is a strong fit for UI-heavy, component-based pages like these

### Suggested stack
- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui or custom reusable components
- DB: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Forms: React Hook Form
- Auth later: NextAuth/Auth.js or custom auth
- Storage for content/images: local `/public` in MVP, cloud later

### Why not split frontend/backend immediately?
You can, but it adds extra complexity. This app fits well as a single codebase full-stack website first.

---

## 13. Alternative Full-Stack Frameworks

If the team prefers another ecosystem, these are also valid:

### Nuxt
Best if the team prefers Vue. Nuxt includes full-stack capabilities through Nitro and server routes.

### SvelteKit
Best if the team wants a lighter-feeling framework. It supports server-side form actions and server data loading cleanly.

### Laravel
Best if the team strongly prefers PHP and traditional server-rendered application development.

### Recommendation priority
1. Next.js
2. Nuxt
3. SvelteKit
4. Laravel

---

## 14. Suggested Architecture

### Frontend
- route-based pages
- reusable layout and section components
- content-driven rendering
- i18n-ready structure

### Backend
- route handlers / server endpoints
- donation submission processing
- contact form processing
- admin-ready content access layer
- database writes and reads
- CAPTCHA verification
- future auth / moderation support

### Database
Suggested tables:
- diseases
- disease_aliases
- disease_causes
- disease_symptoms
- daily_corner_entries
- events
- donation_submissions
- contact_messages
- users (future)
- community_posts (future)

---

## 15. Suggested Folder Structure

```bash
/app
  /(site)
    /page.tsx
    /disease-information/page.tsx
    /disease-information/[slug]/page.tsx
    /daily-corner/page.tsx
    /donation/page.tsx
    /events/page.tsx
    /community/page.tsx
    /contact/page.tsx
    /privacy-policy/page.tsx
    /disclaimer/page.tsx
/components
  /layout
  /shared
  /disease
  /daily-corner
  /donation
  /events
/lib
  /data
  /db
  /i18n
  /validation
  /utils
/prisma
/public
```

---

## 16. Reusable Components

Build reusable components for:
- Navbar
- Footer
- Breadcrumbs
- Hero banner
- Section heading
- CTA card
- Search input
- Filter sidebar
- Disease card
- Symptom table
- Daily Corner entry card
- Event card
- Donation form group
- Language switcher
- Empty state
- Loading state
- Error state

---

## 17. Non-Functional Requirements

### Performance
- optimize images
- lazy-load noncritical media
- keep pages fast on average mobile networks

### Security
- server-side validation for forms
- sanitize user-generated text
- protect sensitive operations
- do not store raw card data insecurely

### Privacy
- minimize personal data collection
- show consent clearly
- prepare for privacy-first future community features

### Maintainability
- modular code
- typed models
- reusable components
- content separated from presentation

---

## 18. Acceptance Criteria

### Homepage
- matches screenshot structure closely
- all main CTAs navigate correctly
- responsive on desktop and mobile

### Disease listing
- search works
- category filtering works
- dynamic route to disease detail works

### Disease detail
- dynamic template supports multiple diseases
- aliases, summary, causes, and symptoms render correctly

### Daily Corner
- multiple entries display correctly
- optional audio support is present in the model/UI
- alternating layout works

### Donation
- validation works
- submit is disabled until required conditions are met
- donation record persists
- mock payment path works in dev

### Shared
- header/footer consistent
- breadcrumbs present
- bilingual-ready structure exists
- basic accessibility rules are implemented

---

## 19. Implementation Phases

### Phase 1
- initialize project
- set up layout, routing, styling, design tokens
- build navbar/footer/shared components
- implement homepage

### Phase 2
- implement disease listing page
- implement disease detail page
- seed sample disease content

### Phase 3
- implement Daily Corner page
- implement Events page
- add localization structure

### Phase 4
- implement Donation page with backend persistence
- implement Contact page
- add validation and spam protection hooks

### Phase 5
- polish responsiveness
- improve accessibility
- add legal/disclaimer pages
- refine content structure for future admin use

---

## 20. Codex Instructions

Use the screenshots as the main visual guide and build the UI to match them closely.

Use the capstone concept as the source of product intent:
- make information access the strongest feature
- keep the interface warm and patient-friendly
- structure the app for future community and donation growth
- build reusable, data-driven pages
- do not hardcode everything into static components
- keep bilingual support in mind from the start

Build the app as a clean, production-style MVP, not just as a static mockup.
