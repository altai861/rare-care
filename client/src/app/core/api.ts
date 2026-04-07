import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ContactForm, DailyCornerEntry, Disease, DonationForm, EventItem, Locale } from '../models';

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

  createDonation(form: DonationForm) {
    return this.http.post<{ id: string; status: string; createdAt: string }>(
      '/api/donations',
      form,
    );
  }

  createContactMessage(form: ContactForm) {
    return this.http.post<ContactForm & { id: string; createdAt: string }>('/api/contact', form);
  }
}
