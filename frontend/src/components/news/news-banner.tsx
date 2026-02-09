import { cn } from '@/lib/utils'

interface NewsBannerProps {
  className?: string
}

export function NewsBanner({ className }: NewsBannerProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Soccer field background */}
      <div
        className="absolute inset-0 bg-cover bg-center max-h-60"
        style={{
          backgroundImage:
            'url("https://media.istockphoto.com/id/472347896/es/foto/rayado-campo-de-f%C3%BAtbol.jpg?s=612x612&w=0&k=20&c=0SIlq453FrVIypqDXiMhLM7bigTa3y_CE3pMwFrYs9g=")',
        }}
      />
      <div className="absolute inset-0 bg-black/60 max-h-60" />

      <div className="relative flex flex-col items-center py-5 sm:py-6 px-4 justify-center">
        {/* Decorative top rule */}
        <div className="w-full max-w-2xl border-t border-white/30 mb-3" />

        {/* Logo */}
        <img
          src="/images/80.png"
          alt="Kempes Logo"
          className="w-14 h-14 sm:w-18 sm:h-18 object-contain mb-2"
        />

        {/* Title */}
        <h1
          className="text-3xl sm:text-5xl font-black text-white tracking-wider"
          style={{
            fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
          }}
        >
          THE KEMPES TIMES
        </h1>

        {/* Decorative double rule */}
        <div className="w-full max-w-md mt-3 mb-2 flex flex-col gap-0.5">
          <div className="h-[2px] bg-white/50" />
          <div className="h-[1px] bg-white/30" />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-white/80 italic tracking-widest uppercase">
          Lo último en la Kempes Master League
        </p>

        {/* Decorative bottom rule */}
        <div className="w-full max-w-2xl border-t border-white/30 mt-3" />
      </div>
    </div>
  )
}
