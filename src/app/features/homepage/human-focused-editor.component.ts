import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-human-focused-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-human-focused"
    pageTitle="Human Focused"
    [translatableFields]="fields" />`,
})
export class HumanFocusedEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'indicator', label: 'Indicator', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'blockLeft', label: 'Block Left', type: 'textarea' },
    { key: 'blockRight', label: 'Block Right', type: 'textarea' },
  ];
}
