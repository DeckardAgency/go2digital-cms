import { Component } from '@angular/core';
import { SingletonEditorComponent, SingletonTranslatableField } from './singleton-editor.component';

@Component({
  selector: 'app-hero-editor',
  standalone: true,
  imports: [SingletonEditorComponent],
  template: `<app-singleton-editor
    singletonType="homepage-hero"
    pageTitle="Homepage Hero"
    [translatableFields]="fields" />`,
})
export class HeroEditorComponent {
  fields: SingletonTranslatableField[] = [
    { key: 'titleLine1', label: 'Title Line 1', type: 'text' },
    { key: 'titleLine2', label: 'Title Line 2', type: 'text' },
    { key: 'kicker', label: 'Kicker', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'scrollDownLabel', label: 'Scroll Down Label', type: 'text' },
  ];
}
