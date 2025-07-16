import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./three-hero3d.component').then(m => m.ThreeHero3DComponent),
    data: {
      title: $localize`Three.js Hero 3D`
    }
  }
];

