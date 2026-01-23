"use client"

import { Calendar, TrendingUp, DollarSign, Trophy } from "lucide-react"

const stats = [
  {
    label: "Partidos Jugados",
    value: "847",
    total: "1,050",
    icon: Calendar,
    description: "Temporada 8",
  },
  {
    label: "Transferencias",
    value: "234",
    icon: TrendingUp,
    description: "Temp. anterior",
  },
  {
    label: "Dinero Movido",
    value: "€1.2B",
    icon: DollarSign,
    description: "Temp. anterior",
  },
  {
    label: "Campeones",
    value: "8",
    icon: Trophy,
    description: "Temporadas",
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden mb-10">
      {/* Background Image - Stadium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=600&fit=crop')`,
        }}
      />
      {/* Dark Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />

      {/* Content with horizontal padding matching the rest of the app */}
      <div className="relative px-[5%] lg:px-[7%] xl:px-[10%] py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Temporada 8 en curso</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              KEMPES
              <span className="block text-primary">MASTER LEAGUE</span>
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  {stat.total && (
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
