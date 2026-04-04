import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-custom-image-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-custom-image"
    pageTitle="Custom Image"
    [translatableFields]="fields" />`,
})
export class CustomImageEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'alt', label: 'Alt Text', type: 'text' },
  ];
}
