import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-why-section-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-why-section"
      pageTitle="Why Section"
      subtitle="Section header with label and headline"
      [sectionPosition]="3"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-white p-5">
            <span class="text-[10px] text-surface-400 uppercase tracking-wider block mb-2">Label text</span>
            <p class="text-base font-semibold text-zinc-900 leading-snug">Headline text that introduces the section below</p>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Label + headline header section</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class WhySectionEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'headline', label: 'Headline', type: 'textarea' },
  ];
}
