import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Logo } from '../../components/common/Logo'
import api from '../../services/api'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '../../types/api'
import { useTranslation, Trans } from 'react-i18next'
import { ADMIN_PORTAL_PATH } from '../../config/brand'

export function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!token) {
      setError(t('adminAuth.reset.errInvalidToken', 'Ungültiger oder fehlender Token. Bitte fordern Sie einen neuen Link an.'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('adminAuth.reset.errMismatch', 'Die Passwörter stimmen nicht überein.'))
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$/
    if (!passwordRegex.test(password)) {
      setError(t('adminAuth.reset.errWeak', 'Das Passwort erfüllt nicht die Sicherheitsanforderungen.'))
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      
      setTimeout(() => {
        navigate(ADMIN_PORTAL_PATH)
      }, 3000)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>
      const msg = axiosErr.response?.data?.message
      setError(msg || t('adminAuth.reset.errFailed', 'Das Passwort konnte nicht zurückgesetzt werden. Möglicherweise ist der Link abgelaufen.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Passwort zurücksetzen | SALAMANDA SOCCER ARENA</title>
      </Helmet>
      <div 
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-slate-100 antialiased selection:bg-primary selection:text-white"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(10, 8, 6, 0.85), rgba(10, 8, 6, 0.95)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWZQAH9Odoqkrp1XSwCqYbx5Kj5Eay8LXkWxzDumbs6zZFI9DE6iMo__7U7gxeaQRXrgtHHu0-pRzr79K6TgvJm6xqpuFzcRO1GsYKfKSc6Oys7BAVKBP6InTzq5SPSiUryATrY3aj2avqTNXjlrbWUz2Q44IjfM2LHqAXfHOWxKmIHFBxsgAKqUdyk2vKAX9xlBwYYjkRAcZoS99ag5cqMEAK7zSp_uAxgxV4iZY1h3mMeU7bhJ_jEizpQEqEIgkmV-srUkQTYa3z")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <nav className="absolute top-0 left-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-20">
          <Logo variant="small" withLink={false} />

          <div className="hidden md:flex gap-4">
            <button className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-primary transition-colors">{t('adminAuth.reset.support', 'Support')}</button>
            <Link to="/kontakt" className="px-5 py-2 text-sm font-semibold border border-primary/30 rounded-lg text-primary hover:bg-primary/10 hover:border-primary/60 transition-all shadow-[0_0_0_rgba(255,68,0,0)] hover:shadow-[0_0_10px_rgba(255,68,0,0.2)]">
              {t('adminAuth.reset.contact', 'Kontakt')}
            </Link>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-md px-6 my-10">
          <div className="bg-glass rounded-xl p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-md">
            {success ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-500/10 mb-6 border border-green-500/30">
                  <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-3">{t('adminAuth.reset.successTitle', 'Passwort geändert!')}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {t('adminAuth.reset.successDesc', 'Ihr neues Passwort wurde erfolgreich gespeichert. Sie werden in Kürze zur Anmeldung weitergeleitet...')}
                </p>
                <div className="flex justify-center">
                  <span className="inline-block h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6 border border-primary/20 box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)]">
                    <span className="material-symbols-outlined text-3xl text-primary">lock_clock</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-3">{t('adminAuth.reset.title', 'Neues Passwort festlegen')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{t('adminAuth.reset.desc', 'Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es.')}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200 ml-1" htmlFor="new-password">{t('adminAuth.reset.newLabel', 'Neues Passwort')}</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">lock</span>
                      <input 
                        className="w-full bg-background-dark/50 border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600 disabled:opacity-50" 
                        id="new-password" 
                        name="new-password" 
                        placeholder={t('adminAuth.reset.placeholder', '••••••••')} 
                        required 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || !token}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200 ml-1" htmlFor="confirm-password">{t('adminAuth.reset.confirmLabel', 'Passwort bestätigen')}</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">lock_person</span>
                      <input 
                        className="w-full bg-background-dark/50 border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600 disabled:opacity-50" 
                        id="confirm-password" 
                        name="confirm-password" 
                        placeholder={t('adminAuth.reset.placeholder', '••••••••')} 
                        required 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || !token}
                      />
                    </div>
                    <p className="text-xs text-slate-500 ml-1 pt-1 flex items-start gap-1">
                      <span className="material-symbols-outlined text-[14px] relative top-0.5">info</span>
                      <span>{t('adminAuth.reset.info', 'Min. 8 Zeichen, Groß-, Kleinbuchstaben, Zahl & Sonderzeichen')}</span>
                    </p>
                  </div>

                  <button 
                    className="w-full bg-primary text-white font-black text-lg py-4 rounded-lg box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,68,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group border border-orange-400/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    type="submit"
                    disabled={loading || !token}
                  >
                    {loading ? (
                      <span className="inline-block h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('adminAuth.reset.submit', 'PASSWORT SPEICHERN')}</span>
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">save</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <Link 
                    to={ADMIN_PORTAL_PATH} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
                  >
                    <span>{t('adminAuth.reset.cancel', 'Abbrechen')}</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
            <button className="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{t('adminAuth.reset.techSupport', 'Technischer Support')}</button>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{t('adminAuth.reset.copyright', '© 2026 Randevu Halı Saha')}</p>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute -top-24 -right-24 size-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      </div>
    </>
  )
}



