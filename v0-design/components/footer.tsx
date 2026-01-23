import Link from "next/link"
import { Trophy } from "lucide-react"

const footerLinks = {
  Liga: [
    { name: "Posiciones", href: "/standings" },
    { name: "Fixtures", href: "/fixtures" },
    { name: "Estadísticas", href: "/stats" },
    { name: "Historial", href: "/history" },
  ],
  Competencias: [
    { name: "Copa Kempes", href: "/copa/kempes" },
    { name: "Copa de Oro", href: "/copa/oro" },
    { name: "Copa de Plata", href: "/copa/plata" },
    { name: "Ligas", href: "/standings" },
  ],
  Comunidad: [
    { name: "Jugadores", href: "/players" },
    { name: "Fichajes", href: "/transfers" },
    { name: "Noticias", href: "/news" },
    { name: "Reglamento", href: "/rules" },
  ],
  Ayuda: [
    { name: "Cómo unirse", href: "/join" },
    { name: "Subir Resultado", href: "/submit-result" },
    { name: "FAQ", href: "/faq" },
    { name: "Contacto", href: "/contact" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">KEMPES</span>
                <span className="text-xs block text-muted-foreground tracking-wider">MASTER LEAGUE</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              La liga online de FIFA más grande para 40 jugadores de elite.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Kempes Master League. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Términos
            </Link>
            <Link href="/rules" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Reglamento
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
