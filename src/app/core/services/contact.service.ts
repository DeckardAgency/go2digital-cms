import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  // --- Contact Infos ---

  getContactInfos(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/contact_infos`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getContactInfo(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/contact_infos/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createContactInfo(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/contact_infos`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateContactInfo(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/contact_infos/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteContactInfo(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/contact_infos/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Social Links ---

  getSocialLinks(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/social_links`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getSocialLink(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/social_links/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createSocialLink(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/social_links`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateSocialLink(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/social_links/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteSocialLink(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/social_links/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
