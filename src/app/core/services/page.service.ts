import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PageService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getPages(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/pages`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getPage(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/pages/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createPage(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/pages`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updatePage(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/pages/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deletePage(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/pages/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
