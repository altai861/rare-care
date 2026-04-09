import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, finalize, tap, throwError } from 'rxjs';

import { AuthResponse, AuthUser, LoginForm, RegisterForm, UpdateProfileForm } from '../models';
import { Api } from './api';

const authTokenKey = 'rare-care-auth-token';
const authUserKey = 'rare-care-auth-user';

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
      this.clearCachedUser();
      return;
    }

    const cachedUser = this.readCachedUser();
    if (cachedUser) {
      this.userSubject.next(cachedUser);
    }

    this.api.getCurrentUser(this.token).subscribe({
      next: ({ user }) => this.setUser(user),
      error: () => this.clearSession(),
    });
  }

  login(form: LoginForm) {
    return this.api.login(form).pipe(tap((response) => this.saveSession(response)));
  }

  register(form: RegisterForm) {
    return this.api.register(form).pipe(tap((response) => this.saveSession(response)));
  }

  updateProfile(form: UpdateProfileForm) {
    if (!this.token) {
      return throwError(() => new Error('Authentication required.'));
    }

    return this.api
      .updateProfile(this.token, form)
      .pipe(tap(({ user }) => this.setUser(user)));
  }

  updateProfilePhoto(profileImageUrl: string) {
    if (!this.token) {
      return throwError(() => new Error('Authentication required.'));
    }

    return this.api
      .updateProfilePhoto(this.token, profileImageUrl)
      .pipe(tap(({ user }) => this.setUser(user)));
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
    this.setUser(response.user);
  }

  private setUser(user: AuthUser | null) {
    if (user) {
      localStorage.setItem(authUserKey, JSON.stringify(user));
    } else {
      this.clearCachedUser();
    }

    this.userSubject.next(user);
  }

  private readCachedUser() {
    try {
      const raw = localStorage.getItem(authUserKey);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      this.clearCachedUser();
      return null;
    }
  }

  private clearCachedUser() {
    localStorage.removeItem(authUserKey);
  }

  private clearSession() {
    this.token = null;
    localStorage.removeItem(authTokenKey);
    this.setUser(null);
  }
}
