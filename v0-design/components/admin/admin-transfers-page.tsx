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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Check,
  X,
  Clock,
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

interface PendingTransfer {
  id: string
  player: string
  position: string
  rating: number
  type: "Compra" | "Venta" | "Préstamo" | "Libre"
  fromTeam: string
  fromLogo: string
  toTeam: string
  toLogo: string
  fee: string
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
  notes?: string
}

const pendingTransfers: PendingTransfer[] = [
  { id: "1", player: "Cole Palmer", position: "MCO", rating: 88, type: "Compra", fromTeam: "Chelsea", fromLogo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", toTeam: "River Plate", toLogo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg", fee: "120M", requestedBy: "xPedro_92", requestedAt: "2026-01-20 14:30", status: "pending" },
  { id: "2", player: "Jamal Musiala", position: "MCO", rating: 89, type: "Préstamo", fromTeam: "Bayern Munich", fromLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", toTeam: "Boca Juniors", toLogo: "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.png", fee: "15M/año", requestedBy: "BocaFan_23", requestedAt: "2026-01-20 12:15", status: "pending" },
  { id: "3", player: "Bukayo Saka", position: "ED", rating: 89, type: "Compra", fromTeam: "Arsenal", fromLogo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg", toTeam: "Racing Club", toLogo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Racing_Club_logo.svg", fee: "150M", requestedBy: "RacingFan_01", requestedAt: "2026-01-19 18:45", status: "pending" },
  { id: "4", player: "Phil Foden", position: "EI", rating: 90, type: "Libre", fromTeam: "Manchester City", fromLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", toTeam: "San Lorenzo", toLogo: "https://upload.wikimedia.org/wikipedia/commons/7/73/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg", fee: "Gratis", requestedBy: "SanLorenzoKML", requestedAt: "2026-01-19 10:00", status: "pending" },
  { id: "5", player: "Pedri", position: "MC", rating: 88, type: "Venta", fromTeam: "Independiente", fromLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg", toTeam: "Barcelona", toLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", fee: "100M", requestedBy: "IndependienteKML", requestedAt: "2026-01-18 20:30", status: "pending" },
  { id: "6", player: "Alexander Arnold", position: "LD", rating: 87, type: "Compra", fromTeam: "Liverpool", fromLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", toTeam: "Huracán", toLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Hurac%C3%A1n_escudo.svg/800px-Hurac%C3%A1n_escudo.svg.png", fee: "80M", requestedBy: "HuracanKML", requestedAt: "2026-01-18 16:00", status: "pending" },
]

const typeColors: Record<string, string> = {
  "Compra": "bg-green-500/10 text-green-500",
  "Venta": "bg-red-500/10 text-red-500",
  "Préstamo": "bg-amber-500/10 text-amber-500",
  "Libre": "bg-purple-500/10 text-purple-500",
}

export function AdminTransfersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransfer | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  
  const itemsPerPage = 6
  const transferTypes = ["Todos", "Compra", "Venta", "Préstamo", "Libre"]

  const filteredTransfers = pendingTransfers.filter((t) => {
    const matchesSearch = t.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "Todos" || t.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage)
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleApprove = (transfer: PendingTransfer) => {
    setSelectedTransfer(transfer)
    setIsApproveOpen(true)
  }

  const handleReject = (transfer: PendingTransfer) => {
    setSelectedTransfer(transfer)
    setRejectReason("")
    setIsRejectOpen(true)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aprobación de Transferencias</h1>
              <p className="text-sm text-muted-foreground">Revisa y aprueba las transferencias pendientes</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-3 py-2 bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Clock className="w-4 h-4" />
            {pendingTransfers.filter(t => t.status === "pending").length} pendientes
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Pendientes</p>
                <p className="text-lg font-bold text-amber-500">{pendingTransfers.filter(t => t.status === "pending").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Compras</p>
                <p className="text-lg font-bold text-green-500">{pendingTransfers.filter(t => t.type === "Compra").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Ventas</p>
                <p className="text-lg font-bold text-red-500">{pendingTransfers.filter(t => t.type === "Venta").length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Préstamos/Libres</p>
                <p className="text-lg font-bold text-purple-500">{pendingTransfers.filter(t => t.type === "Préstamo" || t.type === "Libre").length}</p>
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
                  placeholder="Buscar jugador, equipo o manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] bg-transparent">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {transferTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("Todos")
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
              <CardTitle className="text-foreground">Transferencias Pendientes</CardTitle>
              <Badge variant="outline">{filteredTransfers.length} transferencias</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {paginatedTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-amber-500/20"
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{transfer.rating}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{transfer.player}</span>
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
                    <div className="flex items-center gap-2 min-w-[120px] justify-end">
                      <span className="text-sm text-muted-foreground hidden sm:block text-right">{transfer.fromTeam}</span>
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img src={transfer.fromLogo || "/placeholder.svg"} alt={transfer.fromTeam} className="w-8 h-8 object-contain" />
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img src={transfer.toLogo || "/placeholder.svg"} alt={transfer.toTeam} className="w-8 h-8 object-contain" />
                      </div>
                      <span className="text-sm text-muted-foreground hidden sm:block">{transfer.toTeam}</span>
                    </div>
                  </div>

                  {/* Fee and Request Info */}
                  <div className="text-center min-w-[100px]">
                    <p className="font-bold text-primary">€{transfer.fee}</p>
                    <p className="text-xs text-muted-foreground">Por: {transfer.requestedBy}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(transfer)}
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="gap-1"
                      onClick={() => handleReject(transfer)}
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}

              {filteredTransfers.length === 0 && (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay transferencias pendientes de aprobación.</p>
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

        {/* Approve Dialog */}
        <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Aprobar Transferencia
              </DialogTitle>
              <DialogDescription>
                ¿Confirmas la aprobación de esta transferencia?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{selectedTransfer?.player}</span>
                  <Badge className={cn("text-xs", typeColors[selectedTransfer?.type || "Compra"])}>
                    {selectedTransfer?.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedTransfer?.fromTeam}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>{selectedTransfer?.toTeam}</span>
                </div>
                <p className="text-lg font-bold text-primary mt-2">€{selectedTransfer?.fee}</p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  La transferencia será registrada y los jugadores serán actualizados automáticamente.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveOpen(false)} className="bg-transparent">Cancelar</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsApproveOpen(false)}>
                Confirmar Aprobación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Rechazar Transferencia
              </DialogTitle>
              <DialogDescription>
                Proporciona un motivo para el rechazo de esta transferencia.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{selectedTransfer?.player}</span>
                  <Badge className={cn("text-xs", typeColors[selectedTransfer?.type || "Compra"])}>
                    {selectedTransfer?.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedTransfer?.fromTeam}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>{selectedTransfer?.toTeam}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Solicitado por: {selectedTransfer?.requestedBy}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Motivo del rechazo</Label>
                <Textarea
                  id="reason"
                  placeholder="Ej: Presupuesto insuficiente, jugador no disponible..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectOpen(false)} className="bg-transparent">Cancelar</Button>
              <Button variant="destructive" onClick={() => setIsRejectOpen(false)} disabled={!rejectReason.trim()}>
                Confirmar Rechazo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
