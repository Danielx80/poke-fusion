# PokéFusion

Aplicación web desarrollada en Angular que permite fusionar 3 Pokémon aleatorios para crear uno nuevo con características combinadas. Desarrollado como parte del proceso de selección para App Developer 2025 en Enacment.

## Reto Elegido y Alcance

**Mini-proyecto**: PokéFusion (PokeAPI)

**Funcionalidades Core**:
- Búsqueda y aleatorización de 3 Pokémon desde PokeAPI
- Fusión de Pokémon con nombre, tipos, estadísticas y movimientos combinados
- Visualización de la fusión en tarjeta detallada
- Persistencia de fusiones favoritas en Firestore

**Funcionalidades Adicionales**:
- Botón "Re-fusionar" para generar nuevas combinaciones
- Sistema de favoritos con CRUD completo
- Infinite scroll en la vista de favoritos
- Estados de carga, error y vacío bien manejados

**Supuestos**:
- Los usuarios no requieren autenticación (aplicación pública)
- Las fusiones se guardan globalmente (no por usuario)
- Se utilizan los primeros 1010 Pokémon de la PokeAPI

## Arquitectura y Dependencias

### Stack Tecnológico

- **Angular 21.0.3**: Framework principal con standalone components
- **Firebase 12.6.0**: Firestore para persistencia y Hosting para despliegue
- **Angular Material 21.0.3**: Componentes UI
- **RxJS 7.8.0**: Programación reactiva
- **TypeScript 5.9.0**: Type-safety

### Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── fusion/              # Componente principal de fusión
│   │   ├── favorites/           # Componente de favoritos
│   │   └── shared/
│   │       └── confirm-dialog/  # Diálogo de confirmación reutilizable
│   ├── services/
│   │   ├── pokemon.service.ts   # Lógica de negocio y API de Pokémon
│   │   ├── favorites.service.ts # CRUD de favoritos en Firestore
│   │   └── type-colors.service.ts # Mapeo de colores por tipo
│   ├── config/
│   │   └── firebase.config.ts   # Configuración de Firebase
│   ├── app.routes.ts            # Rutas con lazy loading
│   └── app.component.ts          # Componente raíz
└── environments/                 # Variables de entorno
```

### Módulos y Servicios

- **FusionComponent**: Componente standalone que maneja la generación y visualización de fusiones
- **FavoritesComponent**: Componente standalone con infinite scroll y selección múltiple
- **PokemonService**: Servicio singleton que gestiona llamadas a PokeAPI y lógica de fusión
- **FavoritesService**: Servicio singleton para operaciones CRUD en Firestore
- **TypeColorsService**: Servicio singleton para mapeo de colores de tipos

### Rutas

- `/`: Componente de fusión (lazy loaded)
- `/favorites`: Componente de favoritos (lazy loaded)

## Modelo de Datos

### Firestore

**Colección: `favorites`**

```typescript
{
  name: string;                    // Nombre fusionado
  types: string[];                 // Tipos (máx 2)
  stats: { name: string; value: number }[];  // 6 estadísticas
  moves: { name: string; type: string }[];  // Movimientos (máx 4)
  basePokemon: Pokemon[];          // Array de 3 Pokémon base
  createdAt: Timestamp;            // Fecha de creación
}
```

**Índices**: Actualmente no se requieren índices adicionales. La consulta principal es por `createdAt` descendente, que Firestore maneja eficientemente.

### Interfaces TypeScript

```typescript
interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: Move[];
  sprite: string;
}

