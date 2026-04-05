import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, finalize, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Setting {
  id: string;
  key: string;
  value: any;
  group: string;
}

export interface BackupInfo {
  filename: string;
  size: string;
  date: string;
}

export interface SystemInfo {
  php: string;
  symfony: string;
  environment: string;
  debug: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    this._isLoading.set(true);
    return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
      map(res => Array.isArray(res) ? res : (res['hydra:member'] || res['member'] || [])),
      finalize(() => this._isLoading.set(false))
    );
  }

  getSetting(id: string): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/settings/${id}`);
  }

  createSetting(data: Partial<Setting>): Observable<Setting> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<Setting>(`${this.apiUrl}/settings`, data, { headers });
  }

  updateSetting(id: string, data: Partial<Setting>): Observable<Setting> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<Setting>(`${this.apiUrl}/settings/${id}`, data, { headers });
  }

  deleteSetting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/settings/${id}`);
  }

  // Maintenance
  clearCache(): Observable<{ success: boolean; output: string }> {
    return this.http.post<any>(`${this.apiUrl}/maintenance/cache/clear`, {});
  }

  warmupCache(): Observable<{ success: boolean; output: string }> {
    return this.http.post<any>(`${this.apiUrl}/maintenance/cache/warmup`, {});
  }

  createBackup(): Observable<{ success: boolean; filename: string; size: string }> {
    return this.http.post<any>(`${this.apiUrl}/maintenance/database/backup`, {});
  }

  listBackups(): Observable<BackupInfo[]> {
    return this.http.get<BackupInfo[]>(`${this.apiUrl}/maintenance/database/backups`);
  }

  getSystemInfo(): Observable<SystemInfo> {
    return this.http.get<SystemInfo>(`${this.apiUrl}/maintenance/info`);
  }
}
