"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Star,
  Plus
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const transferTypes = ["Todos", "Compra", "Venta", "Préstamo", "Fin de préstamo", "Libre"]
const positions = ["Todas", "POR", "DFC", "LI", "LD", "MCD", "MC", "MCO", "MI", "MD", "EI", "ED", "DC", "SD"]

const allTransfers = [
  {
    id: 1,
    player: "Erling Haaland",
    position: "DC",
    rating: 94,
    type: "Compra",
    fromTeam: "Manchester City",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    toTeam: "River Plate",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg",
    fee: "180M",
    date: "14 Ene 2026",
  },
  {
    id: 2,
    player: "Kylian Mbappé",
    position: "EI",
    rating: 96,
    type: "Préstamo",
    fromTeam: "Real Madrid",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    toTeam: "San Lorenzo",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/7/73/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg",
    fee: "25M/año",
    date: "13 Ene 2026",
  },
  {
    id: 3,
    player: "Lamine Yamal",
    position: "ED",
    rating: 87,
    type: "Compra",
    fromTeam: "Barcelona",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    toTeam: "Boca Juniors",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.png",
    fee: "120M",
    date: "12 Ene 2026",
  },
  {
    id: 4,
    player: "Jude Bellingham",
    position: "MCO",
    rating: 91,
    type: "Venta",
    fromTeam: "Racing Club",
    fromLogo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Racing_Club_logo.svg",
    toTeam: "Real Madrid",
    toLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    fee: "150M",
    date: "11 Ene 2026",
  },
  {
    id: 5,
    player: "Vinicius Jr",
    position: "EI",
    rating: 93,
    type: "Libre",
    fromTeam: "Real Madrid",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    toTeam: "Independiente",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg",
    fee: "Gratis",
    date: "10 Ene 2026",
  },
  {
    id: 6,
    player: "Rodri",
    position: "MCD",
    rating: 92,
    type: "Compra",
    fromTeam: "Manchester City",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    toTeam: "Estudiantes",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Estudiantes_de_La_Plata_logo.svg",
    fee: "95M",
    date: "9 Ene 2026",
  },
  {
    id: 7,
    player: "Florian Wirtz",
    position: "MCO",
    rating: 88,
    type: "Fin de préstamo",
    fromTeam: "Vélez Sarsfield",
    fromLogo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg",
    toTeam: "Bayer Leverkusen",
    toLogo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
    fee: "-",
    date: "8 Ene 2026",
  },
  {
    id: 8,
    player: "Gavi",
    position: "MC",
    rating: 85,
    type: "Préstamo",
    fromTeam: "Barcelona",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    toTeam: "Lanús",
    toLogo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/CA_Lan%C3%BAs.svg",
    fee: "5M/año",
    date: "7 Ene 2026",
  },
]

const typeColors: Record<string, string> = {
  "Compra": "bg-green-500/10 text-green-500",
  "Venta": "bg-red-500/10 text-red-500",
  "Préstamo": "bg-amber-500/10 text-amber-500",
  "Fin de préstamo": "bg-blue-500/10 text-blue-500",
  "Libre": "bg-purple-500/10 text-purple-500",
}

export function TransfersPageContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Todos")
  const [selectedPosition, setSelectedPosition] = useState("Todas")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredTransfers = allTransfers.filter((t) => {
    const matchesSearch = t.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toTeam.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "Todos" || t.type === selectedType
    const matchesPosition = selectedPosition === "Todas" || t.position === selectedPosition
    return matchesSearch && matchesType && matchesPosition
  })

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage)
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalSpent = allTransfers
    .filter(t => t.type === "Compra" || t.type === "Préstamo")
    .reduce((acc, t) => {
      const num = parseFloat(t.fee.replace(/[^\d.]/g, ''))
      return acc + (isNaN(num) ? 0 : num)
    }, 0)

  const totalSold = allTransfers
    .filter(t => t.type === "Venta")
    .reduce((acc, t) => {
      const num = parseFloat(t.fee.replace(/[^\d.]/g, ''))
      return acc + (isNaN(num) ? 0 : num)
    }, 0)

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transferencias</h1>
            <p className="text-sm text-muted-foreground">Mercado de pases de la KML Temporada 8</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href="/transfers/create">
            <Plus className="w-4 h-4" />
            Subir Transferencia
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Total</p>
              <p className="text-lg font-bold text-foreground">{allTransfers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Invertido</p>
              <p className="text-lg font-bold text-green-500">{totalSpent}M</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Vendido</p>
              <p className="text-lg font-bold text-red-500">{totalSold}M</p>
            </div>
          </div>
        </Card>
        <Card className="bg-card border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Top Fichaje</p>
              <p className="text-lg font-bold text-amber-500">180M</p>
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
                placeholder="Buscar jugador o equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px] bg-transparent">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {transferTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-[120px] bg-transparent">
                <SelectValue placeholder="Posicion" />
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
                setSelectedType("Todos")
                setSelectedPosition("Todas")
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Movimientos Recientes</CardTitle>
            <Badge variant="outline">{filteredTransfers.length} transferencias</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {paginatedTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Player Info */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{transfer.rating}</span>
                  </div>
                  <div>
                    <Link 
                      href={`/players/${transfer.player.toLowerCase().replace(/\s+/g, '-')}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {transfer.player}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{transfer.position}</Badge>
                      <Badge className={cn("text-[10px] px-1.5 py-0", typeColors[transfer.type])}>
                        {transfer.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Transfer Direction */}
                <div className="flex items-center gap-3 flex-1 justify-center">
                  <div className="flex items-center gap-2 min-w-[140px] justify-end">
                    <Link href={`/team/${transfer.fromTeam.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-muted-foreground hidden sm:block text-right hover:text-primary transition-colors">
                      {transfer.fromTeam}
                    </Link>
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      <img
                        src={transfer.fromLogo || "/placeholder.svg"}
                        alt={transfer.fromTeam}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      <img
                        src={transfer.toLogo || "/placeholder.svg"}
                        alt={transfer.toTeam}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <Link href={`/team/${transfer.toTeam.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-muted-foreground hidden sm:block hover:text-primary transition-colors">
                      {transfer.toTeam}
                    </Link>
                  </div>
                </div>

                {/* Fee and Date */}
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-primary">{transfer.fee}</p>
                  <p className="text-xs text-muted-foreground">{transfer.date}</p>
                </div>
              </div>
            ))}

            {filteredTransfers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron transferencias con los filtros aplicados.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransfers.length)} de {filteredTransfers.length}
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm text-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  )
}
