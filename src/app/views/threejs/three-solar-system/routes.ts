import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-solar-system.component').then(m => m.ThreeSolarSystemComponent),
    data: {
      title: $localize`Three Solar System`
    }
  }
];

