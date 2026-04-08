import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  // --- Singletons ---

  getSingleton(type: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/singletons/${type}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateSingleton(type: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<any>(`${this.apiUrl}/singletons/${type}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Panels ---

  getPanels(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_panels`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getPanel(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_panels/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createPanel(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_panels`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updatePanel(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_panels/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deletePanel(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_panels/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Why Cards ---

  getWhyCards(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_why_cards`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getWhyCard(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_why_cards/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createWhyCard(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_why_cards`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateWhyCard(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_why_cards/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteWhyCard(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_why_cards/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Tracking Features ---

  getTrackingFeatures(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_tracking_features`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getTrackingFeature(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_tracking_features/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createTrackingFeature(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_tracking_features`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateTrackingFeature(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_tracking_features/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteTrackingFeature(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_tracking_features/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Featured Lab Items ---

  getFeaturedLabItems(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_featured_lab_items`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getFeaturedLabItem(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_featured_lab_items/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createFeaturedLabItem(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_featured_lab_items`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateFeaturedLabItem(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_featured_lab_items/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteFeaturedLabItem(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_featured_lab_items/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Products ---

  getProducts(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_products`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getProduct(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_products/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createProduct(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_products`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateProduct(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_products/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteProduct(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_products/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Possibilities ---

  getPossibilities(): Observable<any[]> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any[]>(`${this.apiUrl}/homepage_possibilities`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getPossibility(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_possibilities/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createPossibility(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_possibilities`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updatePossibility(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_possibilities/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deletePossibility(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_possibilities/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  // --- Product Features ---

  getProductFeatures(productId?: string): Observable<any[]> {
    this._isLoading.set(true);
    let params = new HttpParams().set('includeTranslations', 'true');
    if (productId) {
      params = params.set('product', productId);
    }

    return this.http.get<any[]>(`${this.apiUrl}/homepage_product_features`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getProductFeature(id: string): Observable<any> {
    this._isLoading.set(true);
    const params = new HttpParams().set('includeTranslations', 'true');

    return this.http.get<any>(`${this.apiUrl}/homepage_product_features/${id}`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  createProductFeature(data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    return this.http.post<any>(`${this.apiUrl}/homepage_product_features`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  updateProductFeature(id: string, data: any): Observable<any> {
    this._isLoading.set(true);
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    return this.http.patch<any>(`${this.apiUrl}/homepage_product_features/${id}`, data, { headers }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteProductFeature(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/homepage_product_features/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }
}
