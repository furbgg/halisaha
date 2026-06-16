import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

interface HappyHourConfig {
  enabled: boolean
  startTime: string
  endTime: string
  discountPercent: number
}

export function HappyHourBadge() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<HappyHourConfig | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/settings/happy-hour')
        setConfig(res.data.data)
      } catch {
      }
    }
    fetchConfig()

    const interval = setInterval(fetchConfig, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!config?.enabled || dismissed) return null

  return (
    <>
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-100 max-w-sm animate-bounce-subtle">
        <div className="relative flex items-center gap-4 rounded-2xl border border-primary/50 bg-background-dark/80 p-4 shadow-[0_0_30px_rgba(255,68,0,0.2)] backdrop-blur-xl">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,68,0,0.3)]">
            <span className="material-symbols-outlined text-3xl animate-pulse">redeem</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest text-primary uppercase">
              {t('booking.step1.happyHour.active', 'Happy Hour Aktiv!')}
            </span>
            <span className="text-xs font-medium text-slate-300">
              {config.startTime} - {config.endTime} | <span className="text-white font-bold">-{config.discountPercent}% {t('booking.step1.happyHour.discount', 'Rabatt')}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
