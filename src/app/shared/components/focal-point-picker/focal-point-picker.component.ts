import { Component, Input, Output, EventEmitter, Renderer2, NgZone, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-focal-point-picker',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <button type="button" class="fp-trigger" (click)="open()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      </svg>
      <span>Focal Point</span>
    </button>
  `,
  styleUrls: ['./focal-point-picker.component.scss']
})
export class FocalPointPickerComponent implements OnDestroy {
  @Input() imageUrl: string | null = null;
  @Input() focalX: number = 50;
  @Input() focalY: number = 50;
  @Output() focalPointChange = new EventEmitter<{ x: number; y: number }>();

  private editorEl: HTMLDivElement | null = null;
  private sourceImgEl: HTMLImageElement | null = null;
  private sourceWrapEl: HTMLDivElement | null = null;
  private markerEl: HTMLDivElement | null = null;
  private coordsEl: HTMLDivElement | null = null;
  private desktopPreviewImg: HTMLImageElement | null = null;
  private mobilePreviewImg: HTMLImageElement | null = null;
  private desktopPreviewDiv: HTMLDivElement | null = null;
  private mobilePreviewDiv: HTMLDivElement | null = null;
  private saveBtnEl: HTMLButtonElement | null = null;
  private resizeListener: (() => void) | null = null;
  private keyListener: ((e: KeyboardEvent) => void) | null = null;

  mode: 'desktop' | 'mobile' = 'desktop';
  dirty = false;

  desktopPoint = { x: 50, y: 50 };
  mobilePoint = { x: 50, y: 50 };
  originalDesktop = { x: 50, y: 50 };
  originalMobile = { x: 50, y: 50 };

  get currentPoint() {
    return this.mode === 'desktop' ? this.desktopPoint : this.mobilePoint;
  }

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnDestroy() {
    this.destroyEditor();
  }

  open() {
    this.desktopPoint = { x: parseFloat(String(this.focalX)) || 50, y: parseFloat(String(this.focalY)) || 50 };
    this.mobilePoint = { x: parseFloat(String(this.focalX)) || 50, y: parseFloat(String(this.focalY)) || 50 };
    this.originalDesktop = { ...this.desktopPoint };
    this.originalMobile = { ...this.mobilePoint };
    this.mode = 'desktop';
    this.dirty = false;
    this.createEditor();
  }

  private createEditor() {
    if (this.editorEl) return;

    const el = this.document.createElement('div');
    el.className = 'fp-editor';
    el.innerHTML = `
      <div class="fp-editor__topbar">
        <div class="fp-editor__title">Focal Point Editor</div>
        <div class="fp-editor__modes">
          <button type="button" class="fp-editor__mode fp-editor__mode--active" data-fp-mode="desktop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Desktop
          </button>
          <button type="button" class="fp-editor__mode" data-fp-mode="mobile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
            Mobile
          </button>
        </div>
        <div class="fp-editor__coords" data-fp-coords>50.0% / 50.0%</div>
        <div class="fp-editor__actions">
          <button type="button" class="fp-editor__btn fp-editor__btn--reset" data-fp-reset>Reset</button>
          <button type="button" class="fp-editor__btn fp-editor__btn--save" data-fp-save>Save</button>
          <button type="button" class="fp-editor__btn fp-editor__btn--cancel" data-fp-cancel>Cancel</button>
        </div>
      </div>
      <div class="fp-editor__body">
        <div class="fp-editor__source">
          <div class="fp-editor__source-label">Click to set focal point</div>
          <div class="fp-editor__source-wrap" data-fp-source-wrap>
            <img src="${this.imageUrl}" alt="Source" class="fp-editor__source-img" data-fp-source-img draggable="false">
            <div class="fp-editor__marker" data-fp-marker>
              <div class="fp-editor__marker-dot"></div>
              <div class="fp-editor__marker-ring"></div>
              <div class="fp-editor__marker-line fp-editor__marker-line--h"></div>
              <div class="fp-editor__marker-line fp-editor__marker-line--v"></div>
            </div>
          </div>
        </div>
        <div class="fp-editor__previews">
          <div class="fp-editor__preview fp-editor__preview--active" data-fp-preview-desktop>
            <div class="fp-editor__preview-label">Desktop preview <span>~4:1 panoramic</span></div>
            <div class="fp-editor__preview-frame fp-editor__preview-frame--desktop">
              <img src="${this.imageUrl}" alt="Desktop preview" data-fp-preview-desktop-img>
            </div>
          </div>
          <div class="fp-editor__preview" data-fp-preview-mobile>
            <div class="fp-editor__preview-label">Mobile preview <span>9:16 portrait</span></div>
            <div class="fp-editor__preview-frame fp-editor__preview-frame--mobile">
              <img src="${this.imageUrl}" alt="Mobile preview" data-fp-preview-mobile-img>
            </div>
          </div>
        </div>
      </div>
    `;

    this.document.body.appendChild(el);
    this.document.body.style.overflow = 'hidden';
    this.editorEl = el;

    this.sourceImgEl = el.querySelector('[data-fp-source-img]');
    this.sourceWrapEl = el.querySelector('[data-fp-source-wrap]');
    this.markerEl = el.querySelector('[data-fp-marker]');
    this.coordsEl = el.querySelector('[data-fp-coords]');
    this.desktopPreviewImg = el.querySelector('[data-fp-preview-desktop-img]');
    this.mobilePreviewImg = el.querySelector('[data-fp-preview-mobile-img]');
    this.desktopPreviewDiv = el.querySelector('[data-fp-preview-desktop]');
    this.mobilePreviewDiv = el.querySelector('[data-fp-preview-mobile]');
    this.saveBtnEl = el.querySelector('[data-fp-save]');

    this.sourceWrapEl!.addEventListener('click', (e: MouseEvent) => {
      this.ngZone.run(() => this.onSourceClick(e));
    });

    el.querySelectorAll('[data-fp-mode]').forEach((btn: Element) => {
      btn.addEventListener('click', () => {
        this.ngZone.run(() => this.setMode((btn as HTMLElement).dataset['fpMode'] as 'desktop' | 'mobile'));
      });
    });

    el.querySelector('[data-fp-reset]')!.addEventListener('click', () => {
      this.ngZone.run(() => this.reset());
    });
    el.querySelector('[data-fp-save]')!.addEventListener('click', () => {
      this.ngZone.run(() => this.save());
    });
    el.querySelector('[data-fp-cancel]')!.addEventListener('click', () => {
      this.ngZone.run(() => this.cancel());
    });

    this.keyListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.ngZone.run(() => this.cancel());
    };
    this.document.addEventListener('keydown', this.keyListener);

    this.resizeListener = () => this.updateMarker();
    window.addEventListener('resize', this.resizeListener);

    if (this.sourceImgEl!.complete) {
      setTimeout(() => this.updateUI(), 50);
    } else {
      this.sourceImgEl!.addEventListener('load', () => this.updateUI(), { once: true });
    }
  }

  private destroyEditor() {
    if (this.editorEl) {
      this.editorEl.remove();
      this.editorEl = null;
      this.document.body.style.overflow = '';
    }
    if (this.keyListener) {
      this.document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
  }

  private cancel() {
    if (this.dirty && !confirm('You have unsaved changes. Discard?')) return;
    this.desktopPoint = { ...this.originalDesktop };
    this.mobilePoint = { ...this.originalMobile };
    this.dirty = false;
    this.destroyEditor();
  }

  private setMode(m: 'desktop' | 'mobile') {
    this.mode = m;
    this.updateUI();
  }

  private reset() {
    this.currentPoint.x = 50;
    this.currentPoint.y = 50;
    this.dirty = true;
    this.updateUI();
  }

  private save() {
    this.focalPointChange.emit({ x: this.desktopPoint.x, y: this.desktopPoint.y });
    this.originalDesktop = { ...this.desktopPoint };
    this.originalMobile = { ...this.mobilePoint };
    this.dirty = false;
    this.destroyEditor();
  }

  private onSourceClick(event: MouseEvent) {
    const img = this.sourceImgEl!;
    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.currentPoint.x = Math.max(0, Math.min(100, Math.round(x * 10) / 10));
    this.currentPoint.y = Math.max(0, Math.min(100, Math.round(y * 10) / 10));
    this.dirty = true;

    this.markerEl!.classList.add('is-animating');
    setTimeout(() => this.markerEl?.classList.remove('is-animating'), 200);

    this.updateUI();
  }

  private updateUI() {
    if (!this.editorEl) return;
    const pt = this.currentPoint;

    this.coordsEl!.textContent = `${pt.x.toFixed(1)}% / ${pt.y.toFixed(1)}%`;

    this.editorEl.querySelectorAll('[data-fp-mode]').forEach((btn: Element) => {
      btn.classList.toggle('fp-editor__mode--active', (btn as HTMLElement).dataset['fpMode'] === this.mode);
    });

    this.desktopPreviewImg!.style.objectPosition = `${this.desktopPoint.x}% ${this.desktopPoint.y}%`;
    this.mobilePreviewImg!.style.objectPosition = `${this.mobilePoint.x}% ${this.mobilePoint.y}%`;
    this.desktopPreviewDiv!.classList.toggle('fp-editor__preview--active', this.mode === 'desktop');
    this.mobilePreviewDiv!.classList.toggle('fp-editor__preview--active', this.mode === 'mobile');

    this.saveBtnEl!.classList.toggle('has-changes', this.dirty);

    this.updateMarker();
  }

  private updateMarker() {
    if (!this.sourceImgEl || !this.sourceWrapEl || !this.markerEl) return;
    const img = this.sourceImgEl;
    const wrap = this.sourceWrapEl;
    const imgRect = img.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const pt = this.currentPoint;
    this.markerEl.style.left = (imgRect.left - wrapRect.left + imgRect.width * pt.x / 100) + 'px';
    this.markerEl.style.top = (imgRect.top - wrapRect.top + imgRect.height * pt.y / 100) + 'px';
  }
}