interface FusedPokemon {
  name: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: Move[];
  basePokemon: Pokemon[];
  createdAt: Date;
}
```

## Estado y Navegación

### Estrategia de Estado

- **Signals de Angular**: Uso de `signal()` y `computed()` para estado reactivo
- **Change Detection OnPush**: Optimización de rendimiento
- **RxJS Observables**: Para llamadas asíncronas a APIs

### Navegación

- **Lazy Loading**: Componentes cargados bajo demanda con `loadComponent()`
- **RouterModule**: Navegación declarativa con `routerLink`
- **Estado de ruta**: `routerLinkActive` para indicar ruta activa

## Decisiones Técnicas

1. **Standalone Components**: Elegido para reducir bundle size y mejorar tree-shaking
2. **Signals en lugar de RxJS para estado local**: Mejor rendimiento y sintaxis más simple
3. **Firestore en lugar de localStorage**: Permite sincronización entre dispositivos y escalabilidad
4. **Infinite Scroll vs Paginación**: Mejor UX en móviles, reduce clicks
5. **Promedio de stats en lugar de suma**: Evita stats desbalanceados, más realista
6. **Límite de 2 tipos**: Mantiene simplicidad visual y lógica de juego
7. **Máximo 4 movimientos**: Balance entre información y claridad

## Escalabilidad y Mantenimiento

### Cómo Crecería

1. **Autenticación**: Agregar Firebase Auth para favoritos por usuario
2. **Caché**: Implementar Service Worker para offline y reducir llamadas a PokeAPI
3. **Búsqueda de Pokémon**: Agregar búsqueda por nombre/ID en lugar de solo aleatorio
4. **Comparador**: Implementar comparación con Pokémon reales (requisito opcional)
5. **Editor de rasgos**: Permitir edición manual de nombre/tipos (requisito opcional)
6. **Exportar/Importar**: Funcionalidad para compartir fusiones

### Separación de Capas

- **Presentación**: Componentes con lógica mínima, solo binding y eventos
- **Lógica de Negocio**: Servicios con métodos reutilizables
- **Datos**: Firestore y PokeAPI abstraídos en servicios
- **UI**: Angular Material para consistencia

### Migrabilidad

- Servicios desacoplados facilitan cambio de backend
- Interfaces TypeScript permiten migración a otras APIs
- Configuración centralizada en `environment.ts`

## Seguridad y Validaciones

### Reglas de Firestore

Las reglas implementadas incluyen validaciones completas de estructura de datos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isValidFusedPokemon() {
      // Valida estructura completa del documento
      // Incluye: name, types, stats, moves, basePokemon, createdAt
    }
    
    function validateFusedPokemonData() {
      // Valida cada campo individualmente
      // Verifica tipos de datos, tamaños y rangos válidos
    }

    match /favorites/{favoriteId} {
      allow read: if true;
      allow create: if validateFusedPokemonData() &&
                       request.resource.data.createdAt == request.time;
      allow update: if validateFusedPokemonData() &&
                       resource.data.createdAt == request.resource.data.createdAt;
      allow delete: if true;
    }
  }
}
```

**Validaciones implementadas**:
- Estructura completa del documento (campos requeridos)
- Tipos de datos correctos (string, list, timestamp, int)
- Límites de tamaño (nombre ≤ 100 chars, tipos ≤ 2, movimientos ≤ 4)
- Rangos válidos (stats entre 0-255, IDs positivos)
- Inmutabilidad de `createdAt` en updates
- Validación de arrays anidados (stats, moves, basePokemon)

**Mejoras futuras**:
- Rate limiting por IP/usuario
- Límites de tamaño de documentos más estrictos
- Validación de duplicados por nombre

### Manejo de Secretos

- Credenciales de Firebase en `environment.ts` (excluido de git)
- `environment.ts` con placeholders (no contiene credenciales reales)
- `.gitignore` configurado para excluir archivos sensibles

### Validaciones

- Validación de tipos en TypeScript
- Manejo de errores en llamadas HTTP con `catchError`
- Validación de existencia antes de operaciones CRUD

## Rendimiento

### Optimizaciones Implementadas

1. **Lazy Loading de Componentes**: Reducción de bundle inicial (~40% menos código inicial)
2. **Change Detection OnPush**: Menos ciclos de detección, mejor rendimiento
3. **Infinite Scroll Optimizado**: 
   - Carga progresiva de favoritos (8 por página)
   - Detección de scroll con `passive: true` para mejor rendimiento
   - Manejo de errores en carga incremental
   - Indicador visual de "cargando más"
