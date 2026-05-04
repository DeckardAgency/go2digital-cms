import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class TranslationsService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  list(): Observable<Translation[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('itemsPerPage', '10000');
    return this.http.get<any>(`${this.apiUrl}/translations`, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res['hydra:member'] || res['member'] || [])),
      finalize(() => this._isLoading.set(false))
    );
  }

  create(data: Pick<Translation, 'key' | 'locale' | 'value'>): Observable<Translation> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<Translation>(`${this.apiUrl}/translations`, data, { headers });
  }

  update(id: string, data: Partial<Pick<Translation, 'key' | 'locale' | 'value'>>): Observable<Translation> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<Translation>(`${this.apiUrl}/translations/${id}`, data, { headers });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/translations/${id}`);
  }
}
