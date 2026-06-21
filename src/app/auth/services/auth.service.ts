import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginCredentials, LoginResult } from '../models/auth-user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly userStorageKey = 'civil_defense_logged_user';
  private readonly tokenStorageKey = 'civil_defense_mock_token';
  private readonly loginUrl = (environment.apiBaseUrl && environment.apiBaseUrl.trim())
    ? `${environment.apiBaseUrl.replace(/\/$/, '')}/api/Account/login`
    : '/api/Account/login';


  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResult> {
  const payload = {
    userName: credentials.username,
    password: credentials.password
  };

  console.log('LOGIN URL:', this.loginUrl);
  console.log('LOGIN PAYLOAD:', payload);

  return this.http.post<any>(this.loginUrl, payload).pipe(
    map(resp => {
      console.log('LOGIN RESPONSE:', resp);

      const isSuccess =
        resp?.isSuccess ??
        resp?.IsSuccess ??
        resp?.success ??
        resp?.Success ??
        resp?.succeeded ??
        resp?.Succeeded ??
        false;

      const message =
        resp?.message ??
        resp?.Message ??
        '';

      if (!isSuccess) {
        return { success: false, message } as LoginResult;
      }

      const data = resp?.data ?? resp?.Data ?? resp ?? {};

      const token =
        data?.token ??
        data?.Token ??
        data?.accessToken ??
        data?.AccessToken ??
        resp?.token ??
        resp?.Token ??
        resp?.accessToken ??
        resp?.AccessToken;

      const user: AuthUser = {
        username:
          data?.userName ??
          data?.UserName ??
          data?.username ??
          data?.Username ??
          credentials.username,

        role:
          data?.role ??
          data?.Role ??
          '',

        token: token,

        accessTokenExpiresAt:
          data?.accessTokenExpiresAt ??
          data?.AccessTokenExpiresAt
      };

      try {
        localStorage.setItem(this.userStorageKey, JSON.stringify(user));

        if (token) {
          localStorage.setItem(this.tokenStorageKey, token);
        }
      } catch {}

      this.currentUserSubject.next(user);

      return { success: true, message, user } as LoginResult;
    }),
    catchError(err => {
      console.error('LOGIN ERROR:', err);

      const defaultMsg = 'تعذر الاتصال بخادم المصادقة';
      const message =
        err?.error?.message ??
        err?.error?.Message ??
        err?.message ??
        defaultMsg;

      return of({ success: false, message } as LoginResult);
    })
  );
}

  logout(): void {
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenStorageKey) && !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): AuthUser | null {
    const storedUser = localStorage.getItem(this.userStorageKey);
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userStorageKey);
      localStorage.removeItem(this.tokenStorageKey);
      return null;
    }
  }
}
