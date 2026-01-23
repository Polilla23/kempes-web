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
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

interface Club {
  id: string
  name: string
  shortName: string
  logo: string
  manager: string
  division: string
  category: "mayores" | "menores"
  players: number
  budget: string
  founded: string
}

const clubs: Club[] = [
  { id: "1", name: "River Plate", shortName: "RIV", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg", manager: "xPedro_92", division: "Primera", category: "mayores", players: 25, budget: "€500M", founded: "2023-01-15" },
  { id: "2", name: "Boca Juniors", shortName: "BOC", logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.png", manager: "BocaFan_23", division: "Primera", category: "mayores", players: 24, budget: "€450M", founded: "2023-01-15" },
  { id: "3", name: "Racing Club", shortName: "RAC", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Racing_Club_logo.svg", manager: "RacingFan_01", division: "Primera", category: "mayores", players: 23, budget: "€380M", founded: "2023-01-20" },
  { id: "4", name: "San Lorenzo", shortName: "SLO", logo: "https://upload.wikimedia.org/wikipedia/commons/7/73/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg", manager: "SanLorenzoKML", division: "Primera", category: "mayores", players: 22, budget: "€350M", founded: "2023-02-01" },
  { id: "5", name: "Independiente", shortName: "IND", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg", manager: "IndependienteKML", division: "Segunda", category: "mayores", players: 21, budget: "€280M", founded: "2023-02-10" },
  { id: "6", name: "Huracán", shortName: "HUR", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Hurac%C3%A1n_escudo.svg/800px-Hurac%C3%A1n_escudo.svg.png", manager: "HuracanKML", division: "Segunda", category: "mayores", players: 20, budget: "€220M", founded: "2023-02-15" },
  { id: "7", name: "Vélez Sarsfield", shortName: "VEL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg", manager: "VelezPro", division: "Tercera", category: "mayores", players: 22, budget: "€200M", founded: "2023-03-01" },
  { id: "8", name: "Estudiantes LP", shortName: "EST", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Estudiantes_de_La_Plata_logo.svg", manager: "EstudiantesKML", division: "Primera", category: "menores", players: 20, budget: "€150M", founded: "2023-04-01" },
]

const divisions = ["Todas", "Primera", "Segunda", "Tercera", "Cuarta"]
const categories = ["Todas", "mayores", "menores"]

export function AdminClubsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("Todas")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  
  const itemsPerPage = 6

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.manager.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDivision = divisionFilter === "Todas" || c.division === divisionFilter
    const matchesCategory = categoryFilter === "Todas" || c.category === categoryFilter
    return matchesSearch && matchesDivision && matchesCategory
  })

  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage)
  const paginatedClubs = filteredClubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (club: Club) => {
    setSelectedClub(club)
    setIsEditOpen(true)
  }

  const handleDelete = (club: Club) => {
    setSelectedClub(club)
    setIsDeleteOpen(true)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Clubes</h1>
              <p className="text-sm text-muted-foreground">Administra los clubes de la liga</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Club
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Club</DialogTitle>
                <DialogDescription>
                  Completa los datos para crear un nuevo club.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" placeholder="Ej: Arsenal FC" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shortName">Abreviatura</Label>
                    <Input id="shortName" placeholder="ARS" maxLength={3} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo">URL del Logo</Label>
                  <Input id="logo" placeholder="https://..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manager">Manager asignado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      <SelectItem value="new">Nuevo usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>División</Label>
                    <Select defaultValue="Primera">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.filter(d => d !== "Todas").map((div) => (
                          <SelectItem key={div} value={div}>{div}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Select defaultValue="mayores">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mayores">Mayores</SelectItem>
                        <SelectItem value="menores">Menores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Presupuesto inicial</Label>
                  <Input id="budget" placeholder="€100M" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="bg-transparent">
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>Crear Club</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Total</p>
                <p className="text-lg font-bold text-foreground">{clubs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Primera Div.</p>
                <p className="text-lg font-bold text-amber-500">{clubs.filter(c => c.division === "Primera").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Mayores</p>
                <p className="text-lg font-bold text-green-500">{clubs.filter(c => c.category === "mayores").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Menores</p>
                <p className="text-lg font-bold text-blue-500">{clubs.filter(c => c.category === "menores").length}</p>
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
                  placeholder="Buscar club o manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="División" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="mayores">Mayores</SelectItem>
                  <SelectItem value="menores">Menores</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setDivisionFilter("Todas")
                  setCategoryFilter("Todas")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clubs Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Clubes</CardTitle>
              <Badge variant="outline">{filteredClubs.length} clubes</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Club</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Manager</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3">División</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3">Categoría</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 hidden md:table-cell">Jugadores</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Presupuesto</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClubs.map((club) => (
                    <tr key={club.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={club.logo || "/placeholder.svg"} alt={club.name} className="w-8 h-8 object-contain" />
                          <div>
                            <span className="font-semibold text-foreground">{club.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({club.shortName})</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{club.manager}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          club.division === "Primera" ? "bg-amber-500/15 text-amber-500" :
                          club.division === "Segunda" ? "bg-slate-400/15 text-slate-400" : "bg-muted text-muted-foreground"
                        )}>
                          {club.division}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          club.category === "mayores" ? "bg-primary/15 text-primary" : "bg-green-500/15 text-green-500"
                        )}>
                          {club.category === "mayores" ? "Mayores" : "Menores"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center text-sm text-muted-foreground hidden md:table-cell">{club.players}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-primary">{club.budget}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(club)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(club)}>
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
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredClubs.length)} de {filteredClubs.length}
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
              <DialogTitle>Editar Club</DialogTitle>
              <DialogDescription>
                Modifica los datos de {selectedClub?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input defaultValue={selectedClub?.name} />
                </div>
                <div className="grid gap-2">
                  <Label>Abreviatura</Label>
                  <Input defaultValue={selectedClub?.shortName} maxLength={3} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>URL del Logo</Label>
                <Input defaultValue={selectedClub?.logo} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>División</Label>
                  <Select defaultValue={selectedClub?.division}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.filter(d => d !== "Todas").map((div) => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Categoría</Label>
                  <Select defaultValue={selectedClub?.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mayores">Mayores</SelectItem>
                      <SelectItem value="menores">Menores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Presupuesto</Label>
                <Input defaultValue={selectedClub?.budget} />
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
              <DialogTitle>Eliminar Club</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a <strong>{selectedClub?.name}</strong>? Esta acción eliminará también todos los jugadores asociados y no se puede deshacer.
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
