"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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
import { Users, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X } from "lucide-react"

// Mock players data
const allPlayers = [
  { id: "1", name: "Erling Haaland", nationality: "Noruega", nationalityFlag: "🇳🇴", position: "DC", age: 24, rating: 91, salary: 450000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "River Plate", playingSlug: "river-plate", status: "Titular" },
  { id: "2", name: "Kevin De Bruyne", nationality: "Bélgica", nationalityFlag: "🇧🇪", position: "MC", age: 33, rating: 91, salary: 380000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "River Plate", playingSlug: "river-plate", status: "Titular" },
  { id: "3", name: "Rodri", nationality: "España", nationalityFlag: "🇪🇸", position: "MCD", age: 28, rating: 91, salary: 340000, ownerClub: "Boca Juniors", ownerSlug: "boca-juniors", playingClub: "Boca Juniors", playingSlug: "boca-juniors", status: "Titular" },
  { id: "4", name: "Vinicius Jr", nationality: "Brasil", nationalityFlag: "🇧🇷", position: "EI", age: 24, rating: 90, salary: 420000, ownerClub: "Racing Club", ownerSlug: "racing-club", playingClub: "Racing Club", playingSlug: "racing-club", status: "Titular" },
  { id: "5", name: "Jude Bellingham", nationality: "Inglaterra", nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "MC", age: 21, rating: 90, salary: 400000, ownerClub: "Racing Club", ownerSlug: "racing-club", playingClub: "Racing Club", playingSlug: "racing-club", status: "Titular" },
  { id: "6", name: "Kylian Mbappé", nationality: "Francia", nationalityFlag: "🇫🇷", position: "DC", age: 26, rating: 91, salary: 500000, ownerClub: "Independiente", ownerSlug: "independiente", playingClub: "San Lorenzo", playingSlug: "san-lorenzo", status: "Cedido" },
  { id: "7", name: "Bukayo Saka", nationality: "Inglaterra", nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "ED", age: 23, rating: 88, salary: 280000, ownerClub: "San Lorenzo", ownerSlug: "san-lorenzo", playingClub: "San Lorenzo", playingSlug: "san-lorenzo", status: "Titular" },
  { id: "8", name: "Phil Foden", nationality: "Inglaterra", nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "EI", age: 24, rating: 88, salary: 290000, ownerClub: "Vélez", ownerSlug: "velez", playingClub: "Vélez", playingSlug: "velez", status: "Titular" },
  { id: "9", name: "Federico Valverde", nationality: "Uruguay", nationalityFlag: "🇺🇾", position: "MC", age: 26, rating: 89, salary: 320000, ownerClub: "Estudiantes", ownerSlug: "estudiantes", playingClub: "Estudiantes", playingSlug: "estudiantes", status: "Titular" },
  { id: "10", name: "Lautaro Martínez", nationality: "Argentina", nationalityFlag: "🇦🇷", position: "DC", age: 27, rating: 88, salary: 350000, ownerClub: "Huracán", ownerSlug: "huracan", playingClub: "Huracán", playingSlug: "huracan", status: "Titular" },
  { id: "11", name: "Enzo Fernández", nationality: "Argentina", nationalityFlag: "🇦🇷", position: "MC", age: 24, rating: 86, salary: 260000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "River Plate", playingSlug: "river-plate", status: "Titular" },
  { id: "12", name: "Julián Álvarez", nationality: "Argentina", nationalityFlag: "🇦🇷", position: "DC", age: 25, rating: 85, salary: 220000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "Boca Juniors", playingSlug: "boca-juniors", status: "Cedido" },
  { id: "13", name: "Ederson", nationality: "Brasil", nationalityFlag: "🇧🇷", position: "POR", age: 31, rating: 88, salary: 200000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "River Plate", playingSlug: "river-plate", status: "Titular" },
  { id: "14", name: "Alisson", nationality: "Brasil", nationalityFlag: "🇧🇷", position: "POR", age: 32, rating: 89, salary: 220000, ownerClub: "Boca Juniors", ownerSlug: "boca-juniors", playingClub: "Boca Juniors", playingSlug: "boca-juniors", status: "Titular" },
  { id: "15", name: "Thibaut Courtois", nationality: "Bélgica", nationalityFlag: "🇧🇪", position: "POR", age: 32, rating: 90, salary: 250000, ownerClub: "Racing Club", ownerSlug: "racing-club", playingClub: "Racing Club", playingSlug: "racing-club", status: "Titular" },
  { id: "16", name: "Rúben Dias", nationality: "Portugal", nationalityFlag: "🇵🇹", position: "DFC", age: 27, rating: 87, salary: 240000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "River Plate", playingSlug: "river-plate", status: "Titular" },
  { id: "17", name: "Virgil van Dijk", nationality: "Países Bajos", nationalityFlag: "🇳🇱", position: "DFC", age: 33, rating: 89, salary: 280000, ownerClub: "Boca Juniors", ownerSlug: "boca-juniors", playingClub: "Boca Juniors", playingSlug: "boca-juniors", status: "Titular" },
  { id: "18", name: "William Saliba", nationality: "Francia", nationalityFlag: "🇫🇷", position: "DFC", age: 23, rating: 86, salary: 180000, ownerClub: "San Lorenzo", ownerSlug: "san-lorenzo", playingClub: "San Lorenzo", playingSlug: "san-lorenzo", status: "Titular" },
  { id: "19", name: "Josko Gvardiol", nationality: "Croacia", nationalityFlag: "🇭🇷", position: "DFC", age: 22, rating: 84, salary: 160000, ownerClub: "River Plate", ownerSlug: "river-plate", playingClub: "Vélez", playingSlug: "velez", status: "Cedido" },
  { id: "20", name: "Trent Alexander-Arnold", nationality: "Inglaterra", nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "LD", age: 26, rating: 87, salary: 240000, ownerClub: "Independiente", ownerSlug: "independiente", playingClub: "Independiente", playingSlug: "independiente", status: "Titular" },
  { id: "21", name: "Alphonso Davies", nationality: "Canadá", nationalityFlag: "🇨🇦", position: "LI", age: 24, rating: 84, salary: 180000, ownerClub: "Estudiantes", ownerSlug: "estudiantes", playingClub: "Estudiantes", playingSlug: "estudiantes", status: "Titular" },
  { id: "22", name: "Declan Rice", nationality: "Inglaterra", nationalityFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "MCD", age: 26, rating: 87, salary: 260000, ownerClub: "Vélez", ownerSlug: "velez", playingClub: "Vélez", playingSlug: "velez", status: "Titular" },
  { id: "23", name: "Pedri", nationality: "España", nationalityFlag: "🇪🇸", position: "MC", age: 22, rating: 87, salary: 240000, ownerClub: "Huracán", ownerSlug: "huracan", playingClub: "Huracán", playingSlug: "huracan", status: "Titular" },
  { id: "24", name: "Florian Wirtz", nationality: "Alemania", nationalityFlag: "🇩🇪", position: "MCO", age: 21, rating: 87, salary: 200000, ownerClub: "Racing Club", ownerSlug: "racing-club", playingClub: "Racing Club", playingSlug: "racing-club", status: "Titular" },
]

