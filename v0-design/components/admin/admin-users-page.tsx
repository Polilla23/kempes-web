"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "manager" | "user"
  club: string | null
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLogin: string
}

const users: User[] = [
  { id: "1", username: "Admin_KML", email: "admin@kml.com", role: "admin", club: null, status: "active", createdAt: "2023-01-15", lastLogin: "2026-01-20" },
  { id: "2", username: "xPedro_92", email: "pedro@mail.com", role: "manager", club: "River Plate", status: "active", createdAt: "2023-02-20", lastLogin: "2026-01-19" },
  { id: "3", username: "BocaFan_23", email: "boca23@mail.com", role: "manager", club: "Boca Juniors", status: "active", createdAt: "2023-03-10", lastLogin: "2026-01-18" },
  { id: "4", username: "RacingFan_01", email: "racing01@mail.com", role: "manager", club: "Racing Club", status: "active", createdAt: "2023-04-05", lastLogin: "2026-01-17" },
  { id: "5", username: "SanLorenzoKML", email: "sanlorenzo@mail.com", role: "manager", club: "San Lorenzo", status: "active", createdAt: "2023-05-12", lastLogin: "2026-01-16" },
  { id: "6", username: "IndependienteKML", email: "indep@mail.com", role: "manager", club: "Independiente", status: "inactive", createdAt: "2023-06-18", lastLogin: "2025-12-01" },
  { id: "7", username: "HuracanKML", email: "huracan@mail.com", role: "manager", club: "Huracán", status: "suspended", createdAt: "2023-07-22", lastLogin: "2025-11-15" },
  { id: "8", username: "Viewer_01", email: "viewer@mail.com", role: "user", club: null, status: "active", createdAt: "2024-01-01", lastLogin: "2026-01-15" },
]

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-500",
  manager: "bg-primary/15 text-primary",
  user: "bg-muted text-muted-foreground",
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/15 text-green-500",
  inactive: "bg-amber-500/15 text-amber-500",
  suspended: "bg-red-500/15 text-red-500",
}

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const itemsPerPage = 6

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.club && u.club.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <UserCog className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-sm text-muted-foreground">Administra los usuarios de la liga</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa los datos para crear un nuevo usuario.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input id="username" placeholder="Ej: NuevoUser_01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@ejemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select defaultValue="user">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="club">Club (opcional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin club asignado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin club</SelectItem>
                      <SelectItem value="river">River Plate</SelectItem>
                      <SelectItem value="boca">Boca Juniors</SelectItem>
                      <SelectItem value="racing">Racing Club</SelectItem>
                      <SelectItem value="sanlorenzo">San Lorenzo</SelectItem>
                      <SelectItem value="independiente">Independiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="bg-transparent">
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Total</p>
                <p className="text-lg font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Activos</p>
                <p className="text-lg font-bold text-green-500">{users.filter(u => u.status === "active").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Managers</p>
                <p className="text-lg font-bold text-amber-500">{users.filter(u => u.role === "manager").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Admins</p>
                <p className="text-lg font-bold text-red-500">{users.filter(u => u.role === "admin").length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuario, email o club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setRoleFilter("all")
                  setStatusFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Usuarios</CardTitle>
              <Badge variant="outline">{filteredUsers.length} usuarios</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Usuario</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Email</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Rol</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Club</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Estado</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4 hidden md:table-cell">Último acceso</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">{user.username}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={cn("text-xs", roleColors[user.role])}>
                          {user.role === "admin" ? "Admin" : user.role === "manager" ? "Manager" : "Usuario"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.club || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge className={cn("text-xs", statusColors[user.status])}>
                          {user.status === "active" ? "Activo" : user.status === "inactive" ? "Inactivo" : "Suspendido"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{user.lastLogin}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(user)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 text-sm text-foreground">{currentPage} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica los datos de {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Nombre de usuario</Label>
                <Input id="edit-username" defaultValue={selectedUser?.username} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" defaultValue={selectedUser?.email} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select defaultValue={selectedUser?.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select defaultValue={selectedUser?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="bg-transparent">Cancelar</Button>
              <Button onClick={() => setIsEditOpen(false)}>Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Eliminar Usuario</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a <strong>{selectedUser?.username}</strong>? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="bg-transparent">Cancelar</Button>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(false)}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
