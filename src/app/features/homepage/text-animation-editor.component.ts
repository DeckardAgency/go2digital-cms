import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-text-animation-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-text-animation"
    pageTitle="Text Animation"
    [translatableFields]="fields" />`,
})
export class TextAnimationEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'word1', label: 'Word 1', type: 'text' },
    { key: 'word2', label: 'Word 2', type: 'text' },
    { key: 'word3', label: 'Word 3', type: 'text' },
  ];
}
