import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getMembers(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/team_members`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getMember(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/team_members/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createMember(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/team_members`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateMember(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/team_members/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteMember(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/team_members/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
