import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-line').then(m => m.ThreeLineComponent),
    data: {
      title: $localize`Three Line`
    }
  }
];

