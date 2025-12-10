import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PokemonService, Pokemon, FusedPokemon } from '../../services/pokemon.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-fusion',
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
  templateUrl: './fusion.component.html',
  styleUrl: './fusion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FusionComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  pokemon1 = signal<Pokemon | null>(null);
  pokemon2 = signal<Pokemon | null>(null);
  pokemon3 = signal<Pokemon | null>(null);
  fusedPokemon = signal<FusedPokemon | null>(null);

  isFavorite = computed(() => {
    const fused = this.fusedPokemon();
    return fused ? this.favoritesService.isFavorite(fused) : false;
  });

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
    private pokemonService: PokemonService,
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.generateFusion();
  }

  generateFusion(): void {
    this.loading.set(true);
    this.error.set(null);
    this.fusedPokemon.set(null);

    this.pokemonService.getThreeRandomPokemon().subscribe({
      next: (pokemon) => {
        this.pokemon1.set(pokemon[0]);
        this.pokemon2.set(pokemon[1]);
        this.pokemon3.set(pokemon[2]);
        this.fusedPokemon.set(
          this.pokemonService.fusePokemon(pokemon[0], pokemon[1], pokemon[2])
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los Pokémon. Intenta de nuevo.');
        this.loading.set(false);
        this.snackBar.open('Error al cargar los Pokémon', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  addToFavorites(): void {
    const fused = this.fusedPokemon();
    if (fused) {
      this.favoritesService.addFavorite(fused);
      this.snackBar.open('Fusión guardada en favoritos', 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  getTypeColor(type: string): string {
    return this.TYPE_COLORS[type] || '#68A090';
  }

  formatStatName(name: string): string {
    return name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}