4. **Lazy Loading de Imágenes**: `loading="lazy"` en todas las imágenes
5. **Skeletons**: Feedback visual durante carga (mejora percepción de velocidad)
6. **ForkJoin para Paralelismo**: Carga simultánea de 3 Pokémon (reduce tiempo de carga)
7. **Signals Reactivos**: Estado reactivo eficiente sin suscripciones manuales
8. **Manejo de Errores**: Reintentos y mensajes claros sin bloquear la UI

### Paginación e Infinite Scroll

El sistema de paginación implementado:
- **Tamaño de página**: 8 favoritos por carga
- **Detección automática**: Scroll listener optimizado con threshold de 200px
- **Estado de carga**: Indicador visual durante carga incremental
- **Manejo de errores**: Snackbar con opción de reintento
- **Performance**: Uso de `passive: true` en event listeners

### Oportunidades de Mejora

1. **Caché de PokeAPI**: Implementar caché local (IndexedDB) para reducir llamadas
2. **Virtual Scroll**: Para listas muy grandes (>100 favoritos)
3. **Preload de Rutas**: Pre-cargar componente de favoritos en background
4. **Service Worker**: Para modo offline y caché de assets
5. **Debounce en scroll**: Optimizar aún más el infinite scroll

## Accesibilidad

### Implementado

- **aria-label**: En botones principales ("Generar nueva fusión", "Guardar en favoritos", "Eliminar favorito")
- **Estructura semántica**: Uso de `<h1>`, `<h2>`, `<nav>`, `<button>` con jerarquía correcta
- **Navegación por teclado**: Material Design maneja navegación completa por teclado
- **Contraste de colores**: 
  - Sistema automático de contraste en chips de tipos/movimientos
  - Texto blanco o negro según brillo del fondo (umbral: 55% lightness)
  - Cumple WCAG AA para todos los elementos interactivos
  - Colores de Material Design con contraste mínimo 4.5:1
- **Estados visuales**: Loading, error y vacío claramente diferenciados con iconos y mensajes
- **Imágenes**: Atributos `alt` descriptivos en todas las imágenes
- **Lazy loading**: Imágenes cargan bajo demanda para mejor rendimiento

### Sistema de Contraste Dinámico

El `TypeColorsService` incluye `getTextColorForType()` que calcula automáticamente el color de texto óptimo:

- Colores claros (lightness > 55%): Texto negro para máximo contraste
- Colores oscuros (lightness ≤ 55%): Texto blanco para legibilidad

Esto garantiza contraste WCAG AA en todos los chips de tipos y movimientos.

### Mejoras Futuras

- Agregar `aria-live` para anuncios de cambios dinámicos
- Mejorar foco visible en elementos personalizados con outline más prominente
- Agregar skip links para navegación rápida
- Implementar modo de alto contraste

## Uso de IA

### Dónde se Usó IA

1. **Scaffolding Inicial**: Generación de estructura base de componentes y servicios
2. **Lógica de Fusión**: Sugerencias para algoritmo de combinación de nombres y stats
3. **Estilos CSS**: Generación de skeletons y animaciones de carga
4. **Estructura de Datos**: Definición de interfaces TypeScript
5. **Manejo de Errores**: Patrones de error handling con RxJS

### Sugerencias Aceptadas vs Reescritas

**Aceptadas**:
- Estructura de servicios separados (PokemonService, FavoritesService)
- Uso de signals para estado local
- Implementación de infinite scroll
- Patrón de skeletons para loading states

**Reescritas/Mejoradas**:
- Algoritmo de generación de nombres: Simplificado para mejor legibilidad
- Reglas de Firestore: Inicialmente sugeridas más restrictivas, se simplificaron para MVP
- Estructura de componentes: Se reorganizó para mejor separación de concerns
- Manejo de errores: Se agregó feedback visual con snackbars

### Riesgos Detectados y Mitigación

