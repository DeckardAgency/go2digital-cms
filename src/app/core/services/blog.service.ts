import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BlogPost, BlogCategory } from '../models/blog.model';

export interface BlogPostListParams {
  page?: number;
  itemsPerPage?: number;
  'category.slug'?: string;
  status?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  // --- Blog Posts ---

  getPosts(params: BlogPostListParams = {}): Observable<BlogPost[]> {
    this._isLoading.set(true);

    let httpParams = new HttpParams().set('includeTranslations', 'true');

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.itemsPerPage) httpParams = httpParams.set('itemsPerPage', params.itemsPerPage.toString());
    if (params['category.slug']) httpParams = httpParams.set('category.slug', params['category.slug']);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<BlogPost[]>(`${this.apiUrl}/blog_posts`, { params: httpParams }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getPost(id: string): Observable<BlogPost> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<BlogPost>(`${this.apiUrl}/blog_posts/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createPost(data: Partial<BlogPost>): Observable<BlogPost> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<BlogPost>(`${this.apiUrl}/blog_posts`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updatePost(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<BlogPost>(`${this.apiUrl}/blog_posts/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deletePost(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/blog_posts/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Blog Categories ---

  getCategories(): Observable<BlogCategory[]> {
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<BlogCategory[]>(`${this.apiUrl}/blog_categories`, { params });
  }

  getCategory(id: string): Observable<BlogCategory> {
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<BlogCategory>(`${this.apiUrl}/blog_categories/${id}`, { params });
  }

  createCategory(data: Partial<BlogCategory>): Observable<BlogCategory> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<BlogCategory>(`${this.apiUrl}/blog_categories`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateCategory(id: string, data: Partial<BlogCategory>): Observable<BlogCategory> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<BlogCategory>(`${this.apiUrl}/blog_categories/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteCategory(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/blog_categories/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
