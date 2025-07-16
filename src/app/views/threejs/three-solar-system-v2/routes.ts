import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-solar-system-v2.component').then(m => m.ThreeSolarSystemV2Component),
    data: { 
      title: $localize`Three Solar System V2`,
    }
  }
];

