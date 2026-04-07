import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { Dictionary } from './content';
import { I18n } from './core/i18n';
import { Theme, ThemeMode } from './core/theme';
import { Locale } from './models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  private readonly theme = inject(Theme);
  private readonly subscriptions = new Subscription();

  protected locale: Locale = this.i18n.locale;
  protected dictionary: Dictionary = this.i18n.dictionary;
  protected themeMode: ThemeMode = this.theme.mode;
  protected menuOpen = false;
  protected searchQuery = '';

  protected readonly navTargets = [
    {
      key: 'accessibility',
      path: '/accessibility',
      label: () => this.dictionary.nav.accessibility,
    },
    { key: 'events', path: '/events', label: () => this.dictionary.nav.events },
    { key: 'dailyCorner', path: '/daily-corner', label: () => this.dictionary.nav.dailyCorner },
    { key: 'contact', path: '/contact', label: () => this.dictionary.nav.contact },
    {
      key: 'diseaseInformation',
      path: '/disease-information',
      label: () => this.dictionary.nav.diseaseInformation,
    },
    { key: 'community', path: '/community', label: () => this.dictionary.nav.community },
  ];

  constructor() {
    this.subscriptions.add(
      this.i18n.locale$.subscribe(() => {
        this.locale = this.i18n.locale;
        this.dictionary = this.i18n.dictionary;
      }),
    );

    this.subscriptions.add(
      this.theme.mode$.subscribe(() => {
        this.themeMode = this.theme.mode;
      }),
    );

    this.subscriptions.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        this.menuOpen = false;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected route(path = '') {
    return path || '/';
  }

  protected submitSearch() {
    this.router.navigate([this.route('/disease-information')], {
      queryParams: { query: this.searchQuery || null },
    });
  }

  protected toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  protected toggleLanguage() {
    this.i18n.toggleLocale();
  }

  protected toggleTheme() {
    this.theme.toggleTheme();
  }

  protected languageIcon() {
    return this.locale === 'mn' ? '/mongolia.png' : '/english.png';
  }

  protected themeIcon() {
    return this.themeMode === 'light' ? '/sun.png' : '/moon.png';
  }

  protected nextLanguageLabel() {
    return this.locale === 'mn' ? 'Switch to English' : 'Монгол хэл рүү солих';
  }

  protected nextThemeLabel() {
    return this.themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }
}
