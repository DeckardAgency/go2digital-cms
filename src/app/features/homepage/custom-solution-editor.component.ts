import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-custom-solution-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-custom-solution"
      pageTitle="Custom Solution"
      subtitle="Indicator, title, and two content blocks"
      [sectionPosition]="5"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 bg-white p-4">
            <div class="flex items-center gap-1.5 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-surface-400"></span>
              <span class="text-[10px] text-surface-400 uppercase tracking-wider">Indicator</span>
            </div>
            <p class="text-sm font-semibold text-zinc-900 mb-3">Section Title</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-surface-100 rounded p-2">
                <div class="h-1.5 w-full bg-surface-300 rounded mb-1"></div>
                <div class="h-1.5 w-3/4 bg-surface-300 rounded mb-1"></div>
                <div class="h-1.5 w-5/6 bg-surface-300 rounded"></div>
              </div>
              <div class="bg-surface-100 rounded p-2">
                <div class="h-1.5 w-full bg-surface-300 rounded mb-1"></div>
                <div class="h-1.5 w-4/5 bg-surface-300 rounded mb-1"></div>
                <div class="h-1.5 w-2/3 bg-surface-300 rounded"></div>
              </div>
            </div>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Two-column content layout</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class CustomSolutionEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'indicator', label: 'Indicator', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'block1', label: 'Block 1', type: 'textarea' },
    { key: 'block2', label: 'Block 2', type: 'textarea' },
  ];
}
