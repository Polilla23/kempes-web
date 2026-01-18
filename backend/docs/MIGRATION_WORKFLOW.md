# 🔄 Flujo de Trabajo de Migraciones Prisma

Este documento define el flujo profesional de migraciones para el equipo.

## 📋 Reglas de Oro

1. **NUNCA `migrate reset` en DB compartida o producción**
2. Cada desarrollador debe tener su propia DB de desarrollo
3. La DB "compartida" se actualiza SOLO con `migrate deploy`
4. Todos los cambios de schema pasan por migraciones versionadas

---

## 🗄️ Estructura de Bases de Datos

### DB de Desarrollo (individual)
- **Propósito**: Crear y probar migraciones
- **Herramientas**: `prisma migrate dev`, `prisma migrate reset`
- **Quién la usa**: Cada desarrollador en su máquina
- **URL**: `DATABASE_URL` en `.env` local (NO commitear)

### DB Compartida/Staging
- **Propósito**: Integración, pruebas de equipo
- **Herramientas**: SOLO `prisma migrate deploy`
- **Quién la usa**: Todo el equipo
- **URL**: En Supabase u otro hosting

### DB de Producción (futuro)
- **Propósito**: Aplicación en vivo
- **Herramientas**: SOLO `prisma migrate deploy`
- **Quién la usa**: Deploy automático
- **URL**: Variable de entorno en servidor de producción

---

## 🔧 Configuración Inicial

### 1. Crear tu DB de Desarrollo

**Opción A: PostgreSQL Local**
```bash
# Instalar PostgreSQL localmente
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Crear base de datos
createdb kempes_dev

# En .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kempes_dev"
```

**Opción B: Supabase (DB remota individual)**
1. Ir a https://supabase.com
2. Crear nuevo proyecto: `kempes-dev-[tu-nombre]`
3. Copiar Connection String → Direct connection
4. Pegar en tu `.env` local (NO commitear)

### 2. Aplicar Migraciones Existentes

```bash
cd backend

# Primera vez: aplicar todas las migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# (Opcional) Poblar con datos de prueba
npm run seed
```

---

## 🚀 Flujo de Trabajo Diario

### Cuando Necesitas Cambiar el Schema

#### Paso 1: Actualizar `schema.prisma`
```prisma
// Ejemplo: agregar un campo
model Match {
  // ... campos existentes
  knockoutRound KnockoutRound? @map("knockout_round")
}
```

#### Paso 2: Crear la Migración (en TU DB dev)
```bash
npx prisma migrate dev --name descripcion_del_cambio
```

Esto:
- Genera SQL en `prisma/migrations/[timestamp]_descripcion_del_cambio/`
- Aplica el cambio a tu DB dev
- Regenera el cliente Prisma

#### Paso 3: Probar Localmente
```bash
# Correr tests
npm test

# Probar endpoints
npm run dev

# Verificar con script de chequeo
node scripts/db-check.js
```

#### Paso 4: Commitear la Migración
```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: add knockoutRound field to Match model"
git push
```

---

### Cuando Haces Pull de Main

#### Paso 1: Aplicar Nuevas Migraciones
```bash
git pull origin main

cd backend

# Aplicar migraciones pendientes en tu DB dev
npx prisma migrate deploy

# Regenerar cliente
npx prisma generate
```

#### Paso 2: Verificar Estado
```bash
# Ver si hay migraciones pendientes
npx prisma migrate status

# Debería decir: "Database schema is up to date!"
```

#### Paso 3: Re-seed si Hace Falta
```bash
# Si necesitas data fresca
npm run seed
```

---

## 🔥 Escenarios Especiales

### Drift Detectado
```bash
# Si ves: "Drift detected: Your database schema is not in sync..."

# EN TU DB DEV: está OK, podés resetear
npx prisma migrate reset

# EN DB COMPARTIDA: NO resetear, investigar qué cambió
node scripts/db-check.js
# Luego coordinar con el equipo
```

### Conflicto de Migraciones
Si dos devs crean migraciones al mismo tiempo:
1. El primero que pushea gana
2. El segundo debe:
   ```bash
   git pull
   npx prisma migrate resolve --rolled-back [nombre-de-tu-migracion]
   # Regenerar la migración sobre la nueva base
   npx prisma migrate dev --name tu_feature_actualizada
   ```

### Reset Completo (SOLO EN TU DB DEV)
```bash
# Borra DB, reaplica migraciones, corre seed
npx prisma migrate reset

# Alternativa: borrar DB manualmente y volver a crear
dropdb kempes_dev && createdb kempes_dev
npx prisma migrate deploy
npm run seed
```

---

## 📊 Deploy a DB Compartida/Producción

### Para Mantener DB Compartida Actualizada

Cuando mergeas a `main` con nuevas migraciones:

```bash
# En servidor o localmente apuntando a DB compartida
cd backend

# Aplicar migraciones (NO hace reset, NO usa shadow DB)
npx prisma migrate deploy

# Regenerar cliente
npx prisma generate
```

**Importante**: `migrate deploy` es:
- No interactivo
- Seguro para producción
- No requiere shadow database
- Solo aplica migraciones pendientes

---

## ✅ Checklist Pre-Push

Antes de subir cambios al repo:

- [ ] ¿Está `schema.prisma` actualizado?
- [ ] ¿Se generó la carpeta de migración en `prisma/migrations/`?
- [ ] ¿Probaste el cambio localmente en tu DB dev?
- [ ] ¿El seed funciona con el nuevo schema?
- [ ] ¿Actualizaste DTOs/mappers si hace falta?
- [ ] ¿Hay tests que ajustar?
- [ ] ¿Documentaste el cambio en código/comentarios?

---

## 🆘 Comandos de Rescate

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver diferencias entre schema y DB
npx prisma migrate diff

# Formatear schema.prisma
npx prisma format

# Validar schema sin aplicar nada
npx prisma validate

# Inspeccionar DB actual
npx prisma db pull

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Script custom de verificación
node scripts/db-check.js --take 10
```

---

## 🎯 Resumen Visual

```
┌─────────────────────┐
│  Developer A (dev)  │  ← migrate dev, migrate reset OK
└──────────┬──────────┘
           │ git push
           ▼
┌─────────────────────┐
│    Git Repo (main)  │
└──────────┬──────────┘
           │ git pull
           ▼
┌─────────────────────┐
│  Developer B (dev)  │  ← migrate deploy después de pull
└──────────┬──────────┘
           │ deploy
           ▼
┌─────────────────────┐
│  DB Compartida      │  ← SOLO migrate deploy
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  DB Producción      │  ← SOLO migrate deploy (CI/CD)
└─────────────────────┘
```

---

## 📚 Referencias

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/troubleshooting)
- [Team Development](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate)
