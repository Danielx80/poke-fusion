import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, catchError, of } from 'rxjs';

export interface Move {
  name: string;
  type: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: Move[];
  sprite: string;
}

export interface FusedPokemon {
  name: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: Move[];
  basePokemon: Pokemon[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getRandomPokemon(): Observable<Pokemon> {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    return this.getPokemonById(randomId);
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<any>(`${this.apiUrl}/pokemon/${id}`).pipe(
      switchMap(data => {
        const moveRequests = data.moves.slice(0, 4).map((m: any) =>
          this.http.get<any>(m.move.url).pipe(
            map((moveData: any): Move => {
              const moveType = moveData.type?.name || 'normal';
              console.log(`[DEBUG] Movimiento: ${moveData.name} | Tipo recibido: ${moveData.type?.name || 'NO TIENE TIPO'} | Tipo usado: ${moveType}`);
              if (!moveData.type?.name) {
                console.warn(`Move ${moveData.name} no tiene tipo en la API, usando 'normal'`);
              }
              return {
                name: moveData.name,
                type: moveType
              };
            }),
            catchError(error => {
              console.error('Error obteniendo tipo de movimiento:', error);
              return of({
                name: m.move.name,
                type: 'normal'
              } as Move);
            })
          )
        );

        return forkJoin<Move[]>(moveRequests).pipe(
          map((moves: Move[]): Pokemon => ({
            id: data.id,
            name: data.name,
            types: data.types.map((t: any) => t.type.name),
            stats: data.stats.map((s: any) => ({
              name: s.stat.name.replace('-', '_'),
              value: s.base_stat
            })),
            moves,
            sprite: data.sprites.front_default
          }))
        );
      })
    );
  }

  getThreeRandomPokemon(): Observable<Pokemon[]> {
    return forkJoin([
      this.getRandomPokemon(),
      this.getRandomPokemon(),
      this.getRandomPokemon()
    ]);
  }

  fusePokemon(pokemon1: Pokemon, pokemon2: Pokemon, pokemon3: Pokemon): FusedPokemon {
    const allTypes = [...pokemon1.types, ...pokemon2.types, ...pokemon3.types];
    const uniqueTypes = Array.from(new Set(allTypes)).slice(0, 2);

    const fusedName = this.generateFusedName(
      pokemon1.name,
      pokemon2.name,
      pokemon3.name
    );

    const stats = pokemon1.stats.map(stat => ({
      name: stat.name,
      value: Math.floor(
        ((pokemon1.stats.find(s => s.name === stat.name)?.value || 0) +
         (pokemon2.stats.find(s => s.name === stat.name)?.value || 0) +
         (pokemon3.stats.find(s => s.name === stat.name)?.value || 0)) / 3
      )
    }));

    const allMoves = [
      ...pokemon1.moves,
      ...pokemon2.moves,
      ...pokemon3.moves
    ];
    const uniqueMovesMap = new Map<string, Move>();
    allMoves.forEach(move => {
      if (!uniqueMovesMap.has(move.name)) {
        uniqueMovesMap.set(move.name, move);
      }
    });
    const uniqueMoves = Array.from(uniqueMovesMap.values()).slice(0, 4);

    return {
      name: fusedName,
      types: uniqueTypes,
      stats,
      moves: uniqueMoves,
      basePokemon: [pokemon1, pokemon2, pokemon3],
      createdAt: new Date()
    };
  }

  private generateFusedName(name1: string, name2: string, name3: string): string {
    const parts1 = this.splitName(name1);
    const parts2 = this.splitName(name2);
    const parts3 = this.splitName(name3);

    const combined = [
      parts1[0] || name1.substring(0, 3),
      parts2[1] || name2.substring(name2.length - 3),
      parts3[0] || name3.substring(0, 2)
    ].join('');

    return combined.charAt(0).toUpperCase() + combined.slice(1);
  }

  private splitName(name: string): string[] {
    const mid = Math.floor(name.length / 2);
    return [name.substring(0, mid), name.substring(mid)];
  }
}

