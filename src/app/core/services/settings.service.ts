import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Setting {
  id: string;
  key: string;
  value: any;
  group: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    this._isLoading.set(true);

    return this.http.get<Setting[]>(`${this.apiUrl}/settings`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getSetting(id: string): Observable<Setting> {
    this._isLoading.set(true);

    return this.http.get<Setting>(`${this.apiUrl}/settings/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createSetting(data: Partial<Setting>): Observable<Setting> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<Setting>(`${this.apiUrl}/settings`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateSetting(id: string, data: Partial<Setting>): Observable<Setting> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<Setting>(`${this.apiUrl}/settings/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteSetting(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/settings/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
