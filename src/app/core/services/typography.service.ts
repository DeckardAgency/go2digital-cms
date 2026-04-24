import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Setting, SettingsService } from './settings.service';

export interface TypographyFontWeight {
  weight: number;
  src: string;
  format: string;
}

export interface TypographyFont {
  slug: string;
  name: string;
  stack: string;
  weights: TypographyFontWeight[];
}

export interface TypographyPresetSizes {
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface TypographyPreset {
  slug: string;
  label: string;
  fontSlug: string;
  weight: number;
  lineHeight: number | string;
  letterSpacing: string | null;
  sizes: TypographyPresetSizes;
}

export interface TypographyPresetUsage {
  count: number;
  singletons: string[];
  blockMaps: string[];
}

@Injectable({ providedIn: 'root' })
export class TypographyService {
  private settingsService = inject(SettingsService);
  private http = inject(HttpClient);

  private _fonts = signal<TypographyFont[]>([]);
  private _presets = signal<TypographyPreset[]>([]);
  private _blockMaps = signal<Record<string, Record<string, string>>>({});
  private _usage = signal<Record<string, TypographyPresetUsage>>({});
  private _loading = signal(false);
  private _loaded = signal(false);
  private settingBySlug = new Map<string, Setting>();
  private blockMapSettings = new Map<string, Setting>();
  private fontsSetting: Setting | null = null;

  readonly fonts = this._fonts.asReadonly();
  readonly presets = this._presets.asReadonly();
  readonly blockMaps = this._blockMaps.asReadonly();
  readonly usage = this._usage.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  loadAll(): Observable<void> {
    this._loading.set(true);
    return this.settingsService.getSettings().pipe(
      map(all => {
        const typographySettings = all.filter(s => s.group === 'typography');

        const fontsSetting = typographySettings.find(s => s.key === 'typography.fonts');
        this.fontsSetting = fontsSetting ?? null;
        this._fonts.set(Array.isArray(fontsSetting?.value) ? fontsSetting.value as TypographyFont[] : []);

        const presets: TypographyPreset[] = [];
        const blockMaps: Record<string, Record<string, string>> = {};
        this.settingBySlug.clear();
        this.blockMapSettings.clear();
        for (const s of typographySettings) {
          if (s.key?.startsWith('typography.presets.') && s.value?.slug) {
            presets.push(s.value as TypographyPreset);
            this.settingBySlug.set(s.value.slug, s);
          } else if (s.key?.startsWith('typography.blockMaps.')) {
            const blockId = s.key.slice('typography.blockMaps.'.length);
            if (s.value && typeof s.value === 'object') {
              blockMaps[blockId] = s.value as Record<string, string>;
              this.blockMapSettings.set(blockId, s);
            }
          }
        }
        this._presets.set(presets.sort((a, b) => a.label.localeCompare(b.label)));
        this._blockMaps.set(blockMaps);
        this._loaded.set(true);
        this._loading.set(false);
      }),
    );
  }

  loadUsage(): Observable<Record<string, TypographyPresetUsage>> {
    return this.http.get<Record<string, TypographyPresetUsage>>(`${environment.apiUrl}/typography/usage`).pipe(
      tap(usage => this._usage.set(usage || {})),
    );
  }

  saveFonts(fonts: TypographyFont[]): Observable<Setting> {
    if (this.fontsSetting) {
      return this.settingsService.updateSetting(this.fontsSetting.id, { value: fonts }).pipe(
        tap(updated => {
          this.fontsSetting = updated;
          this._fonts.set(fonts);
        }),
      );
    }
    return this.settingsService.createSetting({
      key: 'typography.fonts',
      group: 'typography',
      value: fonts,
    }).pipe(
      tap(created => {
        this.fontsSetting = created;
        this._fonts.set(fonts);
      }),
    );
  }

  uploadFontFile(file: File): Observable<{ src: string; format: string; originalFilename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ src: string; format: string; originalFilename: string; size: number }>(
      `${environment.apiUrl}/typography/fonts/upload`,
      formData,
    );
  }

  saveBlockMap(blockId: string, map: Record<string, string>): Observable<Setting> {
    const existing = this.blockMapSettings.get(blockId);
    if (existing) {
      return this.settingsService.updateSetting(existing.id, { value: map }).pipe(
        tap(updated => {
          this.blockMapSettings.set(blockId, updated);
          this._blockMaps.update(all => ({ ...all, [blockId]: map }));
        }),
      );
    }
    return this.settingsService.createSetting({
      key: `typography.blockMaps.${blockId}`,
      group: 'typography',
      value: map,
    }).pipe(
      tap(created => {
        this.blockMapSettings.set(blockId, created);
        this._blockMaps.update(all => ({ ...all, [blockId]: map }));
      }),
    );
  }

  savePreset(preset: TypographyPreset): Observable<Setting> {
    const existing = this.settingBySlug.get(preset.slug);
    if (existing) {
      return this.settingsService.updateSetting(existing.id, { value: preset }).pipe(
        tap(updated => {
          this.settingBySlug.set(preset.slug, updated);
          this.replacePresetLocal(preset);
        }),
      );
    }
    return this.settingsService.createSetting({
      key: `typography.presets.${preset.slug}`,
      group: 'typography',
      value: preset,
    }).pipe(
      tap(created => {
        this.settingBySlug.set(preset.slug, created);
        this._presets.update(list => [...list, preset].sort((a, b) => a.label.localeCompare(b.label)));
      }),
    );
  }

  deletePreset(slug: string): Observable<void> {
    const existing = this.settingBySlug.get(slug);
    if (!existing) return of(void 0);
    return this.settingsService.deleteSetting(existing.id).pipe(
      tap(() => {
        this.settingBySlug.delete(slug);
        this._presets.update(list => list.filter(p => p.slug !== slug));
      }),
      switchMap(() => of(void 0)),
    );
  }

  private replacePresetLocal(preset: TypographyPreset): void {
    this._presets.update(list =>
      list.map(p => (p.slug === preset.slug ? preset : p))
        .sort((a, b) => a.label.localeCompare(b.label)),
    );
  }
}
