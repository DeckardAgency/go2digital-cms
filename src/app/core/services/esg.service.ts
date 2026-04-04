import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EsgService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  // --- Singleton ---

  getSingleton(): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/singletons/esg-page-content`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateSingleton(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<any>(`${this.apiUrl}/singletons/esg-page-content`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Pillars ---

  getPillars(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/esg_pillars`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getPillar(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/esg_pillars/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createPillar(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/esg_pillars`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updatePillar(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/esg_pillars/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deletePillar(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/esg_pillars/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Cards ---

  getCards(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/esg_cards`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getCard(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/esg_cards/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createCard(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/esg_cards`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateCard(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/esg_cards/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteCard(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/esg_cards/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Vision Badges ---

  getBadges(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/esg_vision_badges`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getBadge(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/esg_vision_badges/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createBadge(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/esg_vision_badges`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateBadge(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/esg_vision_badges/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteBadge(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/esg_vision_badges/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
