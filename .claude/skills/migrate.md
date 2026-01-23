# Skill: Migration Helper

Guía paso a paso para realizar cambios en la base de datos con Prisma.

## Uso

```
/migrate
```

El skill te guiará interactivamente a través del proceso de migración.

## Instrucciones

Cuando el usuario ejecute este skill, seguir estos pasos:

### 1. Identificar el tipo de cambio

Preguntar al usuario qué tipo de cambio necesita:

1. **Agregar nuevo modelo** - Nueva tabla/entidad
2. **Agregar campo** - Nuevo campo a modelo existente
3. **Modificar campo** - Cambiar tipo, constraints, etc.
4. **Agregar relación** - Nueva relación entre modelos
5. **Eliminar campo/modelo** - Remover elementos existentes
6. **Agregar enum** - Nuevo tipo enumerado

### 2. Recopilar detalles

Según el tipo de cambio, preguntar:

#### Para nuevo modelo:
- Nombre del modelo (singular, PascalCase)
- Campos con sus tipos y constraints
- Relaciones con otros modelos

#### Para nuevo campo:
- Modelo destino
- Nombre del campo (camelCase)
- Tipo de dato (String, Int, Boolean, DateTime, etc.)
- ¿Es requerido u opcional?
- ¿Tiene valor por defecto?
- ¿Es único?

#### Para nueva relación:
- Modelos involucrados
- Tipo de relación (1:1, 1:N, N:M)
- ¿Cascade delete?

### 3. Mostrar cambios propuestos

Antes de hacer cambios, mostrar al usuario:

```
📋 Cambios propuestos en schema.prisma:

[Mostrar el código Prisma que se agregará/modificará]

⚠️ Impacto en código existente:
- [Listar archivos que podrían necesitar actualización]
```

### 4. Aplicar cambios al schema

Archivo: `backend/prisma/schema.prisma`

Seguir convenciones:
- IDs: `@id @default(uuid())`
- Nombres en DB: `@map("snake_case")`
- Tabla en DB: `@@map("plural_snake_case")`
- Índices en FKs frecuentes: `@@index([foreignKeyId])`

### 5. Guiar ejecución de comandos

Indicar al usuario que ejecute:

```bash
# 1. Crear migración
cd backend
npx prisma migrate dev --name [nombre_descriptivo]

# 2. Regenerar cliente
npm run generate
```

**Nota**: Si hay datos existentes y el campo es requerido sin default, Prisma preguntará cómo manejar los registros existentes.

### 6. Identificar archivos a actualizar

Después de la migración, listar archivos que probablemente necesiten cambios:

#### Si se agregó un campo:
- `backend/src/features/[feature]/[feature].service.ts` - Lógica de creación/actualización
- `backend/src/features/[feature]/[feature].controller.ts` - Validación de inputs
- `backend/src/features/[feature]/[feature].schema.ts` - Schema Swagger
- `backend/src/mappers/[entity].mapper.ts` - Incluir nuevo campo en DTO
- `frontend/src/types/` - Tipos TypeScript
- `frontend/src/i18n/locales/` - Traducciones si es visible en UI

#### Si se agregó una relación:
- Repository del modelo principal - Incluir en queries
- Mapper - Transformar relación a DTO
- Frontend service - Manejar datos relacionados

### 7. Verificación

Sugerir al usuario verificar:

```bash
# Verificar que el servidor inicie sin errores
npm run dev:backend

# Verificar la documentación API
http://localhost:3000/apidocs
```

## Ejemplos de cambios comunes

### Agregar campo opcional
```prisma
model Club {
  // campos existentes...
  foundedYear Int? @map("founded_year")  // Nuevo campo
}
```

### Agregar campo requerido con default
```prisma
model Player {
  // campos existentes...
  position String @default("Unknown")
}
```

### Agregar relación 1:N
```prisma
model Trophy {
  id      String @id @default(uuid())
  clubId  String @map("club_id")
  club    Club   @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId])
}

model Club {
  // campos existentes...
  trophies Trophy[]
}
```

### Agregar enum
```prisma
enum TrophyType {
  LEAGUE
  CUP
  SUPERCUP
}

model Trophy {
  type TrophyType
}
```

## Rollback

Si algo sale mal:

```bash
# Ver historial de migraciones
npx prisma migrate status

# Resetear base de datos (¡CUIDADO: borra datos!)
npx prisma migrate reset

# O restaurar desde backup si tienes uno
```

## Referencia del schema actual

El schema actual está en: `backend/prisma/schema.prisma`

Modelos existentes:
- User, Club, Player, SalaryRate
- Season, Competition, CompetitionType
- Match, Event, EventType, MatchCovid
- SeasonTransition, ClubHistory, PlayerSeasonStats, CoefKempes

Enums existentes:
- RoleType, MatchStatus, CompetitionFormat, CompetitionStage
- KnockoutRound, CompetitionCategory, CompetitionName
- EventTypeName, MovementType, CupPhase
