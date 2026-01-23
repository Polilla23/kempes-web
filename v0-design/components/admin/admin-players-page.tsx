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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Upload,
  FileSpreadsheet
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

interface Player {
  id: string
  name: string
  position: string
  rating: number
  club: string
  nationality: string
  age: number
  marketValue: string
}

const players: Player[] = [
  { id: "1", name: "Erling Haaland", position: "DC", rating: 94, club: "River Plate", nationality: "Noruega", age: 25, marketValue: "180M" },
  { id: "2", name: "Kylian Mbappé", position: "EI", rating: 96, club: "San Lorenzo", nationality: "Francia", age: 27, marketValue: "200M" },
  { id: "3", name: "Lamine Yamal", position: "ED", rating: 87, club: "Boca Juniors", nationality: "España", age: 18, marketValue: "120M" },
  { id: "4", name: "Jude Bellingham", position: "MCO", rating: 91, club: "Real Madrid", nationality: "Inglaterra", age: 22, marketValue: "150M" },
  { id: "5", name: "Vinicius Jr", position: "EI", rating: 93, club: "Independiente", nationality: "Brasil", age: 25, marketValue: "180M" },
  { id: "6", name: "Rodri", position: "MCD", rating: 92, club: "Estudiantes", nationality: "España", age: 29, marketValue: "95M" },
  { id: "7", name: "Florian Wirtz", position: "MCO", rating: 88, club: "Vélez Sarsfield", nationality: "Alemania", age: 22, marketValue: "110M" },
  { id: "8", name: "Gavi", position: "MC", rating: 85, club: "Lanús", nationality: "España", age: 21, marketValue: "80M" },
]

const positions = ["Todas", "POR", "DFC", "LI", "LD", "MCD", "MC", "MCO", "MI", "MD", "EI", "ED", "DC", "SD"]

export function AdminPlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("Todas")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [createTab, setCreateTab] = useState("individual")
  
  const itemsPerPage = 6

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "Todas" || p.position === positionFilter
    return matchesSearch && matchesPosition
  })

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage)
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player)
    setIsEditOpen(true)
  }

  const handleDelete = (player: Player) => {
    setSelectedPlayer(player)
    setIsDeleteOpen(true)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Jugadores</h1>
              <p className="text-sm text-muted-foreground">Administra los jugadores de la liga</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Jugador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Jugador</DialogTitle>
                <DialogDescription>
                  Crea jugadores de forma individual o masiva.
                </DialogDescription>
              </DialogHeader>
              <Tabs value={createTab} onValueChange={setCreateTab} className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="individual" className="flex-1">Individual</TabsTrigger>
                  <TabsTrigger value="bulk" className="flex-1">Carga Masiva</TabsTrigger>
                </TabsList>
                <TabsContent value="individual" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" placeholder="Ej: Lionel Messi" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position">Posición</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.filter(p => p !== "Todas").map((pos) => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input id="rating" type="number" min="1" max="99" placeholder="85" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Edad</Label>
                      <Input id="age" type="number" min="15" max="45" placeholder="25" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nationality">Nacionalidad</Label>
                      <Input id="nationality" placeholder="Argentina" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="value">Valor de mercado</Label>
                      <Input id="value" placeholder="100M" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="club">Club</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="river">River Plate</SelectItem>
                        <SelectItem value="boca">Boca Juniors</SelectItem>
                        <SelectItem value="racing">Racing Club</SelectItem>
                        <SelectItem value="sanlorenzo">San Lorenzo</SelectItem>
                        <SelectItem value="independiente">Independiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="bulk" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Arrastra un archivo Excel (.xlsx) o haz clic para seleccionar
                    </p>
                    <Input type="file" accept=".xlsx,.xls" className="hidden" id="excel-upload" />
                    <Button variant="outline" className="gap-2 bg-transparent" onClick={() => document.getElementById("excel-upload")?.click()}>
                      <Upload className="w-4 h-4" />
                      Seleccionar archivo
                    </Button>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Formato requerido:</p>
                    <p>El archivo Excel debe contener las columnas: <strong>Nombre, Posición, Rating, Edad, Nacionalidad, Valor, Club</strong></p>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="bg-transparent">
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreateOpen(false)}>
                  {createTab === "individual" ? "Crear Jugador" : "Importar Jugadores"}
                </Button>
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
                <p className="text-lg font-bold text-foreground">{players.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Rating Prom.</p>
                <p className="text-lg font-bold text-amber-500">{Math.round(players.reduce((a, p) => a + p.rating, 0) / players.length)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Delanteros</p>
                <p className="text-lg font-bold text-green-500">{players.filter(p => ["DC", "SD", "EI", "ED"].includes(p.position)).length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Mediocampistas</p>
                <p className="text-lg font-bold text-blue-500">{players.filter(p => ["MC", "MCO", "MCD", "MI", "MD"].includes(p.position)).length}</p>
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
                  placeholder="Buscar jugador, club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="Posición" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setPositionFilter("Todas")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Players Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Jugadores</CardTitle>
              <Badge variant="outline">{filteredPlayers.length} jugadores</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Jugador</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3">Pos</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3">Rating</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Club</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4 hidden md:table-cell">Nacionalidad</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3 hidden md:table-cell">Edad</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Valor</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlayers.map((player) => (
                    <tr key={player.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">{player.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className="text-xs">{player.position}</Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "font-bold",
                          player.rating >= 90 ? "text-amber-500" :
                          player.rating >= 85 ? "text-green-500" :
                          player.rating >= 80 ? "text-primary" : "text-muted-foreground"
                        )}>
                          {player.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{player.club}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{player.nationality}</td>
                      <td className="py-3 px-3 text-center text-sm text-muted-foreground hidden md:table-cell">{player.age}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-primary">€{player.marketValue}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(player)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(player)}>
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
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPlayers.length)} de {filteredPlayers.length}
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
              <DialogTitle>Editar Jugador</DialogTitle>
              <DialogDescription>
                Modifica los datos de {selectedPlayer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input defaultValue={selectedPlayer?.name} />
                </div>
                <div className="grid gap-2">
                  <Label>Posición</Label>
                  <Select defaultValue={selectedPlayer?.position}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.filter(p => p !== "Todas").map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Rating</Label>
                  <Input type="number" defaultValue={selectedPlayer?.rating} />
                </div>
                <div className="grid gap-2">
                  <Label>Edad</Label>
                  <Input type="number" defaultValue={selectedPlayer?.age} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Valor de mercado</Label>
                <Input defaultValue={selectedPlayer?.marketValue} />
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
              <DialogTitle>Eliminar Jugador</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a <strong>{selectedPlayer?.name}</strong>? Esta acción no se puede deshacer.
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
