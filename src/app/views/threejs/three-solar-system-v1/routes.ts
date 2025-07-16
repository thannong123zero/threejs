import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-solar-system-v1.component').then(m => m.ThreeSolarSystemV1Component),
    data: { 
      title: $localize`Three Solar System V1`,
    }
  }
];

