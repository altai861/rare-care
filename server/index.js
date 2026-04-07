import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { readDatabase, writeDatabase } from './store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const validLocales = new Set(['mn', 'en']);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

function resolveLocale(value) {
  return validLocales.has(value) ? value : 'mn';
}

function publicOnly(items, locale) {
  return items.filter((item) => item.locale === locale && item.published);
}

function requiredString(body, field, minLength = 1) {
  return typeof body[field] === 'string' && body[field].trim().length >= minLength;
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, app: 'rare-care', database: 'json-file' });
});

app.get('/api/diseases', async (request, response) => {
  const db = await readDatabase();
  const locale = resolveLocale(String(request.query.locale || 'mn'));
  const query = String(request.query.query || '').trim().toLowerCase();
  const category = String(request.query.category || 'all');
  const sort = String(request.query.sort || 'name');

  let diseases = publicOnly(db.diseases, locale);

  if (query) {
    diseases = diseases.filter((disease) => {
      const searchable = [
        disease.name,
        disease.shortDescription,
        disease.category,
        ...(disease.aliases || [])
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }

  if (category && category !== 'all') {
    diseases = diseases.filter((disease) => disease.category === category);
  }

  diseases.sort((left, right) => {
    if (sort === 'updated') {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }

    return left.name.localeCompare(right.name, locale);
  });

  response.json(diseases);
});

app.get('/api/diseases/categories', async (request, response) => {
  const db = await readDatabase();
  const locale = resolveLocale(String(request.query.locale || 'mn'));
  const categories = [...new Set(publicOnly(db.diseases, locale).map((disease) => disease.category))]
    .sort((left, right) => left.localeCompare(right, locale));

  response.json(categories);
});

app.get('/api/diseases/:locale/:slug', async (request, response) => {
  const db = await readDatabase();
  const locale = resolveLocale(request.params.locale);
  const disease = publicOnly(db.diseases, locale).find((item) => item.slug === request.params.slug);

  if (!disease) {
    response.status(404).json({ message: 'Disease not found.' });
    return;
  }

  response.json(disease);
});

app.get('/api/daily-corner', async (request, response) => {
  const db = await readDatabase();
  const locale = resolveLocale(String(request.query.locale || 'mn'));
  const entries = publicOnly(db.dailyCornerEntries, locale).sort((left, right) => right.date.localeCompare(left.date));

  response.json(entries);
});

app.get('/api/events', async (request, response) => {
  const db = await readDatabase();
  const locale = resolveLocale(String(request.query.locale || 'mn'));
  const events = publicOnly(db.events, locale).sort((left, right) => left.date.localeCompare(right.date));

  response.json(events);
});

app.post('/api/donations', async (request, response) => {
  const body = request.body || {};
  const amount = Number(body.amount);
  const validDonationType = ['one_time', 'monthly'].includes(body.donationType);
  const validPaymentType = ['credit_card', 'qpay'].includes(body.paymentType);

  if (
    !validDonationType ||
    !Number.isFinite(amount) ||
    amount < 1 ||
    !validPaymentType ||
    !body.consentAccepted ||
    !body.captchaPassed ||
    !requiredString(body, 'firstName', 2) ||
    !requiredString(body, 'lastName', 2) ||
    !requiredString(body, 'address', 5) ||
    !requiredString(body, 'country', 2) ||
    !requiredString(body, 'stateProvince', 2) ||
    !requiredString(body, 'city', 2) ||
    !requiredString(body, 'postalCode', 2) ||
    !requiredString(body, 'email', 5)
  ) {
    response.status(400).json({ message: 'Please complete the required donation fields.' });
    return;
  }

  const db = await readDatabase();
  const donation = {
    id: `donation-${crypto.randomUUID()}`,
    donationType: body.donationType,
    amount,
    dedicateTo: body.dedicateTo || '',
    note: body.note || '',
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    address: body.address.trim(),
    country: body.country.trim(),
    stateProvince: body.stateProvince.trim(),
    city: body.city.trim(),
    postalCode: body.postalCode.trim(),
    email: body.email.trim(),
    phone: body.phone || '',
    paymentType: body.paymentType,
    consentAccepted: true,
    status: process.env.NODE_ENV === 'production' ? 'pending' : 'paid',
    createdAt: new Date().toISOString()
  };

  db.donationSubmissions.push(donation);
  await writeDatabase(db);

  response.status(201).json({ id: donation.id, status: donation.status, createdAt: donation.createdAt });
});

app.post('/api/contact', async (request, response) => {
  const body = request.body || {};

  if (
    !requiredString(body, 'name', 2) ||
    !requiredString(body, 'email', 5) ||
    !requiredString(body, 'subject', 3) ||
    !requiredString(body, 'message', 10)
  ) {
    response.status(400).json({ message: 'Please complete the required contact fields.' });
    return;
  }

  const db = await readDatabase();
  const contact = {
    id: `contact-${crypto.randomUUID()}`,
    name: body.name.trim(),
    email: body.email.trim(),
    subject: body.subject.trim(),
    message: body.message.trim(),
    createdAt: new Date().toISOString()
  };

  db.contactMessages.push(contact);
  await writeDatabase(db);

  response.status(201).json(contact);
});

const angularDist = join(__dirname, 'public', 'browser');

if (existsSync(angularDist)) {
  app.use(express.static(angularDist));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(join(angularDist, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Rare Care Express API listening on http://localhost:${port}`);
});
