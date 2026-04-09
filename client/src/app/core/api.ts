import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import {
  AuthResponse,
  AuthUser,
  ContactForm,
  DailyCornerEntry,
  Disease,
  DonationForm,
  EventItem,
  EventRegistrationForm,
  Locale,
  LoginForm,
  RegisterForm,
  UpdateProfileForm,
} from '../models';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  getDiseases(locale: Locale, filters: { query?: string; category?: string; sort?: string } = {}) {
    let params = new HttpParams().set('locale', locale);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<Disease[]>('/api/diseases', { params });
  }

  getDiseaseCategories(locale: Locale) {
    return this.http.get<string[]>('/api/diseases/categories', { params: { locale } });
  }

  getDisease(locale: Locale, slug: string) {
    return this.http.get<Disease>(`/api/diseases/${locale}/${slug}`);
  }

  getDailyCornerEntries(locale: Locale) {
    return this.http.get<DailyCornerEntry[]>('/api/daily-corner', { params: { locale } });
  }

  getEvents(locale: Locale) {
    return this.http.get<EventItem[]>('/api/events', { params: { locale } });
  }

  createEventRegistration(eventId: string, form: EventRegistrationForm) {
    return this.http.post<{ id: string; createdAt: string }>(
      `/api/events/${eventId}/registrations`,
      form,
    );
  }

  createDonation(form: DonationForm) {
    return this.http.post<{ id: string; status: string; createdAt: string }>(
      '/api/donations',
      form,
    );
  }

  createContactMessage(form: ContactForm) {
    return this.http.post<ContactForm & { id: string; createdAt: string }>('/api/contact', form);
  }

  register(form: RegisterForm) {
    return this.http.post<AuthResponse>('/api/auth/register', form);
  }

  login(form: LoginForm) {
    return this.http.post<AuthResponse>('/api/auth/login', form);
  }

  updateProfile(token: string, form: UpdateProfileForm) {
    return this.http.patch<{ user: AuthUser }>('/api/auth/profile', form, {
      headers: { 'x-auth-token': token },
    });
  }

  updateProfilePhoto(token: string, profileImageUrl: string) {
    return this.http.patch<{ user: AuthUser }>(
      '/api/auth/profile/photo',
      { profileImageUrl },
      {
        headers: { 'x-auth-token': token },
      },
    );
  }

  getCurrentUser(token: string) {
    return this.http.get<{ user: AuthUser }>('/api/auth/me', {
      headers: { 'x-auth-token': token },
    });
  }

  logout(token: string) {
    return this.http.post<void>(
      '/api/auth/logout',
      {},
      {
        headers: { 'x-auth-token': token },
      },
    );
  }
}