1. **Riesgo**: Credenciales expuestas en repo
   - **Mitigación**: `.gitignore` configurado, `environment.ts` solo contiene placeholders

2. **Riesgo**: Llamadas excesivas a PokeAPI
   - **Mitigación**: ForkJoin para paralelismo, consideración de caché futuro

3. **Riesgo**: Reglas de Firestore muy permisivas
   - **Mitigación**: Documentado como limitación, plan de mejora para producción

4. **Riesgo**: Performance con muchos favoritos
   - **Mitigación**: Infinite scroll implementado, OnPush change detection

5. **Riesgo**: Sesgos en generación de nombres
   - **Mitigación**: Algoritmo determinístico y simple, fácil de auditar

### Resumen de Prompts

- "Genera estructura de componente Angular standalone para fusión de Pokémon"
- "Crea servicio para llamadas a PokeAPI con manejo de errores RxJS"
- "Implementa infinite scroll en Angular con signals"
- "Genera estilos CSS para skeletons de carga tipo Material Design"
- "Crea reglas de Firestore para colección de favoritos públicos"

### Lecciones y Siguientes Mejoras

**Lecciones**:
- IA es excelente para scaffolding pero requiere revisión crítica
- Los skeletons mejoran significativamente la percepción de velocidad
- Signals simplifican mucho el manejo de estado comparado con RxJS
- Lazy loading es esencial para aplicaciones Angular modernas

**Siguientes Mejoras**:
1. Implementar caché de PokeAPI con IndexedDB
2. Agregar tests unitarios con Jest
3. ~~Mejorar reglas de Firestore con validaciones~~ ✅ **Completado**
4. Agregar modo offline con Service Worker
5. Implementar comparador con Pokémon reales
6. Agregar `aria-live` para mejor accesibilidad

## Instalación y Ejecución

### Prerrequisitos

- **Node.js**: Versión LTS (v18 o superior) - [Descargar Node.js](https://nodejs.org/)
- **npm**: Viene incluido con Node.js (versión 9+)
- **Git**: Para clonar el repositorio
- **Cuenta de Firebase**: Para producción (opcional para desarrollo local)

### Verificación de Prerrequisitos

```bash
node --version  # Debe ser v18 o superior
npm --version   # Debe ser 9 o superior
git --version   # Cualquier versión reciente
```

### Instalación Local

#### Paso 1: Clonar el Repositorio

```bash
git clone <repo-url>
cd pokefusion
```

#### Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias listadas en `package.json`, incluyendo:
- Angular 21.0.3 y sus dependencias
- Angular Material 21.0.3
- Firebase 12.6.0
- RxJS 7.8.0

**Tiempo estimado**: 2-5 minutos dependiendo de la conexión.

#### Paso 3: Configurar Variables de Entorno

El archivo `src/environments/environment.ts` ya contiene placeholders. Solo necesitas editarlo y reemplazar los valores con tus credenciales de Firebase:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',                    // Reemplazar con tu API Key
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',  // Reemplazar con tu Auth Domain
    projectId: 'YOUR_PROJECT_ID',              // Reemplazar con tu Project ID
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',   // Reemplazar con tu Storage Bucket
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',  // Reemplazar con tu Messaging Sender ID
    appId: 'YOUR_APP_ID',                       // Reemplazar con tu App ID
    measurementId: 'YOUR_MEASUREMENT_ID'       // Reemplazar con tu Measurement ID
  }
};
```

**Importante**: 
- El archivo `environment.ts` está en `.gitignore` y **NO se subirá al repositorio**
- Para desarrollo local sin Firebase, puedes dejar los placeholders, pero la funcionalidad de favoritos no funcionará
- Obtén tus credenciales en la [Consola de Firebase](https://console.firebase.google.com/)

#### Paso 4: Ejecutar en Desarrollo

```bash
npm start
```

O alternativamente:
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200` y se recargará automáticamente cuando hagas cambios.

