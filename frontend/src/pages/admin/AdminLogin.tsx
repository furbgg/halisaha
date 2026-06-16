import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { ADMIN_PORTAL_PATH, pageTitle } from '../../config/brand'
import { Logo } from '../../components/common/Logo'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '../../types/api'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showTotpInput, setShowTotpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { t } = useTranslation()

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('adminRememberEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRemember(true)
    }
  }, [])

  const handleTotpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      setTotpCode(pasted);
      if (pasted.length === 6 && inputRefs.current[5]) {
         inputRefs.current[5]?.focus();
      } else if (pasted.length > 0 && inputRefs.current[pasted.length - 1]) {
         inputRefs.current[pasted.length - 1]?.focus();
      }
      return;
    }

    const newCode = totpCode.split('');
    newCode[index] = value;
    setTotpCode(newCode.join(''));
    setError('');

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = totpCode.split('');
      newCode[index - 1] = '';
      setTotpCode(newCode.join(''));
    }
  };

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
        setError(t('adminLogin.error.desc', 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'))
        setLoading(false)
        return
      }

      if (remember) {
        localStorage.setItem('adminRememberEmail', email)
      } else {
        localStorage.removeItem('adminRememberEmail')
      }

      login(data.accessToken, {
        displayId: data.displayId,
        name: data.name,
        email: data.email,
        role: data.role,
      })

      navigate(`${ADMIN_PORTAL_PATH}/erfolgreich`, { replace: true })
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>
      const msg = axiosErr.response?.data?.message
      if (axiosErr.response?.status === 429) {
        setError(t('adminLogin.error.tooMany', 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.'))
      } else if (axiosErr.response?.status === 401) {
        setError(msg || t('adminLogin.error.invalid', 'Ungültige Anmeldedaten.'))
      } else {
        setError(msg || t('adminLogin.error.desc', 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle('Admin Login')}</title>
        <style>
          {`
            .error-glass {
              background: rgba(239, 68, 68, 0.15);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            .animate-shake {
              animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
              10%, 90% { transform: translate3d(-1px, 0, 0); }
              20%, 80% { transform: translate3d(2px, 0, 0); }
              30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
              40%, 60% { transform: translate3d(4px, 0, 0); }
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
            <Link to="/" className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-primary transition-colors">{t('adminLogin.nav.home', 'Startseite')}</Link>
            <Link to="/kontakt" className="px-5 py-2 text-sm font-semibold border border-primary/30 rounded-lg text-primary hover:bg-primary/10 hover:border-primary/60 transition-all shadow-[0_0_0_rgba(255,68,0,0)] hover:shadow-[0_0_10px_rgba(255,68,0,0.2)]">
              {t('adminLogin.nav.contact', 'Kontakt')}
            </Link>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-md px-6">
          {!showTotpInput ? (
            <div className="bg-glass rounded-xl p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-md">
              <div className={`mb-10 text-center ${error ? 'animate-shake' : ''}`}>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">
                    {t('adminLogin.status', 'System-Status: Online')}
                  </span>
                </div>
                
                {error ? (
                  <>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">{t('adminLogin.error.title', 'Login Fehlgeschlagen')}</h2>
                    <p className="text-slate-400 text-xs">{t('adminLogin.error.desc', 'Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.')}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">{t('adminLogin.welcome.title', 'Admin-Bereich')}</h2>
                    <p className="text-slate-400 text-xs">
                      <Trans i18nKey="adminLogin.welcome.desc" components={{ br: <br /> }}>
                        Willkommen zurück! Bitte loggen Sie sich ein,<br/> um Ihre Sportanlage zu verwalten.
                      </Trans>
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="mb-8 error-glass rounded-lg p-4 flex items-start gap-3 animate-shake">
                  <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">error</span>
                  <div>
                    <h3 className="text-red-400 font-bold text-sm">{t('adminLogin.error.invalid', 'Ungültige Anmeldedaten')}</h3>
                    <p className="text-red-200/80 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ml-1 ${error ? 'text-red-400' : 'text-slate-200'}`} htmlFor="email">{t('adminLogin.form.email', 'E-Mail Adresse')}</label>
                  <div className="relative group">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${error ? 'text-red-500 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-primary'}`}>mail</span>
                    <input
                      className={`w-full bg-background-dark/50 rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${error ? 'border border-red-500/50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border border-slate-700 focus:ring-primary/50 focus:border-primary'}`}
                      id="email"
                      name="email"
                      placeholder={t('adminLogin.form.emailPlaceholder', 'admin@example.com')}
                      required
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className={`text-xs font-bold ${error ? 'text-red-400' : 'text-slate-200'}`} htmlFor="password">{t('adminLogin.form.password', 'Passwort')}</label>
                  </div>
                  <div className="relative group">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${error ? 'text-red-500 group-focus-within:text-red-400' : 'text-slate-500 group-focus-within:text-primary'}`}>lock</span>
                    <input
                      className={`w-full bg-background-dark/50 rounded-lg py-3 pl-12 pr-12 text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${error ? 'border border-red-500/50 focus:ring-red-500/20 focus:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border border-slate-700 focus:ring-primary/50 focus:border-primary'}`}
                      id="password"
                      name="password"
                      placeholder={t('adminLogin.form.passwordPlaceholder', '••••••••')}
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      disabled={loading}
                    />
                    <button
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500 hover:text-red-400' : 'text-slate-500 hover:text-primary'}`}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <input
                      className="rounded border-slate-700 bg-background-dark/50 text-primary focus:ring-primary/50 cursor-pointer"
                      id="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label className="text-xs font-medium text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors" htmlFor="remember">{t('adminLogin.form.remember', 'Angemeldet bleiben')}</label>
                  </div>
                  <Link to={`${ADMIN_PORTAL_PATH}/passwort-vergessen`} className="text-xs font-bold text-primary hover:text-orange-400 transition-colors">
                    {t('adminLogin.form.forgot', 'Passwort vergessen?')}
                  </Link>
                </div>

                <button
                  className="w-full bg-primary text-white font-black text-base py-3 rounded-lg box-glow shadow-[0_0_15px_rgba(255,68,0,0.5)] hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,68,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group border border-orange-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('adminLogin.form.submit', 'Anmelden')}</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">login</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                  <Trans i18nKey="adminLogin.footer" components={{ br: <br /> }}>
                    Management-Portal für professionelle<br/> Sportanlagen &amp; Reservierungssysteme
                  </Trans>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={`flex flex-col items-center mt-4 mb-8 ${error ? 'animate-shake' : ''}`}>
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-4xl">shield_lock</span>
                </div>
                <h1 className="text-white text-2xl font-bold tracking-tight">Admin Login</h1>
                <p className="text-primary/70 text-sm font-medium uppercase tracking-widest mt-1">{t('adminLogin.mfa.tag', 'Sicherheits-Check')}</p>
              </div>

              <div className="bg-glass rounded-xl p-8 flex flex-col items-center shadow-2xl border border-white/10 backdrop-blur-md">
                <h2 className="text-white text-xl font-semibold mb-2 text-center">{t('adminLogin.mfa.title', 'Zwei-Faktor-Authentifizierung')}</h2>
                <p className="text-slate-300 text-sm text-center mb-8 leading-relaxed">
                  {t('adminLogin.mfa.desc', 'Bitte geben Sie den Code aus Ihrer Google Authenticator App ein.')}
                </p>

                {error && (
                  <div className="mb-6 w-full error-glass rounded-lg p-3 text-red-400 text-sm text-center animate-shake">
                    {error}
                  </div>
                )}

                <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
                  <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-center">
                    {[0, 1, 2].map(i => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        className={`w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-b-2 text-primary transition-all rounded-t-lg focus:ring-0 shadow-none outline-none ${error ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-primary/30 focus:border-primary bg-white/5'}`}
                        maxLength={1}
                        placeholder="0"
                        type="text"
                        inputMode="numeric"
                        value={totpCode[i] || ''}
                        onChange={e => handleTotpChange(i, e.target.value)}
                        onKeyDown={e => handleTotpKeyDown(i, e)}
                        disabled={loading}
                      />
                    ))}
                    <span className="flex items-center text-primary/40 text-xl font-bold">-</span>
                    {[3, 4, 5].map(i => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        className={`w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-b-2 text-primary transition-all rounded-t-lg focus:ring-0 shadow-none outline-none ${error ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-primary/30 focus:border-primary bg-white/5'}`}
                        maxLength={1}
                        placeholder="0"
                        type="text"
                        inputMode="numeric"
                        value={totpCode[i] || ''}
                        onChange={e => handleTotpChange(i, e.target.value)}
                        onKeyDown={e => handleTotpKeyDown(i, e)}
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    className="w-full h-14 bg-primary text-slate-100 font-bold text-lg rounded-lg shadow-[0_0_15px_rgba(255,68,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6 disabled:opacity-50"
                    type="submit"
                    disabled={loading || totpCode.length !== 6}
                  >
                    {loading ? (
                      <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t('adminLogin.mfa.submit', 'Verifizieren')}</span>
                        <span className="material-symbols-outlined font-bold">verified_user</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-col gap-3 items-center w-full">
                    <button 
                      type="button"
                      className="text-primary/60 hover:text-primary text-xs font-medium transition-colors uppercase tracking-wider"
                      onClick={() => { setShowTotpInput(false); setTotpCode(''); setError('') }}
                    >
                      {t('adminLogin.mfa.issues', 'Probleme beim Login?')}
                    </button>
                    <button 
                      type="button"
                      className="text-slate-500 hover:text-slate-200 text-xs transition-colors flex items-center gap-1"
                      onClick={() => { setShowTotpInput(false); setTotpCode(''); setError('') }}
                    >
                      <span className="material-symbols-outlined text-sm">key</span>
                      {t('adminLogin.mfa.backup', 'Backup-Code verwenden')}
                    </button>
                  </div>
                </form>
              </div>

              <footer className="mt-8 text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-medium">
                  {t('adminLogin.mfa.check', 'Sicherheits-Check für Admin-Bereich • SSL Verschlüsselt')}
                </p>
              </footer>
            </>
          )}

          <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
            <button className="text-slate-400 text-sm font-medium hover:text-primary transition-colors">{t('adminLogin.support', 'Technischer Support')}</button>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{t('adminLogin.copyright', '© 2026 Randevu Halı Saha')}</p>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute -top-24 -right-24 size-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      </div>
    </>
  )
}
