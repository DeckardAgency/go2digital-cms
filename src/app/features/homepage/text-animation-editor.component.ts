import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-text-animation-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `
    <app-singleton-editor
      singletonType="homepage-text-animation"
      pageTitle="Text Animation"
      subtitle="Three animated words with scroll effect"
      [sectionPosition]="8"
      [translatableFields]="fields">
      <div preview>
        <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">Preview</h2>
          <div class="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 p-6 flex flex-col items-center justify-center gap-2" style="background-color: #03120F; min-height: 140px;">
            <span class="text-xl font-light tracking-wide" style="color: #e8e4df;">Word 1</span>
            <span class="text-xl font-light tracking-wide" style="color: #e8e4df; opacity: 0.6;">Word 2</span>
            <span class="text-xl font-light tracking-wide" style="color: #e8e4df; opacity: 0.3;">Word 3</span>
          </div>
          <p class="text-[10px] text-surface-400 mt-3 text-center">Stacked words with scroll-triggered animation</p>
        </div>
      </div>
    </app-singleton-editor>
  `,
})
export class TextAnimationEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'word1', label: 'Word 1', type: 'text' },
    { key: 'word2', label: 'Word 2', type: 'text' },
    { key: 'word3', label: 'Word 3', type: 'text' },
  ];
}
