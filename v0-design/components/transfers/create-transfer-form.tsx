"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowRightLeft, Plus, X, ArrowLeft, CheckCircle2, Newspaper, DollarSign, Calendar, User, Building2 } from "lucide-react"
import Link from "next/link"

// Mock teams for selects
const teams = [
  { id: "river", name: "River Plate" },
  { id: "boca", name: "Boca Juniors" },
  { id: "racing", name: "Racing Club" },
  { id: "independiente", name: "Independiente" },
  { id: "san-lorenzo", name: "San Lorenzo" },
  { id: "huracan", name: "Huracán" },
  { id: "velez", name: "Vélez Sarsfield" },
  { id: "estudiantes", name: "Estudiantes" },
  { id: "lanus", name: "Lanús" },
  { id: "banfield", name: "Banfield" },
]

// Mock players for selects (would be filtered by team in real app)
const allPlayers = [
  { id: "1", name: "Erling Haaland", team: "river", position: "DC", rating: 94 },
  { id: "2", name: "Kylian Mbappé", team: "boca", position: "EI", rating: 96 },
  { id: "3", name: "Jude Bellingham", team: "racing", position: "MCO", rating: 91 },
  { id: "4", name: "Vinicius Jr", team: "independiente", position: "EI", rating: 93 },
  { id: "5", name: "Rodri", team: "estudiantes", position: "MCD", rating: 92 },
  { id: "6", name: "Florian Wirtz", team: "velez", position: "MCO", rating: 88 },
  { id: "7", name: "Gavi", team: "lanus", position: "MC", rating: 85 },
  { id: "8", name: "Lamine Yamal", team: "boca", position: "ED", rating: 87 },
]

type TransferType = "compra" | "venta" | "cesion"

interface PlayerInvolved {
  id: string
  playerId: string
  direction: "in" | "out" // in = comes to the team, out = leaves the team
}

interface PaymentInstallment {
  id: string
  amount: string
  dueDate: string
}

