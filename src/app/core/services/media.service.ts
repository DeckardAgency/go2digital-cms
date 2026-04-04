import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  collection: string;
  path: string;
  thumbnails?: any;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getMedia(collection?: string): Observable<MediaItem[]> {
    this._isLoading.set(true);
    let params = new HttpParams();
    if (collection) {
      params = params.set('collection', collection);
    }

    return this.http.get<MediaItem[]>(`${this.apiUrl}/media`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  uploadMedia(file: File, collection: string): Observable<MediaItem> {
    this._isLoading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', collection);

    return this.http.post<MediaItem>(`${this.apiUrl}/media/upload`, formData).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteMedia(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/media/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getMediaUrl(path: string): string {
    // Strip /api from apiUrl to get base URL for storage paths
    const baseUrl = this.apiUrl.replace(/\/api$/, '');
    return `${baseUrl}/storage/media/${path}`;
  }
}
