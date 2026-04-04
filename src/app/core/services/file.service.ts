import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileItem {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  category: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly apiUrl = environment.apiUrl;

  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private http: HttpClient) {}

  getFiles(category?: string): Observable<FileItem[]> {
    this._isLoading.set(true);
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<FileItem[]>(`${this.apiUrl}/files`, { params }).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  uploadFile(file: File, category: string, description?: string): Observable<FileItem> {
    this._isLoading.set(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    return this.http.post<FileItem>(`${this.apiUrl}/files/upload`, formData).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  deleteFile(id: string): Observable<void> {
    this._isLoading.set(true);

    return this.http.delete<void>(`${this.apiUrl}/files/${id}`).pipe(
      finalize(() => this._isLoading.set(false))
    );
  }

  getDownloadUrl(id: string): string {
    return `${this.apiUrl}/files/${id}/download`;
  }
}
