import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SyncStatus {
  totalCities: number;
  totalTotems: number;
  publishedTotems: number;
  unpublishedTotems: number;
  lastSyncedAt: string | null;
}

export interface SyncReport {
  success: boolean;
  report: {
    cities_created: number;
    cities_updated: number;
    totems_created: number;
    totems_updated: number;
    total_cities: number;
    total_totems: number;
  };
  syncedAt: string;
}

export interface SyncLogEntry {
  id: string;
  success: boolean;
  report: any;
  error: string | null;
  durationMs: number;
  triggeredBy: string | null;
  createdAt: string;
}

export interface City {
  id: string;
  cdnCityId: number;
  name: string;
  location: string;
  sortOrder: number;
  isActive: boolean;
  totemCount: number;
  lastSyncedAt: string | null;
}

export interface Totem {
  id: string;
  cdnTotemId: number;
  name: string;
  nameEn: string;
  cityName: string;
  cityId: string;
  totemType: string;
  postbuyCategory: string;
  screenWidth: number;
  screenHeight: number;
  reach: number;
  totemMotion: string;
  sortOrder: number;
  isPublished: boolean;
  isInstalled: boolean;
  lastSyncedAt: string | null;
}

export interface TotemDetail extends Totem {
  description: string;
  descriptionEn: string;
  videoUrl: string;
  isBigScreen: boolean;
  adDuration: number;
  manualOverrides: string[];
  imageFocalX: number | null;
  imageFocalY: number | null;
  imageFocalMobileX: number | null;
  imageFocalMobileY: number | null;
  images: any[] | null;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getSyncStatus(): Observable<SyncStatus> {
    this._isLoading.set(true);
    return this.http.get<SyncStatus>(`${this.apiUrl}/locations/sync-status`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  syncFromCdn(): Observable<SyncReport> {
    this._isLoading.set(true);
    return this.http.post<SyncReport>(`${this.apiUrl}/locations/sync`, {}).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getSyncLogs(): Observable<SyncLogEntry[]> {
    return this.http.get<SyncLogEntry[]>(`${this.apiUrl}/locations/sync-logs`);
  }

  getCities(): Observable<City[]> {
    this._isLoading.set(true);
    return this.http.get<City[]>(`${this.apiUrl}/locations/cities`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateCity(id: string, data: Partial<City>): Observable<City> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<City>(`${this.apiUrl}/locations/cities/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getTotems(cityId?: string): Observable<Totem[]> {
    this._isLoading.set(true);
    let params = new HttpParams();
    if (cityId) params = params.set('cityId', cityId);
    return this.http.get<Totem[]>(`${this.apiUrl}/locations/totems`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getTotem(id: string): Observable<TotemDetail> {
    this._isLoading.set(true);
    return this.http.get<TotemDetail>(`${this.apiUrl}/locations/totems/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateTotem(id: string, data: Partial<TotemDetail>): Observable<TotemDetail> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<TotemDetail>(`${this.apiUrl}/locations/totems/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
