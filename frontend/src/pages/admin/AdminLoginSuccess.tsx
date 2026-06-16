import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ADMIN_PORTAL_PATH, pageTitle } from '../../config/brand'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from 'react-i18next'

export function AdminLoginSuccess() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`${ADMIN_PORTAL_PATH}/dashboard`, { replace: true })
    }, 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <>
      <Helmet>
        <title>{pageTitle(t('adminAuth.success.title', 'Login Erfolgreich'))}</title>
        <style>
          {`
            .glass-card-success {
              background: rgba(15, 15, 15, 0.85);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 68, 0, 0.15);
              box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
            }
            .text-glow-orange {
              text-shadow: 0 0 15px rgba(255, 68, 0, 0.6);
            }
            .icon-glow-orange {
              filter: drop-shadow(0 0 8px rgba(255, 68, 0, 0.5));
            }
            .bg-deep-black {
              background-color: #050505;
              background-image: 
                radial-gradient(circle at 50% 0%, rgba(255, 68, 0, 0.08) 0%, transparent 60%),
                linear-gradient(180deg, rgba(255, 68, 0, 0.03) 0%, transparent 20%);
            }
            .shadow-glow-button {
              box-shadow: 0 0 15px rgba(255, 68, 0, 0.4);
            }
          `}
        </style>
      </Helmet>

      <div className="font-display text-slate-100 min-h-screen flex flex-col overflow-x-hidden bg-deep-black">
        <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(255,85,0,0.15)]">
              <span className="material-symbols-outlined text-primary text-xl font-bold">shield_person</span>
            </div>
            <h2 className="text-slate-100 text-lg font-bold tracking-tight">{t('adminAuth.success.portal', 'Admin Portal')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-primary font-medium tracking-wide">{t('adminAuth.success.loggedInAs', 'Eingeloggt als')}</span>
              <span className="text-sm text-slate-300">{user?.name || t('adminAuth.success.admin', 'Administrator')}</span>
            </div>
            <div className="relative size-10 rounded-full border border-primary/30 overflow-hidden shadow-[0_0_10px_rgba(255,85,0,0.1)]">
              <img 
                className="w-full h-full object-cover" 
                alt="Profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeHUx9RNyto8G2y5kaGftTgKuTGXVs3gnOvr5aHJwhU3dJGna6fJV7K02Xprr9TdCkFYilBvtBYN8vCJVQN9sGE9IQuEUPcni3VObLob4Kgdgj9Se3rctROCaOOibL3fYV1pscUkfUkogx8xlb6mw5Id98GMWU1r8AzNvRx4_p8u5G_ZQ74z6fRCGiaq3i7i3vYEaEvt-Wikq7igy6BoHgnSEVuwl3a2i6QiJ97FZ6jo0RpB748Q7ViozORaBN-HtxitztACBxNpG3"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 relative">
          <div className="glass-card-success w-full max-w-lg rounded-2xl p-8 md:p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150"></div>
              <div className="relative size-24 md:size-32 rounded-full border border-primary/30 flex items-center justify-center bg-black/40 shadow-[0_0_30px_rgba(255,85,0,0.15)] icon-glow-orange">
                <span className="material-symbols-outlined text-primary text-6xl md:text-7xl">check_circle</span>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight text-glow-orange">{t('adminAuth.success.title', 'Login Erfolgreich!')}</h1>
              <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
                {t('adminAuth.success.desc', 'Willkommen zurück im Administrationsbereich. Ihre Sitzung wurde sicher initialisiert.')}
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3 relative z-10">
              <p className="text-slate-500 text-xs mt-2">{t('adminAuth.success.redirecting', 'Sie werden in Kürze automatisch zum Dashboard weitergeleitet...')}</p>
            </div>

            <div className="flex flex-col w-full gap-4 pt-4 relative z-10">
              <button 
                onClick={() => navigate(`${ADMIN_PORTAL_PATH}/dashboard`, { replace: true })}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 shadow-glow-button hover:shadow-[0_0_25px_rgba(255,85,0,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
              >
                <span>{t('adminAuth.success.btn', 'Zum Dashboard weiterleiten')}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-bold">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="absolute top-1/4 left-10 size-80 bg-primary/5 blur-[150px] rounded-full -z-10 opacity-60"></div>
          <div className="absolute bottom-1/4 right-10 size-80 bg-primary/5 blur-[150px] rounded-full -z-10 opacity-60"></div>
        </main>

        <footer className="p-6 text-center border-t border-white/5 bg-black/20 mt-auto">
          <div className="flex justify-center items-center gap-6 text-slate-500 text-sm mb-4">
            <span className="hover:text-primary transition-colors cursor-pointer">{t('adminAuth.success.help', 'Hilfe-Center')}</span>
            <span className="size-1 bg-slate-800 rounded-full"></span>
            <span className="hover:text-primary transition-colors cursor-pointer">{t('adminAuth.success.security', 'Sicherheitsprotokoll')}</span>
            <span className="size-1 bg-slate-800 rounded-full"></span>
            <span className="hover:text-primary transition-colors cursor-pointer">{t('adminAuth.success.status', 'Systemstatus')}</span>
          </div>
          <p className="text-slate-700 text-[10px] uppercase tracking-widest font-medium">{t('adminAuth.success.footer', '© 2026 Admin Portal — Secure Environment')}</p>
        </footer>
      </div>
    </>
  )
}
