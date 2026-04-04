import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NavigationAdminService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getItems(group?: string): Observable<any[]> {
    this._isLoading.set(true);
    let params = new HttpParams().set('includeTranslations', 'true');
    if (group) {
      params = params.set('group', group);
    }

    return this.http.get<any[]>(`${this.apiUrl}/navigation_items`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getItem(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/navigation_items/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createItem(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/navigation_items`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateItem(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/navigation_items/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteItem(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/navigation_items/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
