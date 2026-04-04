import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-why-section-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-why-section"
    pageTitle="Why Section"
    [translatableFields]="fields" />`,
})
export class WhySectionEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'headline', label: 'Headline', type: 'textarea' },
  ];
}
