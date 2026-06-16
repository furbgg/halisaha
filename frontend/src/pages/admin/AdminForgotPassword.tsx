import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Logo } from '../../components/common/Logo'
import api from '../../services/api'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '../../types/api'
import { useTranslation, Trans } from 'react-i18next'
import { ADMIN_PORTAL_PATH } from '../../config/brand'

export function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showResendSuccessModal, setShowResendSuccessModal] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!success) {
      setSuccess(false)
    }

    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { email })
      
      if (success) {
        setShowResendSuccessModal(true)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>
      const msg = axiosErr.response?.data?.message
      
      if (axiosErr.response?.status === 429) {
        setError(t('adminAuth.forgot.errorTooMany', 'Zu viele Versuche. Bitte warten Sie 15 Minuten.'))
      } else {
        setError(msg || t('adminAuth.forgot.errorGeneric', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Passwort vergessen | SALAMANDA SOCCER ARENA</title>
        <style>
          {`
            .scale-in-center {
              animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
            }
            @keyframes scale-in-center {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
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
            <button className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-primary transition-colors">{t('adminAuth.forgot.support', 'Support')}</button>
            <Link to="/kontakt" className="px-5 py-2 text-sm font-semibold border border-primary/30 rounded-lg text-primary hover:bg-primary/10 hover:border-primary/60 transition-all shadow-[0_0_0_rgba(255,68,0,0)] hover:shadow-[0_0_10px_rgba(255,68,0,0.2)]">
              {t('adminAuth.forgot.contact', 'Kontakt')}
            </Link>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-glass rounded-xl p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-md">
            {success ? (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary/10 mb-6 border border-primary/20 box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] animate-pulse">
                    <span className="material-symbols-outlined text-4xl text-primary">mark_email_read</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-3">{t('adminAuth.forgot.successTitle', 'E-Mail gesendet!')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <Trans i18nKey="adminAuth.forgot.successDesc" values={{ email }}>
                      Wir haben einen Link zum Zurücksetzen Ihres Passworts an <span className="text-white font-medium">{email}</span> gesendet. Bitte überprüfen Sie auch Ihren Spam-Ordner.
                    </Trans>
                  </p>
                </div>

                <div className="space-y-6">
                  <Link 
                    to={ADMIN_PORTAL_PATH}
                    className="w-full bg-primary text-white font-black text-lg py-4 rounded-lg box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,68,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group border border-orange-400/20 text-center cursor-pointer"
                  >
                    <span>{t('adminAuth.forgot.backToLogin', 'ZURÜCK ZUM LOGIN')}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>
                  </Link>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:-rotate-180'}`}>refresh</span>
                    <span>{loading ? t('adminAuth.forgot.sending', 'Senden...') : t('adminAuth.forgot.resendNotReceived', 'E-Mail nicht erhalten? Erneut senden')}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6 border border-primary/20 box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)]">
                    <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-3">{t('adminAuth.forgot.title', 'Passwort vergessen?')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('adminAuth.forgot.desc', 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, um Ihr Passwort zurückzusetzen.')}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200 ml-1" htmlFor="email">{t('adminAuth.forgot.emailLabel', 'E-Mail Adresse')}</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition-colors">mail</span>
                      <input 
                        className="w-full bg-background-dark/50 border border-slate-700 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600 disabled:opacity-50" 
                        id="email" 
                        name="email" 
                        placeholder={t('adminAuth.forgot.emailPlaceholder', 'admin@soccerarena.at')} 
                        required 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button 
                    className="w-full bg-primary text-white font-black text-lg py-4 rounded-lg box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,68,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group border border-orange-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="inline-block h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('adminAuth.forgot.submit', 'LINK SENDEN')}</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                      </>
                    )}
                  </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <Link 
                    to={ADMIN_PORTAL_PATH} 
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors group p-2"
                  >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>{t('adminAuth.forgot.back', 'Zurück zum Login')}</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
            <button className="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{t('adminAuth.forgot.techSupport', 'Technischer Support')}</button>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{t('adminAuth.forgot.copyright', '© 2026 Randevu Halı Saha')}</p>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute -top-24 -right-24 size-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      </div>

      {showResendSuccessModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all duration-300">
          <div className="bg-glass rounded-xl relative w-full max-w-sm p-8 shadow-2xl border border-primary/30 flex flex-col items-center text-center scale-in-center">
            <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,68,0,0.4)] animate-bounce">
              <span className="material-symbols-outlined text-4xl text-primary font-bold">check_circle</span>
            </div>
            
            <h3 className="text-2xl font-black text-white tracking-tight mb-4">{t('adminAuth.forgot.resendTitle', 'Link erneut gesendet!')}</h3>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              {t('adminAuth.forgot.resendDesc', 'Wir haben einen neuen Link zum Zurücksetzen Ihres Passworts an Ihre E-Mail-Adresse gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.')}
            </p>
            
            <button 
              onClick={() => setShowResendSuccessModal(false)}
              className="w-full bg-primary text-white font-black py-4 rounded-lg box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-wider"
            >
              {t('adminAuth.forgot.resendOk', 'VERSTANDEN')}
            </button>
            
            <div className="absolute inset-0 -z-10 bg-primary/5 rounded-2xl blur-xl pointer-events-none"></div>
          </div>
        </div>
      )}
    </>
  )
}



