# Kempes Master League - Convenciones del Proyecto

Sistema de gestión de ligas de fútbol con soporte para ligas multi-tier, copas con fases de grupos y eliminatorias.

## Stack Tecnológico

### Backend
- **Framework**: Fastify v5 + TypeScript
- **ORM**: Prisma con PostgreSQL
- **DI**: Awilix (inyección de dependencias)
- **Auth**: JWT con cookies httpOnly
- **Validación**: Zod + Validator utility

### Frontend
- **Framework**: React 19 + TypeScript
- **Routing**: TanStack Router (file-based)
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **i18n**: i18next (ES/EN)

## Arquitectura Backend

### Estructura de carpetas
```
backend/src/features/[feature]/
├── [feature].controller.ts    # Handlers HTTP
├── [feature].service.ts       # Lógica de negocio
├── [feature].repository.ts    # Acceso a datos
├── [feature].routes.ts        # Definición de rutas
├── [feature].schema.ts        # Schemas para Swagger
├── [feature].errors.ts        # Errores personalizados
└── interfaces/
    └── I[Feature]Repository.ts
```

### Patrón de capas
1. **Controller**: Valida inputs, llama al service, transforma respuesta con mapper
2. **Service**: Lógica de negocio, usa repository para datos
3. **Repository**: Implementa interface, usa Prisma para queries

### Convenciones de naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Clases | PascalCase | `ClubController`, `ClubService` |
| Interfaces | Prefijo `I` | `IClubRepository` |
| Métodos | camelCase | `findAllClubs`, `createClub` |
| Errores | `[Feature]Error` | `ClubNotFoundError` |
| Archivos | kebab-case | `clubs.controller.ts` |

### Validación
Usar el utility `Validator` de `@/features/utils/validation`:
```typescript
import { Validator } from '@/features/utils/validation'

const validId = Validator.uuid(id)
const validName = Validator.string(name, 1, 100)
const validEmail = Validator.email(email)
const validUrl = Validator.url(logo)
```

### Respuestas
Usar helpers de `@/features/core` (Response):
```typescript
import { Response } from '@/features/core'

return Response.success(reply, data, 'Message')
return Response.created(reply, data, 'Created')
return Response.notFound(reply, 'Entity', id)
return Response.error(reply, 'ERROR_CODE', 'Message', 500, details)
return Response.validation(reply, 'Validation error', 'Details')
```

### Mappers
Ubicación: `backend/src/mappers/[entity].mapper.ts`
```typescript
export class ClubMapper {
  static toDTO(club: Club): ClubDTO { ... }
  static toDTOArray(clubs: Club[]): ClubDTO[] { ... }
  static toPaginatedDTO(...): PaginatedResponse<ClubDTO> { ... }
}
```

### Registro en DI Container
Archivo: `backend/src/features/core/container/index.ts`
```typescript
// Agregar imports
import { FeatureRepository } from '@/features/[feature]/[feature].repository'
import { FeatureController } from '@/features/[feature]/[feature].controller'
import { FeatureService } from '@/features/[feature]/[feature].service'

// Registrar en container
container.register({
  featureRepository: asClass(FeatureRepository).singleton(),
  featureController: asClass(FeatureController).singleton(),
  featureService: asClass(FeatureService).singleton(),
})
```

### Registro de rutas
Archivo: `backend/src/features/api/routes.ts`
```typescript
import { featureRoutes } from '@/features/[feature]/[feature].routes'

instance.register(featureRoutes, { prefix: '/[features]' })
```

## Arquitectura Frontend

### Estructura de carpetas
```
frontend/src/
├── routes/                    # File-based routing (TanStack)
│   └── management/[feature]/  # Páginas de gestión
├── services/                  # API services
│   └── [feature].service.ts
├── components/
│   ├── ui/                    # Shadcn components
│   └── table/                 # Data table components
├── context/                   # React Context
├── i18n/
│   └── locales/
│       ├── en/[feature].json
│       └── es/[feature].json
└── types/
```

### i18n - Traducciones
Estructura de archivos de traducción:
```json
{
  "title": "Gestión de [Feature]",
  "create": {
    "title": "Crear Nuevo [Entity]",
    "description": "Agregar un nuevo [entity] al sistema",
    "button": "Nuevo [Entity]",
    "success": "¡[Entity] creado exitosamente!",
    "error": "Error al crear [entity]"
  },
  "edit": { ... },
  "delete": { ... },
  "fields": { ... },
  "labels": { ... },
  "placeholders": { ... },
  "buttons": { ... },
  "table": { ... }
}
```

Registrar en `frontend/src/i18n/config.ts`:
```typescript
import enFeature from './locales/en/[feature].json'
import esFeature from './locales/es/[feature].json'

// En resources:
en: { ..., feature: enFeature },
es: { ..., feature: esFeature },

// En ns array:
ns: [..., 'feature'],
```

## Base de Datos (Prisma)

### Convenciones del schema
- **IDs**: UUID con `@id @default(uuid())`
- **Nombres de campo**: camelCase en código, snake_case en DB con `@map()`
- **Relaciones**: Usar `onDelete: Cascade` donde corresponda
- **Índices**: En campos de FK frecuentemente consultados
- **Enums**: Para estados y tipos fijos

### Ejemplo de modelo
```prisma
model Feature {
  id        String   @id @default(uuid())
  name      String   @unique
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("features")
}
```

## Archivos de Referencia

Para crear nuevas features, usar como ejemplo:
- **Backend completo**: `backend/src/features/clubs/`
- **DI Container**: `backend/src/features/core/container/index.ts`
- **Routes registry**: `backend/src/features/api/routes.ts`
- **Mapper**: `backend/src/mappers/club.mapper.ts`
- **Frontend management**: `frontend/src/routes/management/clubs/`
- **Frontend service**: `frontend/src/services/club.service.ts`
- **i18n**: `frontend/src/i18n/locales/es/clubs.json`

## Comandos útiles

```bash
# Desarrollo
npm run dev              # Backend + Frontend concurrentes
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run generate         # Regenerar Prisma client

# API Docs
http://localhost:3000/apidocs  # Swagger UI
```
