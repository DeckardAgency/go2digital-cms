import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-rentals-image-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-rentals-image"
    pageTitle="Rentals Image"
    [translatableFields]="fields" />`,
})
export class RentalsImageEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'text', label: 'Text', type: 'text' },
  ];
}
