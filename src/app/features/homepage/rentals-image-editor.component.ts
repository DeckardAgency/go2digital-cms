import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-rentals-image-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-rentals-image"
      pageTitle="Rentals Image"
      subtitle="Full-width section with overlay text"
      [sectionPosition]="11"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 p-6 flex items-center justify-center" style="background-color: #1a1a1a; min-height: 120px;">
            <span class="text-2xl font-bold tracking-widest uppercase" style="color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.4);">RENTALS</span>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Full-width image with large outline text overlay</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class RentalsImageEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'text', label: 'Text', type: 'text' },
  ];
}
