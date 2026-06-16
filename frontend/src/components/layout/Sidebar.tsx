import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { AnimatePresence, motion } from 'framer-motion'
import { authService } from '../../services/authService'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const { isAuthenticated, isAdmin, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
    }
    logout()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-2xl hover:text-primary transition-colors"
        aria-label="Menü öffnen"
      >
        ☰
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-surface-light/95 backdrop-blur-lg z-50 p-6 flex flex-col"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setOpen(false)} className="text-xl text-text-muted hover:text-text">✕</button>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <SidebarLink to="/" label={`🏠 ${t('nav.home')}`} onClick={() => setOpen(false)} />
                <SidebarLink to="/reservierung" label={`📅 ${t('nav.reservation')}`} onClick={() => setOpen(false)} />
                <SidebarLink to="/reservierung/verwalten" label={`🔄 ${t('nav.manage')}`} onClick={() => setOpen(false)} />

                {isAuthenticated && !isAdmin && (
                  <SidebarLink to="/konto" label={`👤 ${t('nav.profile')}`} onClick={() => setOpen(false)} />
                )}

                {isAdmin && (
                  <>
                    <div className="border-t border-surface-lighter my-4" />
                    <SidebarLink to="/admin" label={`📊 ${t('nav.admin.dashboard')}`} onClick={() => setOpen(false)} />
                    <SidebarLink to="/admin/reservierungen" label={`📅 ${t('nav.admin.reservations')}`} onClick={() => setOpen(false)} />
                    <SidebarLink to="/admin/material" label={`📦 ${t('nav.admin.equipment')}`} onClick={() => setOpen(false)} />
                    <SidebarLink to="/admin/personal" label={`👥 ${t('nav.admin.staff')}`} onClick={() => setOpen(false)} />
                    <SidebarLink to="/admin/einstellungen" label={`⚙️ ${t('nav.admin.settings')}`} onClick={() => setOpen(false)} />
                  </>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-surface-lighter">
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 items-center justify-center w-full mb-4 mx-4" style={{ width: 'calc(100% - 2rem)' }}>
                  <button
                    onClick={() => { i18n.changeLanguage('de'); setOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${i18n.language === 'de' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white bg-transparent'}`}
                  >
                    DE
                  </button>
                  <button
                    onClick={() => { i18n.changeLanguage('tr'); setOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${i18n.language === 'tr' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white bg-transparent'}`}
                  >
                    TR
                  </button>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-danger hover:bg-surface-lighter rounded-lg transition-colors"
                  >
                    🚪 {t('nav.logout')}
                  </button>
                ) : (
                  <SidebarLink to="/login" label={`🔐 ${t('nav.login')}`} onClick={() => setOpen(false)} />
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-2.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-lighter transition-colors"
    >
      {label}
    </Link>
  )
}
