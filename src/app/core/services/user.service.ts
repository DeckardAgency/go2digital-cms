import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserRecord[]> {
    this._isLoading.set(true);
    return this.http.get<UserRecord[]>(`${this.apiUrl}/users`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getUser(id: string): Observable<UserRecord> {
    return this.http.get<UserRecord>(`${this.apiUrl}/users/${id}`);
  }

  createUser(data: CreateUserPayload): Observable<UserRecord> {
    this._isLoading.set(true);
    return this.http.post<UserRecord>(`${this.apiUrl}/users`, data).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateUser(id: string, data: UpdateUserPayload): Observable<UserRecord> {
    this._isLoading.set(true);
    return this.http.put<UserRecord>(`${this.apiUrl}/users/${id}`, data).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  sendPasswordReset(id: string): Observable<{ success: boolean; message: string }> {
    const frontendUrl = window.location.origin;
    return this.http.post<any>(`${this.apiUrl}/users/${id}/send-reset`, { frontendUrl });
  }
}
