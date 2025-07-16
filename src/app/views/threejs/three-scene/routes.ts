import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-scene').then(m => m.ThreeSceneComponent),
    data: {
      title: $localize`Three Scene`
    }
  }
];

