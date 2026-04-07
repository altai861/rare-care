import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Dictionary } from '../../content';
import { I18n } from '../../core/i18n';
import { Locale } from '../../models';

@Component({
  selector: 'app-community',
  imports: [CommonModule, RouterLink],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class Community implements OnInit, OnDestroy {
  private readonly i18n = inject(I18n);
  private readonly subscriptions = new Subscription();

  locale: Locale = this.i18n.locale;
  dictionary: Dictionary = this.i18n.dictionary;

  ngOnInit() {
    this.subscriptions.add(
      this.i18n.locale$.subscribe(() => {
        this.locale = this.i18n.locale;
        this.dictionary = this.i18n.dictionary;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  routeTo(path = '') {
    return path || '/';
  }
}
