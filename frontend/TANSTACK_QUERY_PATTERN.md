# TanStack Query Pattern - Guía de Replicación

## 🎯 Qué acabamos de construir

Acabamos de implementar TanStack Query para la feature **clubs** como ejemplo. Ahora podés replicar este patrón para el resto de features: `players`, `users`, `competitions`, `competition-types`, `events`, `fixtures`.

---

## 📁 Estructura que creamos

```
frontend/src/
├── lib/
│   └── react-query.ts          # ✅ Config global + queryKeys centralizadas
├── events/
│   └── event-bus.ts            # ✅ Event bus para UI (opcional)
├── features/
│   └── clubs/                  # 👈 EJEMPLO COMPLETO
│       ├── hooks/
│       │   ├── use-clubs.ts             # Query hooks (GET)
│       │   ├── use-create-club.ts       # Create mutation (POST)
│       │   ├── use-update-club.ts       # Update mutation (PUT)
│       │   ├── use-delete-club.ts       # Delete mutation (DELETE)
│       │   └── index.ts                 # Barrel export
│       ├── components/          # (Próximo paso - mover forms aquí)
│       └── schemas/             # (Opcional - validaciones Zod)
└── routes/management/clubs/
    └── index.refactored.tsx    # 👈 Ejemplo de uso
```

---

## 🔄 Paso a Paso: Replicar para otra feature (Ej: Players)

### **1. Crear estructura de carpetas**

```bash
frontend/src/features/players/
├── hooks/
├── components/  # (opcional por ahora)
└── schemas/     # (opcional por ahora)
```

### **2. Agregar queryKeys en `lib/react-query.ts`**

Ya están definidas todas las keys:

```typescript
export const queryKeys = {
  clubs: ['clubs'] as const,
  club: (id: string) => ['clubs', id] as const,

  players: ['players'] as const, // 👈 Ya existe
  player: (id: string) => ['players', id] as const,

  users: ['users'] as const, // 👈 Ya existe
  user: (id: string) => ['users', id] as const,

  // ... resto de features
}
```

### **3. Crear query hooks (GET) - `use-players.ts`**

**Copiar `features/clubs/hooks/use-clubs.ts`** y ajustar:

```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { PlayerService } from '@/services/player.service' // 👈 Cambiar service
import type { Player } from '@/types' // 👈 Cambiar tipo

/**
 * Hook to fetch all players
 */
export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players, // 👈 Cambiar key
    queryFn: PlayerService.getPlayers, // 👈 Cambiar método
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.player(id!), // 👈 Cambiar key
    queryFn: () => PlayerService.getPlayer(id!), // 👈 Cambiar método
    enabled: !!id,
  })
}
```

**Qué cambiar:**

- ✏️ `ClubService` → `PlayerService`
- ✏️ `queryKeys.clubs` → `queryKeys.players`
- ✏️ `Club` → `Player` (type import)
- ✏️ Nombres de funciones: `useClubs` → `usePlayers`

---

### **4. Crear mutation hooks (POST/PUT/DELETE)**

#### **A) Create - `use-create-player.ts`**

**Copiar `features/clubs/hooks/use-create-club.ts`** y ajustar:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { PlayerService } from '@/services/player.service' // 👈 Cambiar
import type { Player } from '@/types' // 👈 Cambiar
import { toast } from 'sonner'

