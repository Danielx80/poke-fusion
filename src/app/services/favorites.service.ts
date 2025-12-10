import { Injectable } from '@angular/core';
import { FusedPokemon } from './pokemon.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private storageKey = 'pokefusion_favorites';

  getFavorites(): FusedPokemon[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  addFavorite(fused: FusedPokemon): void {
    const favorites = this.getFavorites();
    favorites.push(fused);
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }

  removeFavorite(index: number): void {
    const favorites = this.getFavorites();
    favorites.splice(index, 1);
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }

  isFavorite(fused: FusedPokemon): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f =>
      f.name === fused.name &&
      new Date(f.createdAt).getTime() === new Date(fused.createdAt).getTime()
    );
  }
}

