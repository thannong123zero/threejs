import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-text.component').then(m => m.ThreeTextComponent),
    data: {
      title: $localize`Three.js Text`
    }
  }
];

