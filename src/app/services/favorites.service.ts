import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { FusedPokemon } from './pokemon.service';

export interface FavoriteWithId extends FusedPokemon {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private collectionName = 'favorites';

  async getFavorites(): Promise<FavoriteWithId[]> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(favoritesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const createdAt = data['createdAt'];
        return {
          id: docSnap.id,
          ...data,
          createdAt: createdAt?.toDate?.()?.toISOString() || createdAt
        } as FavoriteWithId;
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async addFavorite(fused: FusedPokemon): Promise<string> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const favoriteData = {
        name: fused.name,
        types: fused.types,
        stats: fused.stats,
        moves: fused.moves,
        basePokemon: fused.basePokemon,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(favoritesRef, favoriteData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  async removeFavorite(id: string): Promise<void> {
    try {
      const favoriteRef = doc(db, this.collectionName, id);
      await deleteDoc(favoriteRef);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  async isFavorite(fused: FusedPokemon): Promise<boolean> {
    try {
      const favoritesRef = collection(db, this.collectionName);
      const q = query(
        favoritesRef,
        where('name', '==', fused.name)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const favorites = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const createdAt = data['createdAt'];
        return {
          ...data,
          createdAt: createdAt?.toDate?.()?.toISOString() || createdAt
        } as FusedPokemon;
      });

      return favorites.some(f =>
        f.name === fused.name &&
        new Date(f.createdAt).getTime() === new Date(fused.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }
}

