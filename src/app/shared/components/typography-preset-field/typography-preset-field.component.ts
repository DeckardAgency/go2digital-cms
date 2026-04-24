import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { TypographyService } from '../../../core/services/typography.service';

@Component({
  selector: 'app-typography-preset-field',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  template: `
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-2">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-300">{{ label() }}</label>
        @if (activePreset()) {
          <span
            class="text-[11px] text-surface-400 leading-none whitespace-nowrap"
            [style]="previewStyle()"
          >Aa Bb Cc</span>
        }
      </div>
      <p-select
        [options]="options()"
        [ngModel]="value() ?? null"
        (ngModelChange)="valueChange.emit($event || null)"
        optionLabel="label"
        optionValue="slug"
        [placeholder]="defaultPlaceholder()"
        [showClear]="true"
        styleClass="w-full"
        appendTo="body"
      />
    </div>
  `,
})
export class TypographyPresetFieldComponent {
  private typography = inject(TypographyService);

  label = input.required<string>();
  value = input<string | null | undefined>();
  defaultSlug = input<string | undefined>();

  valueChange = output<string | null>();

  options = computed(() => this.typography.presets());

  activePreset = computed(() => {
    const slug = this.value() || this.defaultSlug();
    return this.typography.presets().find(p => p.slug === slug);
  });

  defaultPlaceholder = computed(() => {
    const d = this.defaultSlug();
    return d ? `Default: ${d}` : 'Select preset';
  });

  previewStyle = computed((): Record<string, string> => {
    const p = this.activePreset();
    if (!p) return {};
    const font = this.typography.fonts().find(f => f.slug === p.fontSlug);
    const style: Record<string, string> = {
      'font-family': font?.stack || 'inherit',
      'font-weight': String(p.weight),
      'line-height': '1',
      'font-size': '14px',
    };
    if (p.letterSpacing) style['letter-spacing'] = p.letterSpacing;
    return style;
  });
}
