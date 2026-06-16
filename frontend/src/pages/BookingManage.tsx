import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

export function BookingManage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [bookingId, setBookingId] = useState(id || '')
  const [manageToken, setManageToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      setBookingId(id)
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const code = bookingId.trim()
    const token = manageToken.trim()
    if (!code || !token) return

    setLoading(true)
    try {
      const res = await api.get(`/reservations/${encodeURIComponent(code)}`, {
        headers: { 'X-Manage-Token': token },
      })

      const reservation = res.data.data
      if (!reservation.customerEmail) {
        setError(t('bookingManage.error.tokenMismatch', 'Ungueltiger Zugriffscode fuer diese Buchung.'))
        return
      }

      sessionStorage.setItem(`manage-token:${code}`, token)
      navigate(`/reservierung/verwalten/${code}`, {
        state: { reservation, manageToken: token },
      })
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(t('bookingManage.error.notFound', 'Keine Buchung mit dieser ID gefunden.'))
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError(t('bookingManage.error.tokenMismatch', 'Ungueltiger Zugriffscode fuer diese Buchung.'))
      } else {
        setError(t('bookingManage.error.generic', 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grow relative flex items-center justify-center p-4 py-12 lg:py-20 overflow-hidden bg-background-light dark:bg-background-dark">
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L50 100 M0 50 L100 50' stroke='%233a3227' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='50' cy='50' r='10' stroke='%233a3227' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-transparent via-background-dark/50 to-background-dark pointer-events-none"></div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8 items-center">
        <div className="text-center space-y-4 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface-dark border border-white/5 shadow-inner mb-2">
            <span className="material-symbols-outlined text-primary text-2xl">manage_search</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-lg">
            {t('bookingManage.title', 'Deine Buchung verwalten')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed font-light">
            {t('bookingManage.desc', 'Gib deine Buchungs-ID und den Zugriffscode ein, um deine Reservierung einzusehen oder zu aendern.')}
          </p>
        </div>

        <div className="bg-surface-dark/60 backdrop-blur-xl border border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-full rounded-2xl p-6 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-white ml-1 flex items-center gap-2" htmlFor="booking-id">
                <span className="material-symbols-outlined text-primary text-sm">confirmation_number</span>
                {t('bookingManage.form.idLabel', 'Buchungs-ID')}
              </label>
              <div className="relative group rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                  <span className="font-mono text-lg opacity-50">#</span>
                </div>
                <input
                  className="w-full bg-white dark:bg-[#1f1a15] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-lg rounded-xl focus:outline-none block pl-10 p-4 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
                  id="booking-id"
                  placeholder={t('bookingManage.form.idPlaceholder', 'RES-A1B2C3')}
                  type="text"
                  value={bookingId}
                  onChange={(e) => {
                    setBookingId(e.target.value)
                    setError('')
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-white ml-1 flex items-center gap-2" htmlFor="manage-token">
                <span className="material-symbols-outlined text-primary text-sm">vpn_key</span>
                {t('bookingManage.form.manageTokenLabel', 'Zugriffscode')}
              </label>
              <div className="relative group rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl opacity-70">key</span>
                </div>
                <input
                  className="w-full bg-white dark:bg-[#1f1a15] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-lg rounded-xl focus:outline-none block pl-12 p-4 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
                  id="manage-token"
                  placeholder={t('bookingManage.form.manageTokenPlaceholder', 'Dein Zugriffscode')}
                  type="text"
                  value={manageToken}
                  onChange={(e) => {
                    setManageToken(e.target.value)
                    setError('')
                  }}
                  required
                />
              </div>
            </div>

            <button
              className="w-full bg-primary hover:bg-orange-600 text-white font-black text-lg py-4 rounded-xl shadow-[0_0_15px_rgba(255,140,0,0.3)] hover:shadow-[0_0_25px_rgba(255,140,0,0.5)] transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>{t('bookingManage.form.loading', 'Wird gesucht...')}</span>
                </>
              ) : (
                <>
                  <span>{t('bookingManage.form.submit', 'BUCHUNG FINDEN')}</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('bookingManage.help.text', 'Buchungs-ID vergessen? Ueberpruefe dein E-Mail-Postfach oder')}{' '}
              <a className="text-primary hover:underline hover:text-orange-400 transition-colors cursor-pointer" onClick={() => navigate('/kontakt')}>
                {t('bookingManage.help.link', 'kontaktiere unseren Support')}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
