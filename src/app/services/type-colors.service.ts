import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TypeColorsService {
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
    fairy: 'hsl(330, 60%, 75%)',
  };

  getTypeColor(type: string): string {
    const normalizedType = type.toLowerCase().trim();
    const color = this.TYPE_COLORS[normalizedType] || 'hsl(0, 0%, 50%)';
    if (!this.TYPE_COLORS[normalizedType]) {
      console.warn(
        `Tipo "${type}" (normalizado: "${normalizedType}") no encontrado en colores, usando gris por defecto`
      );
    } else {
      console.log(`Tipo: ${normalizedType} -> Color: ${color}`);
    }
    return color;
  }
}
