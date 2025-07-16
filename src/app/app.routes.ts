import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },

      //#region Three.js routes
      {
        path: 'three-model',
        loadChildren: () => import('./views/threejs/three-model/routes').then((m) => m.routes)
      },
      {
        path: 'three-model-v1',
        loadChildren: () => import('./views/threejs/three-model-v1/routes').then((m) => m.routes)
      },
      {
        path: 'three-line',
        loadChildren: () => import('./views/threejs/three-line/routes').then((m) => m.routes)
      },
      {
        path: 'three-scene',
        loadChildren: () => import('./views/threejs/three-scene/routes').then((m) => m.routes)
      },
      {
        path: 'three-hero3d',
        loadChildren: () => import('./views/threejs/three-hero3d/routes').then((m) => m.routes)

      }, {
        path: 'three-text',
        loadChildren: () => import('./views/threejs/three-text/routes').then((m) => m.routes)
      },
      {
        path: 'three-solar-system',
        loadChildren: () => import('./views/threejs/three-solar-system/routes').then((m) => m.routes)
      },
      {
        path: 'three-solar-system-v1',
        loadChildren: () => import('./views/threejs/three-solar-system-v1/routes').then((m) => m.routes)
      },
            {
        path: 'three-solar-system-v2',
        loadChildren: () => import('./views/threejs/three-solar-system-v2/routes').then((m) => m.routes)
      },
      //#endregion

      {
        path: 'theme',
        loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/routes').then((m) => m.routes)
      },
      {
        path: 'forms',
        loadChildren: () => import('./views/forms/routes').then((m) => m.routes)
      },
      {
        path: 'icons',
        loadChildren: () => import('./views/icons/routes').then((m) => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/routes').then((m) => m.routes)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/charts/routes').then((m) => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];