type CreatePlayerInput = {
  name: string
  // ... resto de campos según el schema de Player
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newPlayer: CreatePlayerInput) => PlayerService.createPlayer(newPlayer), // 👈 Cambiar método

    onMutate: async (newPlayer) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.players })

      const previousPlayers = queryClient.getQueryData<Player[]>(queryKeys.players)

      queryClient.setQueryData<Player[]>(queryKeys.players, (old = []) => [
        ...old,
        { ...newPlayer, id: 'temp-id' } as Player,
      ])

      return { previousPlayers }
    },

    onError: (error, _newPlayer, context) => {
      if (context?.previousPlayers) {
        queryClient.setQueryData(queryKeys.players, context.previousPlayers)
      }
      toast.error(`Failed to create player: ${error.message}`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players })
      queryClient.invalidateQueries({ queryKey: queryKeys.users }) // Si players están linkados a users
    },

    onSuccess: () => {
      toast.success('Player created successfully')
    },
  })
}
```

**Cambios clave:**

- ✏️ `Club` → `Player` en todos lados
- ✏️ `ClubService` → `PlayerService`
- ✏️ `queryKeys.clubs` → `queryKeys.players`
- ✏️ `CreateClubInput` → `CreatePlayerInput` (ajustar campos)

---

#### **B) Update - `use-update-player.ts`**

Copiar `use-update-club.ts`, mismos cambios que arriba.

---

#### **C) Delete - `use-delete-player.ts`**

Copiar `use-delete-club.ts`, mismos cambios que arriba.

---

### **5. Crear barrel export - `index.ts`**

```typescript
export { usePlayers, usePlayer } from './use-players'
export { useCreatePlayer } from './use-create-player'
export { useUpdatePlayer } from './use-update-player'
export { useDeletePlayer } from './use-delete-player'
```

---

### **6. Usar en componentes**

**Antes (manual fetching):**

```typescript
const [players, setPlayers] = useState<Player[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const fetchPlayers = async () => {
    try {
      setIsLoading(true)
      const response = await PlayerService.getPlayers()
      setPlayers(response || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  fetchPlayers()
}, [])

const handleDelete = async (id: string) => {
  await PlayerService.deletePlayer(id)
  fetchPlayers() // Manual refetch
}
```

**Después (TanStack Query):**

```typescript
import { usePlayers, useDeletePlayer } from '@/features/players/hooks'

const { data: players = [], isLoading } = usePlayers()
const deletePlayerMutation = useDeletePlayer()

const handleDelete = (id: string) => {
  deletePlayerMutation.mutate(id) // Auto-refetch!
}
```

**Beneficios:**

- ✅ No más `useState` para data/loading/error
- ✅ No más `useEffect` para fetching
- ✅ Auto-refetch después de mutations
- ✅ Optimistic updates (UI instantánea)
- ✅ Caching automático (reduce requests)

---

## 🎨 Invalidación Cruzada (Cross-feature)

Si tus features están relacionadas (ej: eliminar un player debe actualizar users), agregar en `onSettled`:

```typescript
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.players })
  queryClient.invalidateQueries({ queryKey: queryKeys.users }) // 👈 Invalida otra feature
}
```

Ejemplo real en clubs:

```typescript
// Cuando creas/editas/eliminas un club, invalidamos users porque
// los users tienen una relación club_id
queryClient.invalidateQueries({ queryKey: queryKeys.clubs })
queryClient.invalidateQueries({ queryKey: queryKeys.users })
```

---

## 📊 DevTools

Ya está configurado en `main.tsx`:

```typescript
<ReactQueryDevtools initialIsOpen={false} />
```

**Shortcuts:**

- Abrir DevTools: Click en el ícono flotante (esquina inferior)
- Ver queries activas, estado de caché, timings, refetches, etc.

---

## 🔧 Configuración Global (ya está en `lib/react-query.ts`)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto → considera data "fresh"
      gcTime: 5 * 60 * 1000, // 5 minutos → garbage collection
      retry: 1, // 1 reintento en caso de fallo
      refetchOnWindowFocus: true, // Refetch al volver al tab
    },
  },
})
```

**Podés sobrescribir en cada hook:**

```typescript
useQuery({
  queryKey: queryKeys.players,
  queryFn: PlayerService.getPlayers,
  staleTime: 5 * 60 * 1000, // 👈 Sobrescribir (5 min para players)
})
```

---

## 🚀 Checklist de Replicación

Para cada feature (players, users, competitions, etc.):

- [ ] Crear `features/<feature>/hooks/` folder
- [ ] Copiar `use-clubs.ts` → `use-<feature>s.ts` y ajustar:
  - [ ] Cambiar imports (Service, Type)
  - [ ] Cambiar queryKeys
  - [ ] Ajustar nombres de funciones
- [ ] Copiar mutation hooks (create, update, delete) y ajustar:
  - [ ] Cambiar Service methods
  - [ ] Cambiar tipos (Input/Output)
  - [ ] Agregar invalidaciones cruzadas si aplican
- [ ] Crear `index.ts` barrel export
- [ ] Refactorizar componente de management:
  - [ ] Reemplazar `useState` + `useEffect` con hooks
  - [ ] Eliminar `fetchData()` manual
  - [ ] Usar mutations para create/update/delete
- [ ] Probar en navegador + DevTools

---

## 📝 Ejemplo Completo: Users

Si querés ver otro ejemplo, podés hacer **users** siguiente:

1. Crear `features/users/hooks/use-users.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import UserService from '@/services/user.service'

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: UserService.getUsers,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user(id!),
    queryFn: () => UserService.getUser(id!),
    enabled: !!id,
  })
}
```

2. Crear mutation hooks (create, update, delete) igual que clubs

3. Usar en `routes/management/users/index.tsx`:

```typescript
const { data: users = [], isLoading } = useUsers()
const deleteUserMutation = useDeleteUser()
```

---

## ❓ FAQ

**Q: ¿Por qué separar en `features/` si ya tengo `routes/`?**  
A: TanStack Router usa `routes/` para URLs (file-based routing). `features/` es para lógica de negocio (hooks, schemas, utils). Así no mezclás routing con business logic.

**Q: ¿Puedo usar Zustand también?**  
A: Sí, pero para **UI state** solamente (ej: modal abierto, sidebar colapsado). Para server state (clubs, players) usá TanStack Query.

**Q: ¿Qué pasa si necesito server-side rendering (SSR)?**  
A: TanStack Query tiene soporte para SSR con `prefetchQuery`. Ver docs oficiales.

**Q: ¿Cómo desactivo auto-refetch?**  
A: En el hook individual:

```typescript
useQuery({
  queryKey: queryKeys.players,
  queryFn: PlayerService.getPlayers,
  refetchOnWindowFocus: false, // 👈 Deshabilitar
  refetchOnMount: false,
})
```

---

## 📚 Recursos

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [DevTools Guide](https://tanstack.com/query/latest/docs/framework/react/devtools)

---

**Siguiente paso recomendado:**  
Replicar el patrón para **players** o **users** (son los más usados). Una vez dominés el patrón, el resto es copiar-pegar con ajustes mínimos.

¡Suerte! 🚀
