# Skill: Feature Generator

Genera una feature CRUD completa siguiendo los patrones del proyecto Kempes Master League.

## Uso

```
/feature [NombreEntidad]
```

Ejemplo: `/feature Trophy` generará todo el CRUD para la entidad "Trophy".

## Instrucciones

Cuando el usuario ejecute este skill con el nombre de una entidad, seguir estos pasos en orden:

### 1. Recopilar información

Preguntar al usuario:
1. **Campos de la entidad**: ¿Qué campos tendrá? (nombre, tipo, requerido, único)
2. **Relaciones**: ¿Se relaciona con otras entidades existentes?
3. **Soft delete**: ¿Usar soft delete (isActive) o hard delete?

### 2. Generar modelo en Prisma

Archivo: `backend/prisma/schema.prisma`

Seguir el patrón:
```prisma
model [Entity] {
  id        String   @id @default(uuid())
  // campos...
  isActive  Boolean  @default(true) @map("is_active")

  @@map("[entities]")  // plural, snake_case
}
```

### 3. Generar Backend

Crear la carpeta `backend/src/features/[entities]/` con:

#### 3.1 Interface del Repository
`interfaces/I[Entity]Repository.ts`
```typescript
import { Prisma, [Entity] } from '@prisma/client'

export interface I[Entity]Repository {
  findAll(): Promise<[Entity][] | null>
  findOneById(id: string): Promise<[Entity] | null>
  save(data: Prisma.[Entity]CreateInput): Promise<[Entity]>
  updateOneById(id: string, data: Prisma.[Entity]UpdateInput): Promise<[Entity]>
  deleteOneById(id: string): Promise<[Entity]>
}
```

#### 3.2 Repository
`[entities].repository.ts` - Implementar interface con Prisma

#### 3.3 Errors
`[entities].errors.ts`
```typescript
export class [Entity]NotFoundError extends Error {
  constructor(message = '[Entity] not found.') {
    super(message)
    this.name = '[Entity]NotFoundError'
  }
}

export class [Entity]AlreadyExistsError extends Error {
  constructor(message = '[Entity] already exists.') {
    super(message)
    this.name = '[Entity]AlreadyExistsError'
  }
}
```

#### 3.4 Service
`[entities].service.ts` - Lógica de negocio usando repository

#### 3.5 Controller
`[entities].controller.ts` - Handlers HTTP usando Validator y Response helpers

#### 3.6 Schema (Swagger)
`[entities].schema.ts` - Schemas para documentación API

#### 3.7 Routes
`[entities].routes.ts` - Definición de rutas Fastify

### 4. Registrar en DI Container

Archivo: `backend/src/features/core/container/index.ts`

Agregar imports y registros para Repository, Service y Controller.

### 5. Registrar Rutas

Archivo: `backend/src/features/api/routes.ts`

```typescript
import { [entity]Routes } from '@/features/[entities]/[entities].routes'
// ...
instance.register([entity]Routes, { prefix: '/[entities]' })
```

### 6. Crear Mapper

Archivo: `backend/src/mappers/[entity].mapper.ts`

### 7. Generar Frontend

#### 7.1 Service
`frontend/src/services/[entity].service.ts`

#### 7.2 Página de gestión
`frontend/src/routes/management/[entities]/index.tsx`

#### 7.3 Traducciones
- `frontend/src/i18n/locales/en/[entities].json`
- `frontend/src/i18n/locales/es/[entities].json`

Actualizar `frontend/src/i18n/config.ts` para incluir las nuevas traducciones.

### 8. Ejecutar migraciones

Indicar al usuario que ejecute:
```bash
npm run migrate
npm run generate
```

## Archivos de referencia

Usar como ejemplo la feature `clubs`:
- `backend/src/features/clubs/` - Backend completo
- `backend/src/mappers/club.mapper.ts` - Mapper
- `frontend/src/services/club.service.ts` - Frontend service
- `frontend/src/routes/management/clubs/` - UI de gestión
- `frontend/src/i18n/locales/es/clubs.json` - Traducciones

## Checklist final

- [ ] Modelo creado en `schema.prisma`
- [ ] Interface del repository
- [ ] Repository implementado
- [ ] Errors personalizados
- [ ] Service con lógica de negocio
- [ ] Controller con validación
- [ ] Schema para Swagger
- [ ] Routes definidas
- [ ] Registrado en DI container
- [ ] Rutas registradas en `api/routes.ts`
- [ ] Mapper creado
- [ ] Service de frontend
- [ ] Página de gestión
- [ ] Traducciones EN/ES
- [ ] Config i18n actualizado
