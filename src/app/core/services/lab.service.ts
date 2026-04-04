import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabProject, LabCategory } from '../models/lab.model';

export interface LabProjectListParams {
  page?: number;
  itemsPerPage?: number;
  'categories.slug'?: string;
  status?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class LabService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  // --- Lab Projects ---

  getProjects(params: LabProjectListParams = {}): Observable<LabProject[]> {
    this._isLoading.set(true);

    let httpParams = new HttpParams().set('includeTranslations', 'true');

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.itemsPerPage) httpParams = httpParams.set('itemsPerPage', params.itemsPerPage.toString());
    if (params['categories.slug']) httpParams = httpParams.set('categories.slug', params['categories.slug']);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<LabProject[]>(`${this.apiUrl}/lab_projects`, { params: httpParams }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getProject(id: string): Observable<LabProject> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<LabProject>(`${this.apiUrl}/lab_projects/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createProject(data: Partial<LabProject>): Observable<LabProject> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<LabProject>(`${this.apiUrl}/lab-projects`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateProject(id: string, data: Partial<LabProject>): Observable<LabProject> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<LabProject>(`${this.apiUrl}/lab-projects/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteProject(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/lab_projects/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Lab Categories ---

  getCategories(): Observable<LabCategory[]> {
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<LabCategory[]>(`${this.apiUrl}/lab_categories`, { params });
  }

  getCategory(id: string): Observable<LabCategory> {
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<LabCategory>(`${this.apiUrl}/lab_categories/${id}`, { params });
  }

  createCategory(data: Partial<LabCategory>): Observable<LabCategory> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<LabCategory>(`${this.apiUrl}/lab_categories`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateCategory(id: string, data: Partial<LabCategory>): Observable<LabCategory> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<LabCategory>(`${this.apiUrl}/lab_categories/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteCategory(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/lab_categories/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
