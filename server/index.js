import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { readDatabase, writeDatabase } from './store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const validLocales = new Set(['mn', 'en']);
const maxProfileImageBytes = 4 * 1024 * 1024;
const profileImageMountPath = '/media/profile-images';
const profileImagesDir = join(__dirname, 'data', 'profile-images');
const supportedProfileImageExtensions = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));
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

function normalizedEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail(value));
}

function ensureAuthCollections(db) {
  db.users ??= [];
  db.authSessions ??= [];
  return db;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl || '',
    createdAt: user.createdAt
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');
  if (!salt || !originalHash) {
    return false;
  }

  try {
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derivedKey, 'hex'));
  } catch {
    return false;
  }
}

function readAuthToken(request) {
  const directToken = request.get('x-auth-token');
  if (directToken) {
    return directToken;
  }

  const authorization = request.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return '';
}

function isStoredProfileImage(value) {
  return String(value || '').startsWith(`${profileImageMountPath}/`);
}

async function deleteStoredProfileImage(imageUrl) {
  if (!isStoredProfileImage(imageUrl)) {
    return;
  }

  const fileName = basename(String(imageUrl || '').slice(profileImageMountPath.length));
  if (!fileName) {
    return;
  }

  try {
    await unlink(join(profileImagesDir, fileName));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function saveProfileImage(dataUrl, userId) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) {
    return null;
  }

  const [, mimeType, base64Data] = match;
  const extension = supportedProfileImageExtensions[mimeType.toLowerCase()];
  if (!extension) {
    return null;
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (!buffer.length || buffer.length > maxProfileImageBytes) {
    return null;
  }

  await mkdir(profileImagesDir, { recursive: true });

  const fileName = `${userId}-${crypto.randomUUID()}.${extension}`;
  await writeFile(join(profileImagesDir, fileName), buffer);
  return `${profileImageMountPath}/${fileName}`;
}

async function persistUserProfileImage(user, profileImageUrl) {
  const previousProfileImageUrl = user.profileImageUrl || '';
  const nextProfileImageValue = String(profileImageUrl || '').trim();

  if (!nextProfileImageValue) {
    user.profileImageUrl = '';
    await deleteStoredProfileImage(previousProfileImageUrl);
    return user.profileImageUrl;
  }

  if (nextProfileImageValue.startsWith('data:')) {
    const storedProfileImageUrl = await saveProfileImage(nextProfileImageValue, user.id);
    if (!storedProfileImageUrl) {
      throw new Error('INVALID_PROFILE_IMAGE');
    }

    user.profileImageUrl = storedProfileImageUrl;
    if (storedProfileImageUrl !== previousProfileImageUrl) {
      await deleteStoredProfileImage(previousProfileImageUrl);
    }
    return user.profileImageUrl;
  }

  user.profileImageUrl = nextProfileImageValue;
  return user.profileImageUrl;
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

app.post('/api/events/:id/registrations', async (request, response) => {
  const body = request.body || {};
  const attendees = Number(body.attendees);
  const db = await readDatabase();
  db.eventRegistrations ??= [];

  const event = db.events.find((item) => item.id === request.params.id && item.published);
  if (!event) {
    response.status(404).json({ message: 'Event not found.' });
    return;
  }

  if (
    !requiredString(body, 'name', 2) ||
    !requiredString(body, 'email', 5) ||
    !validEmail(body.email) ||
    !Number.isFinite(attendees) ||
    attendees < 1
  ) {
    response.status(400).json({ message: 'Please complete the required event registration fields.' });
    return;
  }

  const registration = {
    id: `event-registration-${crypto.randomUUID()}`,
    eventId: event.id,
    eventTitle: event.title,
    locale: event.locale,
    name: body.name.trim(),
    email: normalizedEmail(body.email),
    phone: String(body.phone || '').trim(),
    attendees,
    note: String(body.note || '').trim(),
    createdAt: new Date().toISOString()
  };

  db.eventRegistrations.push(registration);
  await writeDatabase(db);

  response.status(201).json({ id: registration.id, createdAt: registration.createdAt });
});

app.post('/api/auth/register', async (request, response) => {
  const body = request.body || {};
  const email = normalizedEmail(body.email);

  if (!requiredString(body, 'name', 2) || !validEmail(email) || !requiredString(body, 'password', 8)) {
    response.status(400).json({ message: 'Please complete the required registration fields.' });
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  const existingUser = db.users.find((user) => user.email === email);

  if (existingUser) {
    response.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const user = {
    id: `user-${crypto.randomUUID()}`,
    name: body.name.trim(),
    email,
    profileImageUrl: '',
    passwordHash: hashPassword(body.password),
    createdAt: new Date().toISOString()
  };
  const session = {
    id: `session-${crypto.randomUUID()}`,
    userId: user.id,
    token: crypto.randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  db.authSessions = db.authSessions.filter((item) => item.userId !== user.id);
  db.authSessions.push(session);
  await writeDatabase(db);

  response.status(201).json({ token: session.token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (request, response) => {
  const body = request.body || {};
  const email = normalizedEmail(body.email);

  if (!validEmail(email) || !requiredString(body, 'password', 8)) {
    response.status(400).json({ message: 'Please enter a valid email and password.' });
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  const user = db.users.find((item) => item.email === email);

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    response.status(401).json({ message: 'Incorrect email or password.' });
    return;
  }

  const session = {
    id: `session-${crypto.randomUUID()}`,
    userId: user.id,
    token: crypto.randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString()
  };

  db.authSessions = db.authSessions.filter((item) => item.userId !== user.id);
  db.authSessions.push(session);
  await writeDatabase(db);

  response.json({ token: session.token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', async (request, response) => {
  const token = readAuthToken(request);
  if (!token) {
    response.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  const session = db.authSessions.find((item) => item.token === token);
  const user = session ? db.users.find((item) => item.id === session.userId) : null;

  if (!user) {
    response.status(401).json({ message: 'Session not found.' });
    return;
  }

  response.json({ user: sanitizeUser(user) });
});

app.patch('/api/auth/profile', async (request, response) => {
  const token = readAuthToken(request);
  if (!token) {
    response.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const body = request.body || {};
  if (!requiredString(body, 'name', 2)) {
    response.status(400).json({ message: 'Please complete the required profile fields.' });
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  const session = db.authSessions.find((item) => item.token === token);
  const user = session ? db.users.find((item) => item.id === session.userId) : null;

  if (!user) {
    response.status(401).json({ message: 'Session not found.' });
    return;
  }

  user.name = body.name.trim();
  if (typeof body.profileImageUrl === 'string') {
    try {
      await persistUserProfileImage(user, body.profileImageUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_PROFILE_IMAGE') {
        response.status(400).json({ message: 'Please upload a valid profile image.' });
        return;
      }

      throw error;
    }
  }

  await writeDatabase(db);
  response.json({ user: sanitizeUser(user) });
});

app.patch('/api/auth/profile/photo', async (request, response) => {
  const token = readAuthToken(request);
  if (!token) {
    response.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const body = request.body || {};
  if (typeof body.profileImageUrl !== 'string') {
    response.status(400).json({ message: 'Please upload a valid profile image.' });
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  const session = db.authSessions.find((item) => item.token === token);
  const user = session ? db.users.find((item) => item.id === session.userId) : null;

  if (!user) {
    response.status(401).json({ message: 'Session not found.' });
    return;
  }

  try {
    await persistUserProfileImage(user, body.profileImageUrl);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PROFILE_IMAGE') {
      response.status(400).json({ message: 'Please upload a valid profile image.' });
      return;
    }

    throw error;
  }

  await writeDatabase(db);
  response.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', async (request, response) => {
  const token = readAuthToken(request);
  if (!token) {
    response.status(204).end();
    return;
  }

  const db = ensureAuthCollections(await readDatabase());
  db.authSessions = db.authSessions.filter((item) => item.token !== token);
  await writeDatabase(db);

  response.status(204).end();
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

app.use(profileImageMountPath, express.static(profileImagesDir));

if (existsSync(angularDist)) {
  app.use(express.static(angularDist));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(join(angularDist, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Rare Care Express API listening on http://localhost:${port}`);
});
