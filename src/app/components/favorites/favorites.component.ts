import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FavoritesService, FavoriteWithId } from '../../services/favorites.service';
import { FusedPokemon } from '../../services/pokemon.service';
import { TypeColorsService } from '../../services/type-colors.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

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
    MatSnackBarModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesComponent implements OnInit, OnDestroy {
  allFavorites = signal<FavoriteWithId[]>([]);
  displayedFavorites = signal<FavoriteWithId[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  selectedFavorites = signal<Set<number>>(new Set());
  pageSize = 8;
  currentPage = signal(0);
  private scrollListener?: () => void;

  hasMore = computed(() => {
    return this.displayedFavorites().length < this.allFavorites().length;
  });

  hasSelection = computed(() => {
    return this.selectedFavorites().size > 0;
  });

  constructor(
    private favoritesService: FavoritesService,
    private snackBar: MatSnackBar,
    private typeColorsService: TypeColorsService,
    private dialog: MatDialog
  ) {
    effect(() => {
      const all = this.allFavorites();
      const page = this.currentPage();
      const displayed = all.slice(0, (page + 1) * this.pageSize);
      this.displayedFavorites.set(displayed);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadFavorites();
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  async loadFavorites(): Promise<void> {
    this.loading.set(true);
    try {
      const favorites = await this.favoritesService.getFavorites();
      this.allFavorites.set(favorites);
      this.currentPage.set(0);
      this.selectedFavorites.set(new Set());
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      this.loading.set(false);
    }
  }

  setupScrollListener(): void {
    this.scrollListener = () => {
      if (this.loadingMore() || !this.hasMore()) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= documentHeight - 200) {
        this.loadMore();
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    setTimeout(() => {
      this.currentPage.set(this.currentPage() + 1);
      this.loadingMore.set(false);
    }, 500);
  }

  toggleSelection(index: number): void {
    const selected = new Set(this.selectedFavorites());
    if (selected.has(index)) {
      selected.delete(index);
    } else {
      selected.add(index);
    }
    this.selectedFavorites.set(selected);
  }

  isSelected(index: number): boolean {
    return this.selectedFavorites().has(index);
  }

  removeFavorite(index: number): void {
    const favorite = this.displayedFavorites()[index];
    if (!favorite) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar favorito',
        message: `¿Estás seguro de que deseas eliminar "${favorite.name}" de favoritos?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && favorite.id) {
        try {
          await this.favoritesService.removeFavorite(favorite.id);
          const allFavs = this.allFavorites().filter(f => f.id !== favorite.id);
          this.allFavorites.set(allFavs);
          this.snackBar.open('Fusión eliminada de favoritos', 'Cerrar', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        } catch (error) {
          this.snackBar.open('Error al eliminar favorito', 'Cerrar', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      }
    });
  }

  removeSelected(): void {
    const selected = Array.from(this.selectedFavorites()).sort((a, b) => b - a);
    if (selected.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar favoritos',
        message: `¿Estás seguro de que deseas eliminar ${selected.length} ${selected.length === 1 ? 'fusión' : 'fusiones'} de favoritos?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const favoritesToRemove = selected
            .map(index => this.displayedFavorites()[index])
            .filter(f => f?.id);
          
          await Promise.all(
            favoritesToRemove.map(f => this.favoritesService.removeFavorite(f.id))
          );

          const remainingIds = new Set(favoritesToRemove.map(f => f.id));
          const allFavs = this.allFavorites().filter(f => !remainingIds.has(f.id));
          
          this.allFavorites.set(allFavs);
          this.selectedFavorites.set(new Set());
          this.snackBar.open(`${selected.length} ${selected.length === 1 ? 'fusión eliminada' : 'fusiones eliminadas'}`, 'Cerrar', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        } catch (error) {
          this.snackBar.open('Error al eliminar favoritos', 'Cerrar', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      }
    });
  }


  getTypeColor(type: string): string {
    return this.typeColorsService.getTypeColor(type);
  }

  formatStatName(name: string): string {
    return name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

