import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, finalize, tap } from 'rxjs';

import { AuthResponse, AuthUser, LoginForm, RegisterForm } from '../models';
import { Api } from './api';

const authTokenKey = 'rare-care-auth-token';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  private token = localStorage.getItem(authTokenKey);
  private initialized = false;

  readonly user$ = this.userSubject.asObservable();

  get user() {
    return this.userSubject.value;
  }

  get isAuthenticated() {
    return !!this.user;
  }

  initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if (!this.token) {
      return;
    }

    this.api.getCurrentUser(this.token).subscribe({
      next: ({ user }) => this.userSubject.next(user),
      error: () => this.clearSession(),
    });
  }

  login(form: LoginForm) {
    return this.api.login(form).pipe(tap((response) => this.saveSession(response)));
  }

  register(form: RegisterForm) {
    return this.api.register(form).pipe(tap((response) => this.saveSession(response)));
  }

  logout() {
    if (!this.token) {
      this.clearSession();
      return EMPTY;
    }

    return this.api.logout(this.token).pipe(finalize(() => this.clearSession()));
  }

  private saveSession(response: AuthResponse) {
    this.token = response.token;
    localStorage.setItem(authTokenKey, response.token);
    this.userSubject.next(response.user);
  }

  private clearSession() {
    this.token = null;
    localStorage.removeItem(authTokenKey);
    this.userSubject.next(null);
  }
}
