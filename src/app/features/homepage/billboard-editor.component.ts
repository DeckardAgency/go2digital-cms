import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField, SingletonNonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-billboard-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-billboard"
    pageTitle="Billboard"
    [translatableFields]="fields"
    [nonTranslatableFields]="nonTranslatable" />`,
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
