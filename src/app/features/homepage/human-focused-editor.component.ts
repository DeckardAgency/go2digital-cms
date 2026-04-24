import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField, SingletonTypographyElement } from './singleton-editor.component';

@Component({
  selector: 'app-human-focused-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-human-focused"
      pageTitle="Human Focused"
      subtitle="Indicator, title, and left/right text blocks"
      [sectionPosition]="7"
      [translatableFields]="fields"
      [typographyElements]="typoElements">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-white p-4">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="text-[10px] text-surface-400 uppercase tracking-wider">Indicator</span>
            </div>
            <p class="text-sm font-semibold text-zinc-900 mb-3">Section Title</p>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-[9px] text-surface-400 uppercase mb-1 block">Left</span>
                <div class="bg-surface-100 rounded p-2">
                  <div class="h-1.5 w-full bg-surface-300 rounded mb-1"></div>
                  <div class="h-1.5 w-3/4 bg-surface-300 rounded"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] text-surface-400 uppercase mb-1 block">Right</span>
                <div class="bg-surface-100 rounded p-2">
                  <div class="h-1.5 w-full bg-surface-300 rounded mb-1"></div>
                  <div class="h-1.5 w-4/5 bg-surface-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Indicator + title with two text columns</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class HumanFocusedEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'indicator', label: 'Indicator', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'blockLeft', label: 'Block Left', type: 'textarea' },
    { key: 'blockRight', label: 'Block Right', type: 'textarea' },
  ];

  typoElements: SingletonTypographyElement[] = [
    { key: 'indicator', label: 'Indicator', defaultSlug: 'eyebrow' },
    { key: 'title', label: 'Title', defaultSlug: 'section-title' },
    { key: 'blockHeading', label: 'Block Heading', defaultSlug: 'block-heading' },
    { key: 'blockText', label: 'Block Text', defaultSlug: 'body-lg' },
  ];
}
