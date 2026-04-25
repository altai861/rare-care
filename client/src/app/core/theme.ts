import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const storageKey = 'rare-care-theme';
const darkClass = 'dark-theme';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly modeSubject = new BehaviorSubject<ThemeMode>(this.initialTheme());
  readonly mode$ = this.modeSubject.asObservable();

  get mode(): ThemeMode {
    return this.modeSubject.value;
  }

  toggleTheme() {
    this.setTheme(this.mode === 'light' ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode) {
    this.modeSubject.next(mode);
    localStorage.setItem(storageKey, mode);
    this.applyTheme(mode);
  }

  private initialTheme(): ThemeMode {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      this.applyTheme(stored);
      return stored;
    }

    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = prefersDark ? 'dark' : 'light';
    this.applyTheme(mode);
    return mode;
  }

  private applyTheme(mode: ThemeMode) {
    document.documentElement.classList.toggle(darkClass, mode === 'dark');
  }
}