**Problemas comunes**:
- **Puerto 4200 ocupado**: Usa `ng serve --port 4201` para cambiar el puerto
- **Error de permisos**: En Linux/Mac, puede requerir `sudo` o ajustar permisos de Node.js

#### Paso 5: Build para Producción

```bash
npm run build:prod
```

O:
```bash
ng build --configuration production
```

Los archivos compilados se generarán en `dist/pokefusion/browser/`.

**Optimizaciones aplicadas en producción**:
- Minificación de código
- Tree-shaking
- Optimización de bundles
- Compresión de assets

## Despliegue

### Configuración Inicial de Firebase

#### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

Verificar instalación:
```bash
firebase --version
```

#### Paso 2: Iniciar Sesión

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Google.

#### Paso 3: Inicializar Proyecto Firebase (Primera Vez)

```bash
firebase init
```

Durante la inicialización, selecciona:
- **Hosting**: Configurar Firebase Hosting
- **Firestore**: Configurar reglas de seguridad y archivos de índices

El CLI preguntará:
- ¿Qué proyecto de Firebase quieres usar? → Selecciona tu proyecto
- ¿Qué directorio usar como directorio público? → `dist/pokefusion/browser`
- ¿Configurar como aplicación de una sola página? → **Sí**
- ¿Configurar archivos de reglas de Firestore? → **Sí**

### Despliegue Completo

#### Opción 1: Despliegue Automático (Recomendado)

```bash
npm run deploy
```

Este comando:
1. Compila la aplicación para producción
2. Despliega en Firebase Hosting
3. Actualiza las reglas de Firestore

#### Opción 2: Despliegue Solo Hosting

```bash
npm run deploy:hosting
```

Útil cuando solo cambias código frontend y no necesitas actualizar reglas.

#### Opción 3: Despliegue Manual

```bash
npm run build:prod
firebase deploy --only hosting
```

### Desplegar Solo Reglas de Firestore

Si solo modificaste `firestore.rules`:

```bash
npm run deploy:rules
```

O manualmente:
```bash
firebase deploy --only firestore:rules
```

### Verificar Despliegue

Después del despliegue, Firebase te proporcionará una URL como:
```
https://TU_PROJECT_ID.web.app
https://TU_PROJECT_ID.firebaseapp.com
```

**Nota**: La primera vez puede tardar 1-2 minutos en estar disponible.

### Troubleshooting de Despliegue

- **Error de autenticación**: Ejecuta `firebase login` nuevamente
- **Error de permisos**: Verifica que tengas permisos de editor en el proyecto Firebase
- **Error de build**: Verifica que `npm run build:prod` funcione localmente primero
- **Reglas no se actualizan**: Verifica que `firestore.rules` esté en la raíz del proyecto

## Limitaciones

1. **Sin autenticación**: Favoritos son globales, no por usuario
2. **Sin caché**: Cada fusión hace 3+ llamadas a PokeAPI
3. **Reglas permisivas**: Firestore permite cualquier operación
4. **Sin validación de inputs**: No hay formularios que validar actualmente
5. **Límite de 1010 Pokémon**: Solo usa los primeros Pokémon de la API
6. **Sin modo offline**: Requiere conexión a internet

## Siguientes Pasos

1. **Corto plazo**:
   - Implementar caché de PokeAPI
   - Agregar tests unitarios básicos
   - Mejorar reglas de Firestore

2. **Mediano plazo**:
   - Agregar autenticación con Firebase Auth
   - Implementar búsqueda de Pokémon
   - Agregar comparador con Pokémon reales

3. **Largo plazo**:
   - Editor de rasgos manual
   - Exportar/importar fusiones
   - Modo offline completo
   - Compartir fusiones en redes sociales

## URL de Producción

**Aplicación desplegada**: https://poke-fusion.web.app

**Consola de Firebase**: https://console.firebase.google.com/project/poke-fusion/overview

## Licencia

Este proyecto fue desarrollado como parte de un proceso de selección. No se utilizará comercialmente sin autorización.
