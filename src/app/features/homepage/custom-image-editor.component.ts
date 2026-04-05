import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-custom-image-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-custom-image"
      pageTitle="Custom Image"
      subtitle="Full-width parallax image with alt text"
      [sectionPosition]="4"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 p-6 flex flex-col items-center justify-center gap-2" style="min-height: 100px;">
            <i class="pi pi-image text-2xl text-surface-400"></i>
            <span class="text-xs text-surface-500">Full-width parallax image</span>
            <span class="text-[10px] text-surface-400">Alt text provided for accessibility</span>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Single image section with parallax scroll</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class CustomImageEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'alt', label: 'Alt Text', type: 'text' },
  ];
}
