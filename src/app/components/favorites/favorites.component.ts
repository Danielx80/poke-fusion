import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FavoritesService } from '../../services/favorites.service';
import { FusedPokemon } from '../../services/pokemon.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent implements OnInit {
  favorites = signal<FusedPokemon[]>([]);
  loading = signal(true);

  private readonly TYPE_COLORS: Record<string, string> = {
    normal: 'hsl(0, 0%, 50%)',
    fire: 'hsl(0, 84%, 60%)',
    water: 'hsl(217, 91%, 60%)',
    electric: 'hsl(45, 93%, 58%)',
    grass: 'hsl(142, 71%, 45%)',
    ice: 'hsl(188, 78%, 70%)',
    fighting: 'hsl(0, 65%, 47%)',
    poison: 'hsl(280, 50%, 50%)',
    ground: 'hsl(45, 60%, 55%)',
    flying: 'hsl(250, 60%, 65%)',
    psychic: 'hsl(330, 65%, 65%)',
    bug: 'hsl(60, 50%, 45%)',
    rock: 'hsl(45, 40%, 50%)',
    ghost: 'hsl(270, 40%, 55%)',
    dragon: 'hsl(260, 80%, 65%)',
    dark: 'hsl(0, 0%, 30%)',
    steel: 'hsl(210, 20%, 70%)',
    fairy: 'hsl(330, 60%, 75%)'
  };

  constructor(
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.favorites.set(this.favoritesService.getFavorites());
      this.loading.set(false);
    }, 500);
  }

  removeFavorite(index: number): void {
    this.favoritesService.removeFavorite(index);
    this.loadFavorites();
    this.snackBar.open('Fusión eliminada de favoritos', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  getTypeColor(type: string): string {
    return this.TYPE_COLORS[type] || '#68A090';
  }

  formatStatName(name: string): string {
    return name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

