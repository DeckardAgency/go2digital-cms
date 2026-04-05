import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField, SingletonNonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-billboard-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-billboard"
      pageTitle="Billboard"
      subtitle="Call-to-action with title, description, and button"
      [sectionPosition]="9"
      [translatableFields]="fields"
      [nonTranslatableFields]="nonTranslatable"
      imageField="image">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 p-5 text-center" style="background: linear-gradient(135deg, #0f1f1c 0%, #1a3a32 100%); min-height: 140px;">
            <span class="inline-block text-[9px] text-emerald-400 border border-emerald-400/30 rounded-full px-2 py-0.5 mb-2">Subtitle</span>
            <p class="text-sm font-semibold text-white mb-1.5">Section Title</p>
            <p class="text-[10px] text-white/60 mb-3 leading-relaxed">Description text goes here with a brief summary of the call to action.</p>
            <span class="inline-block text-[10px] font-medium text-white bg-emerald-600 rounded-lg px-3 py-1">Button Text</span>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">CTA section with gradient background</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class BillboardEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
    { key: 'imageAlt', label: 'Image Alt', type: 'text' },
  ];

  nonTranslatable: SingletonNonTranslatableField[] = [
    { key: 'buttonUrl', label: 'Button URL', type: 'text' },
  ];
}
