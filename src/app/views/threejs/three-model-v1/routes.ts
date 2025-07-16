import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-model-v1').then(m => m.ThreeModelV1Component),
    data: {
      title: $localize`Three Model V1`
    }
  }
];