const nationalities = [...new Set(allPlayers.map(p => p.nationality))].sort()
const positions = ["POR", "DFC", "LD", "LI", "MCD", "MC", "MCO", "EI", "ED", "DC"]
const clubs = [...new Set(allPlayers.map(p => p.ownerClub))].sort()
const playingClubs = [...new Set(allPlayers.map(p => p.playingClub))].sort()
const statuses = ["Titular", "Cedido", "Suplente"]

export function PlayersPageContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNationality, setSelectedNationality] = useState<string>("all")
  const [selectedPosition, setSelectedPosition] = useState<string>("all")
  const [selectedOwnerClub, setSelectedOwnerClub] = useState<string>("all")
  const [selectedPlayingClub, setSelectedPlayingClub] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [minSalary, setMinSalary] = useState<string>("")
  const [maxSalary, setMaxSalary] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 15

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player => {
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (selectedNationality !== "all" && player.nationality !== selectedNationality) return false
      if (selectedPosition !== "all" && player.position !== selectedPosition) return false
      if (selectedOwnerClub !== "all" && player.ownerClub !== selectedOwnerClub) return false
      if (selectedPlayingClub !== "all" && player.playingClub !== selectedPlayingClub) return false
      if (selectedStatus !== "all" && player.status !== selectedStatus) return false
      if (minSalary && player.salary < parseInt(minSalary)) return false
      if (maxSalary && player.salary > parseInt(maxSalary)) return false
      return true
    })
  }, [searchTerm, selectedNationality, selectedPosition, selectedOwnerClub, selectedPlayingClub, selectedStatus, minSalary, maxSalary])

  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  )

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedNationality("all")
    setSelectedPosition("all")
    setSelectedOwnerClub("all")
    setSelectedPlayingClub("all")
    setSelectedStatus("all")
    setMinSalary("")
    setMaxSalary("")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedNationality !== "all" || selectedPosition !== "all" || 
    selectedOwnerClub !== "all" || selectedPlayingClub !== "all" || selectedStatus !== "all" ||
    minSalary || maxSalary

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Jugadores</h1>
            <p className="text-sm text-muted-foreground">
              Base de datos completa - {filteredPlayers.length} jugadores encontrados
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Filtros</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                <X className="w-3 h-3" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar jugador..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>

            {/* Nationality */}
            <Select value={selectedNationality} onValueChange={(v) => { setSelectedNationality(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[140px] bg-transparent">
                <SelectValue placeholder="Nacionalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {nationalities.map(nat => (
                  <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Position */}
            <Select value={selectedPosition} onValueChange={(v) => { setSelectedPosition(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[120px] bg-transparent">
                <SelectValue placeholder="Posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Owner Club */}
            <Select value={selectedOwnerClub} onValueChange={(v) => { setSelectedOwnerClub(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[150px] bg-transparent">
                <SelectValue placeholder="Club Dueño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {clubs.map(club => (
                  <SelectItem key={club} value={club}>{club}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Playing Club */}
            <Select value={selectedPlayingClub} onValueChange={(v) => { setSelectedPlayingClub(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[150px] bg-transparent">
                <SelectValue placeholder="Club Actual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {playingClubs.map(club => (
                  <SelectItem key={club} value={club}>{club}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[120px] bg-transparent">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Salary Range */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Salario min"
                type="number"
                value={minSalary}
                onChange={(e) => { setMinSalary(e.target.value); setCurrentPage(1) }}
                className="w-[100px]"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                placeholder="Salario max"
                type="number"
                value={maxSalary}
                onChange={(e) => { setMaxSalary(e.target.value); setCurrentPage(1) }}
                className="w-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-medium text-muted-foreground bg-muted/30">
                  <th className="py-3 px-4 text-left">Jugador</th>
                  <th className="py-3 px-3 text-center">Nacionalidad</th>
                  <th className="py-3 px-3 text-center">Pos</th>
                  <th className="py-3 px-3 text-center">Edad</th>
                  <th className="py-3 px-3 text-center">MED</th>
                  <th className="py-3 px-3 text-right">Salario</th>
                  <th className="py-3 px-3 text-left">Club Dueño</th>
                  <th className="py-3 px-3 text-left">Club Actual</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link 
                        href={`/player/${player.id}`}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-lg" title={player.nationality}>{player.nationalityFlag}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className="text-xs">{player.position}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center text-muted-foreground">{player.age}</td>
                    <td className="py-3 px-3 text-center font-bold text-primary">{player.rating}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      €{player.salary.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <Link 
                        href={`/team/${player.ownerSlug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {player.ownerClub}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <Link 
                        href={`/team/${player.playingSlug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {player.playingClub}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge 
                        variant={player.status === "Cedido" ? "secondary" : "outline"}
                        className={player.status === "Cedido" ? "bg-warning/20 text-warning border-warning/30" : ""}
                      >
                        {player.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * playersPerPage + 1} - {Math.min(currentPage * playersPerPage, filteredPlayers.length)} de {filteredPlayers.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron jugadores con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  )
}
