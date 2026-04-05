import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  private _user = signal<UserInfo | null>(null);
  private _isAuthenticated = signal(false);

  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        this._user.set(JSON.parse(userStr));
        this._isAuthenticated.set(true);
      } catch {
        this.clearStorage();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
        this._isAuthenticated.set(true);
      }),
      switchMap(() => this.fetchUser()),
      switchMap(() => {
        // Return the original login response
        const token = this.getToken()!;
        const refreshToken = localStorage.getItem(this.REFRESH_KEY)!;
        return [{ token, refreshToken }];
      })
    );
  }

  fetchUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => [{ token: token!, refreshToken: '' }])
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    const refreshToken = localStorage.getItem(this.REFRESH_KEY);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.isRefreshing = false;
        localStorage.setItem(this.TOKEN_KEY, response.token);
        if (response.refreshToken) {
          localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
        }
        this.refreshSubject.next(response.token);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this._user()?.roles?.includes('ROLE_ADMIN') ?? false;
  }

  isSuperAdmin(): boolean {
    return this._user()?.roles?.includes('ROLE_SUPER_ADMIN') ?? false;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
