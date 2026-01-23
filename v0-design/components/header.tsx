"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar, TrendingUp, Newspaper, Menu, X, ChevronDown, Shield, Award } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Posiciones", href: "/standings", icon: Trophy },
  { name: "Fixtures", href: "/fixtures", icon: Calendar },
  { name: "Fichajes", href: "/transfers", icon: TrendingUp },
  { name: "Jugadores", href: "/players", icon: Users },
  { name: "Noticias", href: "/news", icon: Newspaper },
]

const competitionsMayores = [
  { name: "Primera División", href: "/liga/mayores/primera", division: 1 },
  { name: "Segunda División", href: "/liga/mayores/segunda", division: 2 },
  { name: "Tercera División", href: "/liga/mayores/tercera", division: 3 },
  { name: "Cuarta División", href: "/liga/mayores/cuarta", division: 4 },
]

const competitionsMenores = [
  { name: "Primera División", href: "/liga/menores/primera", division: 1 },
  { name: "Segunda División", href: "/liga/menores/segunda", division: 2 },
  { name: "Tercera División", href: "/liga/menores/tercera", division: 3 },
  { name: "Cuarta División", href: "/liga/menores/cuarta", division: 4 },
]

const copas = [
  { name: "Copa Kempes", href: "/copa/kempes", icon: Trophy },
  { name: "Copa de Oro", href: "/copa/oro", icon: Award },
  { name: "Copa de Plata", href: "/copa/plata", icon: Shield },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-foreground">MASTER LEAGUE</span>
              <span className="text-xs block text-muted-foreground tracking-wider">ONLINE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}

            {/* Ligas Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Shield className="w-4 h-4" />
                  Ligas
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-primary">Mayores</DropdownMenuLabel>
                {competitionsMayores.map((comp) => (
                  <DropdownMenuItem key={comp.href} asChild>
                    <Link href={comp.href} className="flex items-center justify-between">
                      {comp.name}
                      <span className="text-xs text-muted-foreground">Div {comp.division}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-primary">Menores</DropdownMenuLabel>
                {competitionsMenores.map((comp) => (
                  <DropdownMenuItem key={comp.href} asChild>
                    <Link href={comp.href} className="flex items-center justify-between">
                      {comp.name}
                      <span className="text-xs text-muted-foreground">Div {comp.division}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Copas Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Trophy className="w-4 h-4" />
                  Copas
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {copas.map((copa) => (
                  <DropdownMenuItem key={copa.href} asChild>
                    <Link href={copa.href} className="flex items-center gap-2">
                      <copa.icon className="w-4 h-4 text-primary" />
                      {copa.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90">
              Subir Resultado
            </Button>
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}

              {/* Ligas Mobile */}
              <div className="pt-4 border-t border-border mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">Ligas Mayores</p>
                {competitionsMayores.map((comp) => (
                  <Link
                    key={comp.href}
                    href={comp.href}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {comp.name}
                    <span className="text-xs text-muted-foreground">Div {comp.division}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-border mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">Ligas Menores</p>
                {competitionsMenores.map((comp) => (
                  <Link
                    key={comp.href}
                    href={comp.href}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {comp.name}
                    <span className="text-xs text-muted-foreground">Div {comp.division}</span>
                  </Link>
                ))}
              </div>

              {/* Copas Mobile */}
              <div className="pt-4 border-t border-border mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">Copas</p>
                {copas.map((copa) => (
                  <Link
                    key={copa.href}
                    href={copa.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <copa.icon className="w-5 h-5 text-primary" />
                    {copa.name}
                  </Link>
                ))}
              </div>

              <Button className="mt-4 mx-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Subir Resultado
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
