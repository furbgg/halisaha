import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface HoldTimerProps {
  /** ISO timestamp of when the hold was created (defaults to mount time) */
  holdCreatedAt?: string
}

export function HoldTimer({ holdCreatedAt }: HoldTimerProps) {
  const navigate = useNavigate()
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(0)
  const [dismissed, setDismissed] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStartRef = useRef<number>(Date.now())

  useEffect(() => {
    holdStartRef.current = holdCreatedAt ? new Date(holdCreatedAt).getTime() : Date.now()

    api.get('/settings/hold-duration')
      .then(res => {
        const minutes = res.data.data?.holdDurationMinutes || 5
        const total = minutes * 60
        setTotalSeconds(total)
        const elapsed = Math.floor((Date.now() - holdStartRef.current) / 1000)
        setRemaining(Math.max(0, total - elapsed))
      })
      .catch(() => {
        setTotalSeconds(300)
        setRemaining(300)
      })
  }, [holdCreatedAt])

  useEffect(() => {
    if (totalSeconds === null) return

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          navigate('/reservierung', {
            replace: true,
            state: { holdExpired: true }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [totalSeconds, navigate])

  if (totalSeconds === null || dismissed) return null

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0
  const isUrgent = remaining <= 60

  return (
    <div className="fixed bottom-6 left-6 z-100 max-w-xs">
      <div className={`relative flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl shadow-lg transition-all duration-500 ${
        isUrgent 
          ? 'border-red-500/50 bg-red-950/80 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
          : 'border-primary/40 bg-background-dark/80 shadow-[0_0_20px_rgba(255,68,0,0.15)]'
      }`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="3"
            />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke={isUrgent ? '#ef4444' : '#ff4400'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`text-sm font-black tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-black uppercase tracking-widest ${isUrgent ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
            {isUrgent ? 'Eilt!' : 'Reservierung'}
          </span>
          <span className="text-[11px] font-medium text-slate-300 leading-tight">
            {isUrgent 
              ? 'Deine Reservierung läuft gleich ab!' 
              : 'Platz für dich reserviert'}
          </span>
        </div>
      </div>
    </div>
  )
}
