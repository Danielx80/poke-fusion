import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/fusion/fusion.component').then(m => m.FusionComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./components/favorites/favorites.component').then(m => m.FavoritesComponent)
  }
];
