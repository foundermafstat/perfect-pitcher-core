import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/providers/translations-context"

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => void
}

export function BroadcastButton({ isSessionActive, onClick }: BroadcastButtonProps) {
  const { t } = useTranslations();
  return (
    <div className="relative">
      {/* Кольцо подсветки для неактивной кнопки */}
      {!isSessionActive && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse opacity-30 blur-sm"></div>
      )}
      
      <Button
        variant="default"
        className={`relative w-full py-7 px-8 text-xl font-bold flex items-center justify-center gap-3 motion-preset-shake rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          !isSessionActive 
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 dark:from-blue-500 dark:via-purple-500 dark:to-blue-500 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-blue-600 shadow-blue-500/25 border-2 border-blue-400/50' 
            : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xl hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 shadow-red-500/25 border-2 border-red-400/50'
        }`}
        onClick={onClick}
        style={{ fontFamily: 'var(--font-pt-sans-narrow)' }}
      >
        {/* Блестящий эффект для неактивной кнопки */}
        {!isSessionActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse rounded-full"></div>
        )}
        
        {isSessionActive && (
          <Badge variant="secondary" className="animate-pulse bg-white/30 text-white px-3 py-1 font-bold rounded-full shadow-lg border border-white/20">
            {t('broadcast.live')}
          </Badge>
        )}
        <span className="drop-shadow-sm relative z-10 tracking-wide">
          {isSessionActive ? t('broadcast.end') : t('broadcast.start')}
        </span>
      </Button>
    </div>
  )
} 