export function CreateTransferForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  
  // Form state
  const [transferType, setTransferType] = useState<TransferType>("compra")
  const [fromTeam, setFromTeam] = useState("")
  const [toTeam, setToTeam] = useState("")
  
  // Players involved
  const [playersInvolved, setPlayersInvolved] = useState<PlayerInvolved[]>([
    { id: "1", playerId: "", direction: "in" }
  ])
  
  // Financial details
  const [totalPrice, setTotalPrice] = useState("")
  const [hasInstallments, setHasInstallments] = useState(false)
  const [installments, setInstallments] = useState<PaymentInstallment[]>([
    { id: "1", amount: "", dueDate: "" }
  ])
  
  // Loan specific
  const [loanDuration, setLoanDuration] = useState("")
  const [hasBuyOption, setHasBuyOption] = useState(false)
  const [buyOptionAmount, setBuyOptionAmount] = useState("")
  const [loanFee, setLoanFee] = useState("")

  const addPlayer = () => {
    setPlayersInvolved([
      ...playersInvolved,
      { id: Date.now().toString(), playerId: "", direction: playersInvolved.length === 0 ? "in" : "out" }
    ])
  }

  const removePlayer = (id: string) => {
    if (playersInvolved.length > 1) {
      setPlayersInvolved(playersInvolved.filter(p => p.id !== id))
    }
  }

  const updatePlayer = (id: string, field: keyof PlayerInvolved, value: string) => {
    setPlayersInvolved(playersInvolved.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const addInstallment = () => {
    setInstallments([
      ...installments,
      { id: Date.now().toString(), amount: "", dueDate: "" }
    ])
  }

  const removeInstallment = (id: string) => {
    if (installments.length > 1) {
      setInstallments(installments.filter(i => i.id !== id))
    }
  }

  const updateInstallment = (id: string, field: keyof PaymentInstallment, value: string) => {
    setInstallments(installments.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setShowSuccessDialog(true)
  }

  const handleCreateNews = () => {
    router.push("/news/create?source=transfer")
  }

  const handleBackToTransfers = () => {
    router.push("/transfers")
  }

  const filteredPlayersFrom = fromTeam ? allPlayers.filter(p => p.team === fromTeam) : allPlayers
  const filteredPlayersTo = toTeam ? allPlayers.filter(p => p.team === toTeam) : allPlayers

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/transfers">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Subir Transferencia</h1>
              <p className="text-sm text-muted-foreground">Registra un nuevo movimiento en el mercado</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Type */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Tipo de Transferencia
              </CardTitle>
              <CardDescription>Selecciona el tipo de operación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "compra", label: "Compra", description: "Adquisición de un jugador" },
                  { value: "venta", label: "Venta", description: "Salida de un jugador" },
                  { value: "cesion", label: "Cesión / Préstamo", description: "Préstamo temporal" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setTransferType(type.value as TransferType)}
                    className={`flex-1 min-w-[150px] p-4 rounded-xl border-2 transition-all text-left ${
                      transferType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/50"
                    }`}
                  >
                    <p className={`font-semibold ${transferType === type.value ? "text-primary" : "text-foreground"}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teams Involved */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Equipos Involucrados
              </CardTitle>
              <CardDescription>Selecciona los equipos de origen y destino</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipo de origen</Label>
                  <Select value={fromTeam} onValueChange={setFromTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipo de destino</Label>
                  <Select value={toTeam} onValueChange={setToTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(t => t.id !== fromTeam).map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Involved */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Jugadores Involucrados
                  </CardTitle>
                  <CardDescription>Agrega los jugadores que forman parte de la operación</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPlayer} className="gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {playersInvolved.map((player, index) => (
                <div key={player.id} className="flex items-end gap-3 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Jugador {index + 1}</Label>
                    <Select 
                      value={player.playerId} 
                      onValueChange={(v) => updatePlayer(player.id, "playerId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar jugador..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(player.direction === "in" ? filteredPlayersFrom : filteredPlayersTo).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              {p.name}
                              <Badge variant="outline" className="text-[10px]">{p.position}</Badge>
                              <span className="text-xs text-primary">{p.rating}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[140px] space-y-2">
                    <Label>Dirección</Label>
                    <Select 
                      value={player.direction} 
                      onValueChange={(v) => updatePlayer(player.id, "direction", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entra</SelectItem>
                        <SelectItem value="out">Sale (contrapartida)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {playersInvolved.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer(player.id)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Detalles Financieros
              </CardTitle>
              <CardDescription>Información sobre el monto de la operación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {transferType === "cesion" ? (
                <>
                  {/* Loan Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Duración del préstamo
                      </Label>
                      <Select value={loanDuration} onValueChange={setLoanDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar duración..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 meses</SelectItem>
                          <SelectItem value="12">1 temporada</SelectItem>
                          <SelectItem value="18">1.5 temporadas</SelectItem>
                          <SelectItem value="24">2 temporadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Costo del préstamo (opcional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={loanFee}
                          onChange={(e) => setLoanFee(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buy Option */}
                  <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Opción de compra</Label>
                        <p className="text-xs text-muted-foreground mt-1">El préstamo incluye opción de compra</p>
                      </div>
                      <Switch checked={hasBuyOption} onCheckedChange={setHasBuyOption} />
                    </div>
                    {hasBuyOption && (
                      <div className="space-y-2">
                        <Label>Monto de la opción de compra</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={buyOptionAmount}
                            onChange={(e) => setBuyOptionAmount(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Total Price */}
                  <div className="space-y-2">
                    <Label>Precio total de la operación</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(e.target.value)}
                        className="pl-8 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Installments */}
                  <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pago en cuotas</Label>
                        <p className="text-xs text-muted-foreground mt-1">El pago se realizará en múltiples cuotas</p>
                      </div>
                      <Switch checked={hasInstallments} onCheckedChange={setHasInstallments} />
                    </div>

                    {hasInstallments && (
                      <div className="space-y-3">
                        {installments.map((installment, index) => (
                          <div key={installment.id} className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs">Cuota {index + 1}</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                                <Input
                                  type="number"
                                  placeholder="Monto"
                                  value={installment.amount}
                                  onChange={(e) => updateInstallment(installment.id, "amount", e.target.value)}
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs">Fecha de pago</Label>
                              <Input
                                type="date"
                                value={installment.dueDate}
                                onChange={(e) => updateInstallment(installment.id, "dueDate", e.target.value)}
                              />
                            </div>
                            {installments.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInstallment(installment.id)}
                                className="shrink-0 text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addInstallment} className="gap-2 bg-transparent">
                          <Plus className="w-4 h-4" />
                          Agregar cuota
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" className="bg-transparent" asChild>
              <Link href="/transfers">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Transferencia
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <DialogTitle className="text-center">Transferencia Registrada</DialogTitle>
            <DialogDescription className="text-center">
              La transferencia se ha guardado correctamente en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              ¿Te gustaría crear una noticia sobre esta transferencia?
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleBackToTransfers} className="flex-1 bg-transparent">
              Volver a transferencias
            </Button>
            <Button onClick={handleCreateNews} className="flex-1 gap-2">
              <Newspaper className="w-4 h-4" />
              Crear noticia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
