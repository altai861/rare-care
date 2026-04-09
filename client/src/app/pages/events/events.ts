import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Dictionary, formatDisplayDate } from '../../content';
import { Api } from '../../core/api';
import { Auth } from '../../core/auth';
import { I18n } from '../../core/i18n';
import { EventItem, EventRegistrationForm, Locale } from '../../models';

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);
  private readonly i18n = inject(I18n);
  private readonly subscriptions = new Subscription();

  locale: Locale = this.i18n.locale;
  dictionary: Dictionary = this.i18n.dictionary;
  events: EventItem[] = [];
  activeEventId = '';
  registrationForm: EventRegistrationForm = this.defaultRegistrationForm();
  registrationPending = false;
  registrationFeedback: { status: 'success' | 'error'; message: string } | null = null;

  ngOnInit() {
    this.subscriptions.add(
      this.i18n.locale$.subscribe(() => {
        this.locale = this.i18n.locale;
        this.dictionary = this.i18n.dictionary;
        this.api.getEvents(this.locale).subscribe((events) => (this.events = events));
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  routeTo(path = '') {
    return path || '/';
  }

  formatDate(value: string) {
    return formatDisplayDate(value, this.locale);
  }

  isRegistering(eventId: string) {
    return this.activeEventId === eventId;
  }

  toggleRegistration(event: EventItem) {
    if (this.activeEventId === event.id) {
      this.closeRegistration();
      return;
    }

    this.activeEventId = event.id;
    this.registrationPending = false;
    this.registrationFeedback = null;
    this.registrationForm = this.defaultRegistrationForm();

    if (this.auth.user) {
      this.registrationForm.name = this.auth.user.name;
      this.registrationForm.email = this.auth.user.email;
    }
  }

  closeRegistration() {
    this.activeEventId = '';
    this.registrationPending = false;
    this.registrationFeedback = null;
    this.registrationForm = this.defaultRegistrationForm();
  }

  isRegistrationValid() {
    return (
      this.registrationForm.name.trim().length > 1 &&
      this.registrationForm.email.includes('@') &&
      Number.isFinite(this.registrationForm.attendees) &&
      this.registrationForm.attendees > 0
    );
  }

  submitRegistration(eventId: string) {
    if (!this.isRegistrationValid() || this.activeEventId !== eventId) {
      return;
    }

    this.registrationPending = true;
    this.registrationFeedback = null;
    this.api.createEventRegistration(eventId, this.registrationForm).subscribe({
      next: () => {
        this.registrationFeedback = {
          status: 'success',
          message: this.dictionary.events.success,
        };
        this.registrationPending = false;
        this.registrationForm = this.defaultRegistrationForm();
      },
      error: () => {
        this.registrationFeedback = {
          status: 'error',
          message: this.dictionary.common.submitError,
        };
        this.registrationPending = false;
      },
    });
  }

  private defaultRegistrationForm(): EventRegistrationForm {
    return {
      name: '',
      email: '',
      phone: '',
      attendees: 1,
      note: '',
    };
  }
}
