import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Dictionary, formatDisplayDate } from '../../content';
import { Api } from '../../core/api';
import { I18n } from '../../core/i18n';
import { EventItem, Locale } from '../../models';

@Component({
  selector: 'app-events',
  imports: [CommonModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  private readonly i18n = inject(I18n);
  private readonly subscriptions = new Subscription();

  locale: Locale = this.i18n.locale;
  dictionary: Dictionary = this.i18n.dictionary;
  events: EventItem[] = [];

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
}
