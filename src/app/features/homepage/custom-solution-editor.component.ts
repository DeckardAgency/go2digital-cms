import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-custom-solution-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-custom-solution"
    pageTitle="Custom Solution"
    [translatableFields]="fields" />`,
})
export class CustomSolutionEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'indicator', label: 'Indicator', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'block1', label: 'Block 1', type: 'textarea' },
    { key: 'block2', label: 'Block 2', type: 'textarea' },
  ];
}
