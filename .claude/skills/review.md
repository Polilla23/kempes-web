# Skill: Code Reviewer

Revisa código antes de commits/PRs enfocándose en consistencia, seguridad, performance y tipos.

## Uso

```
/review [archivo o carpeta]
```

Ejemplos:
- `/review backend/src/features/clubs/` - Revisar toda la feature clubs
- `/review backend/src/features/players/players.service.ts` - Revisar archivo específico
- `/review` - Revisar cambios pendientes (git diff)

## Instrucciones

Cuando el usuario ejecute este skill, realizar una revisión exhaustiva en 4 áreas:

### 1. Consistencia con patrones del proyecto

Verificar que el código sigue las convenciones de Kempes:

#### Backend
- [ ] **Estructura de archivos**: controller, service, repository, routes, schema, errors, interfaces
- [ ] **Naming**: PascalCase para clases, camelCase para métodos, prefijo `I` para interfaces
- [ ] **Imports**: Usar alias `@/` en lugar de rutas relativas
- [ ] **Validación**: Usar `Validator` utility de `@/features/utils/validation`
- [ ] **Respuestas**: Usar helpers de `Response` (success, created, notFound, error, validation)
- [ ] **Errores**: Clases de error personalizadas que extienden Error
- [ ] **DI**: Inyección de dependencias via constructor con objetos destructurados
- [ ] **Mappers**: Transformación de entidades a DTOs

#### Frontend
- [ ] **File-based routing**: Archivos en `routes/` siguiendo convención TanStack Router
- [ ] **Services**: Un service por entidad en `/services`
- [ ] **i18n**: Textos usando `t()` de i18next, no hardcodeados
- [ ] **Componentes UI**: Usar Shadcn UI components de `/components/ui`
- [ ] **Forms**: React Hook Form con Zod validation

### 2. Seguridad

Buscar vulnerabilidades comunes:

#### Validación de inputs
- [ ] ¿Se validan todos los inputs del usuario?
- [ ] ¿Se usa `Validator.uuid()` para IDs?
- [ ] ¿Se usa `Validator.string()` con límites de longitud?
- [ ] ¿Se usa `Validator.email()` para emails?
- [ ] ¿Se sanitizan strings que podrían contener HTML/scripts?

#### Autenticación/Autorización
- [ ] ¿Las rutas protegidas tienen `preHandler: [fastify.authenticate]`?
- [ ] ¿Se verifica el rol del usuario donde corresponde?
- [ ] ¿No se exponen datos sensibles en respuestas?

#### Prisma/Base de datos
- [ ] ¿No hay SQL injection (Prisma lo previene pero verificar raw queries)?
- [ ] ¿Se usan transacciones donde es necesario?
- [ ] ¿No se exponen campos sensibles (passwords, tokens)?

#### Exposición de datos
- [ ] ¿Los mappers filtran campos sensibles?
- [ ] ¿No se loguean datos sensibles?

### 3. Performance

Detectar problemas de rendimiento:

#### Queries N+1
```typescript
// ❌ MAL: N+1 query
const clubs = await prisma.club.findMany()
for (const club of clubs) {
  const players = await prisma.player.findMany({ where: { clubId: club.id } })
}

// ✅ BIEN: Include en una sola query
const clubs = await prisma.club.findMany({
  include: { players: true }
})
```

#### Includes innecesarios
- [ ] ¿Solo se incluyen relaciones que realmente se usan?
- [ ] ¿Se usa `select` para limitar campos cuando es posible?

#### Operaciones costosas
- [ ] ¿Hay loops que podrían ser operaciones batch?
- [ ] ¿Se cachean resultados que no cambian frecuentemente?
- [ ] ¿Las búsquedas usan índices existentes?

#### Frontend
- [ ] ¿Se evitan re-renders innecesarios?
- [ ] ¿Se usa memo/useMemo donde corresponde?
- [ ] ¿Las llamadas API se hacen eficientemente?

### 4. Tipos TypeScript

Verificar tipado correcto:

- [ ] **No `any`**: Evitar tipo `any`, usar tipos específicos o `unknown`
- [ ] **Interfaces definidas**: Interfaces para inputs/outputs de funciones
- [ ] **Tipos Prisma**: Usar tipos generados por Prisma (`Prisma.[Model]CreateInput`)
- [ ] **Nullable handling**: Manejar correctamente valores null/undefined
- [ ] **Return types**: Funciones con tipos de retorno explícitos
- [ ] **Generic types**: Usar genéricos donde añadan valor

### Formato del reporte

Generar reporte estructurado:

```markdown
## Revisión de Código: [archivo/carpeta]

### Resumen
- ✅ X items OK
- ⚠️ X warnings
- ❌ X errores

### Consistencia
[Hallazgos de consistencia]

### Seguridad
[Hallazgos de seguridad]

### Performance
[Hallazgos de performance]

### Tipos
[Hallazgos de tipado]

### Recomendaciones
1. [Recomendación con ejemplo de código]
2. ...
```

## Archivos de referencia (código bien estructurado)

Comparar contra estos ejemplos de buenas prácticas:
- `backend/src/features/clubs/clubs.controller.ts` - Controller bien estructurado
- `backend/src/features/clubs/clubs.service.ts` - Service con lógica clara
- `backend/src/features/clubs/clubs.repository.ts` - Repository con includes
- `backend/src/features/utils/validation.ts` - Patrón de validación
- `backend/src/features/core/middleware/errorHandler.ts` - Manejo de errores

## Severidad de issues

- 🔴 **Critical**: Vulnerabilidad de seguridad, pérdida de datos posible
- 🟠 **High**: Bug potencial, problema de performance significativo
- 🟡 **Medium**: Inconsistencia con patrones, tipado débil
- 🟢 **Low**: Sugerencia de mejora, estilo
