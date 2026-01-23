"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Trophy,
  Calendar,
  TrendingUp,
  BarChart3,
  Newspaper,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Upload,
  Settings,
  UserCog,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const mainNav: NavItem[] = [
  { name: "Posiciones", href: "/standings", icon: Trophy },
  { name: "Fixtures", href: "/fixtures", icon: Calendar },
  { name: "Estadísticas", href: "/stats", icon: BarChart3 },
  { name: "Fichajes", href: "/transfers", icon: TrendingUp },
  { name: "Jugadores", href: "/players", icon: Users },
  { name: "Noticias", href: "/news", icon: Newspaper },
]

const adminNav: NavItem[] = [
  { name: "Usuarios", href: "/admin/users", icon: UserCog },
  { name: "Jugadores", href: "/admin/players", icon: Users },
  { name: "Clubes", href: "/admin/clubs", icon: Shield },
  { name: "Transferencias", href: "/admin/transfers", icon: TrendingUp },
  { name: "Configuración", href: "/admin/settings", icon: Settings },
]

interface AppSidebarProps {
  isDark: boolean
  onToggleTheme: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({ isDark, onToggleTheme, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const isActive = (href: string) => pathname === href

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      title={isCollapsed ? item.name : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isCollapsed && "justify-center px-2",
        isActive(item.href)
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!isCollapsed && item.name}
    </Link>
  )

  const CollapsibleSection = ({
    title,
    items,
    sectionKey,
  }: {
    title: string
    items: NavItem[]
    sectionKey: string
  }) => {
    const isExpanded = expandedSections.includes(sectionKey)
    
    if (isCollapsed) {
      return (
        <div className="space-y-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )
    }
    
    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors"
        >
          {title}
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {isExpanded && (
          <div className="space-y-1 mt-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn("p-4 border-b border-sidebar-border", isCollapsed && !isMobile && "px-2")}>
        <div className="flex items-center justify-between">
          <Link href="/" className={cn("flex items-center gap-3", isCollapsed && !isMobile && "justify-center")} onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div>
                <span className="text-lg font-bold text-sidebar-foreground block leading-tight">KEMPES</span>
                <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Master League</span>
              </div>
            )}
          </Link>
          {/* Collapse button - only on desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8",
                isCollapsed && "absolute -right-3 top-6 bg-sidebar border border-sidebar-border rounded-full shadow-md"
              )}
            >
              <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      {/* Submit Result Button */}
      <div className={cn("p-4", isCollapsed && !isMobile && "p-2")}>
        <Button 
          asChild 
          className={cn(
            "w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground",
            isCollapsed && !isMobile && "px-0"
          )}
          title={isCollapsed && !isMobile ? "Subir Resultado" : undefined}
        >
          <Link href="/submit-result" onClick={() => setMobileOpen(false)}>
            <Upload className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && <span className="ml-2">Subir Resultado</span>}
          </Link>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className={cn("flex-1 px-3 pb-4 space-y-6 overflow-y-auto", isCollapsed && !isMobile && "px-2 space-y-2")}>
        {/* Principal */}
        <div className="space-y-1">
          {(!isCollapsed || isMobile) && (
            <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Principal
            </p>
          )}
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Admin (solo visible para admins) */}
        {(!isCollapsed || isMobile) && (
          <div className="pt-4 border-t border-sidebar-border">
            <CollapsibleSection title="Administración" items={adminNav} sectionKey="admin" />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-sidebar-border", isCollapsed && !isMobile && "p-2")}>
        <div className={cn("flex items-center justify-between", isCollapsed && !isMobile && "flex-col gap-2")}>
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-xs font-bold text-sidebar-foreground shrink-0">
                JD
              </div>
              <div className="text-sm">
                <p className="font-medium text-sidebar-foreground">Juan Doe</p>
                <p className="text-xs text-sidebar-foreground/60">River Plate</p>
              </div>
            </div>
          )}
          {isCollapsed && !isMobile && (
            <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-xs font-bold text-sidebar-foreground">
              JD
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">KEMPES</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="text-sidebar-foreground"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-sidebar-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-0 w-72 bg-sidebar z-40 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex fixed top-0 left-0 bottom-0 bg-sidebar border-r border-sidebar-border flex-col z-40 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
