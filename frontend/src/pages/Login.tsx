import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from 'react-i18next'
import { COMPANY_NAME } from '../config/brand'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '../types/api'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showTotpInput, setShowTotpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const loginStore = useAuthStore((s) => s.login)
  const { t } = useTranslation()

  const from = (location.state as { from?: string })?.from || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authService.login(email, password, showTotpInput ? totpCode : undefined)
      const data = res.data.data

      if (data.totpRequired && !showTotpInput) {
        setShowTotpInput(true)
        setLoading(false)
        return
      }

      if (!data.accessToken) {
        setError(t('login.errors.authFailed', 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'))
        setLoading(false)
        return
      }

      loginStore(data.accessToken, {
        displayId: data.displayId,
        name: data.name,
        email: data.email,
        role: data.role,
      })

      navigate(from, { replace: true })
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>
      const msg = axiosErr.response?.data?.message
      if (axiosErr.response?.status === 429) {
        setError(t('login.errors.tooManyRequests', 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.'))
      } else if (axiosErr.response?.status === 401) {
        setError(msg || t('login.errors.invalidCredentials', 'Ungültige Anmeldedaten.'))
      } else {
        setError(msg || t('login.errors.authFailed', 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('login.seoTitle', { company: COMPANY_NAME, defaultValue: `Anmelden | ${COMPANY_NAME}` })}</title>
        <meta name="description" content={t('login.seoDesc', 'Melden Sie sich an, um Ihre Reservierungen zu verwalten.')} />
      </Helmet>

      <div className="grow relative flex items-center justify-center p-4 py-12 lg:py-20 overflow-hidden bg-background-light dark:bg-background-dark">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L50 100 M0 50 L100 50' stroke='%233a3227' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='50' cy='50' r='10' stroke='%233a3227' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")` }}>
        </div>
        <div className="absolute inset-0 z-0 bg-linear-to-b from-transparent via-background-dark/50 to-background-dark pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md flex flex-col gap-8 items-center">
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface-dark border border-white/5 shadow-inner mb-2">
              <span className="material-symbols-outlined text-primary text-2xl">login</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-lg">
              {t('login.title', 'Anmelden')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-light">
              {t('login.subtitle', 'Melden Sie sich an, um Ihre Reservierungen zu verwalten.')}
            </p>
          </div>

          <div className="bg-surface-dark/60 backdrop-blur-xl border border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-full rounded-2xl p-6 md:p-10 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!showTotpInput ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white ml-1 flex items-center gap-2" htmlFor="login-email">
                      <span className="material-symbols-outlined text-primary text-sm">alternate_email</span>
                      {t('login.form.emailLabel', 'E-Mail Adresse')}
                    </label>
                    <div className="relative group rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">mail</span>
                      <input
                        className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none block pl-12 p-4 placeholder:text-slate-600 transition-colors"
                        id="login-email"
                        type="email"
                        placeholder={t('login.form.emailPlaceholder', 'ihre@email.com')}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white ml-1 flex items-center gap-2" htmlFor="login-password">
                      <span className="material-symbols-outlined text-primary text-sm">lock</span>
                      {t('login.form.passwordLabel', 'Passwort')}
                    </label>
                    <div className="relative group rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">lock</span>
                      <input
                        className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none block pl-12 pr-12 p-4 placeholder:text-slate-600 transition-colors"
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.form.passwordPlaceholder', '••••••••')}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">security</span>
                    <p className="text-sm text-slate-300">{t('login.form.totpDesc', 'Bitte geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.')}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white ml-1" htmlFor="login-totp">{t('login.form.totpLabel', '2FA-Code')}</label>
                    <div className="relative group rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">pin</span>
                      <input
                        className="w-full bg-[#1f1a15] border border-white/10 text-white rounded-xl focus:outline-none block pl-12 p-4 text-center tracking-[0.3em] font-mono placeholder:text-slate-600 transition-colors"
                        id="login-totp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        placeholder={t('login.form.totpPlaceholder', '000000')}
                        required
                        autoFocus
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => { setShowTotpInput(false); setTotpCode(''); setError('') }}
                  >
                    {t('login.form.backToLogin', 'Zurück zur Anmeldung')}
                  </button>
                </div>
              )}

              <button
                className="w-full bg-primary text-white font-bold text-base py-4 rounded-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-primary/20"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{showTotpInput ? t('login.form.submitVerify', 'Verifizieren') : t('login.form.submitLogin', 'Anmelden')}</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {t('login.footer', 'Reservierungssystem für Sportanlagen')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
