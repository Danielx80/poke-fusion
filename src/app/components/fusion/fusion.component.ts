import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PokemonService, Pokemon, FusedPokemon } from '../../services/pokemon.service';
import { FavoritesService } from '../../services/favorites.service';
import { TypeColorsService } from '../../services/type-colors.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

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
    MatSnackBarModule,
    MatDialogModule
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

  isFavorite = signal(false);

  private checkFavorite(): void {
    const fused = this.fusedPokemon();
    if (fused) {
      this.favoritesService.isFavorite(fused).then(result => {
        this.isFavorite.set(result);
      });
    } else {
      this.isFavorite.set(false);
    }
  }

  constructor(
    private pokemonService: PokemonService,
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar,
    private typeColorsService: TypeColorsService,
    private dialog: MatDialog
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
        const fused = this.pokemonService.fusePokemon(pokemon[0], pokemon[1], pokemon[2]);
        this.fusedPokemon.set(fused);
        this.checkFavorite();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los Pokémon. Intenta de nuevo.');
        this.loading.set(false);
        this.snackBar.open('Error al cargar los Pokémon', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  addToFavorites(): void {
    const fused = this.fusedPokemon();
    if (fused) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Guardar en favoritos',
          message: `¿Estás seguro de que deseas guardar "${fused.name}" en favoritos?`,
          confirmText: 'Guardar',
          cancelText: 'Cancelar'
        }
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result) {
          try {
            await this.favoritesService.addFavorite(fused);
            this.isFavorite.set(true);
            this.snackBar.open('Fusión guardada en favoritos', 'Cerrar', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.generateFusion();
          } catch (error) {
            this.snackBar.open('Error al guardar favorito', 'Cerrar', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        }
      });
    }
  }

  getTypeColor(type: string): string {
    return this.typeColorsService.getTypeColor(type);
  }

  getTextColorForType(type: string): string {
    return this.typeColorsService.getTextColorForType(type);
  }

  formatStatName(name: string): string {
    return name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}


