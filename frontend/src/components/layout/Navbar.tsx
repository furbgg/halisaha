import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Logo } from '../common/Logo';
import { COMPANY_NAME } from '../../config/brand';

interface NavbarProps {
  showLinks?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ showLinks = true }) => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  const isHome = location.pathname === '/';
  const isBooking = location.pathname.startsWith('/reservierung') && !location.pathname.startsWith('/reservierung/verwalten');
  const isManage = location.pathname.startsWith('/reservierung/verwalten');
  const isTournaments = location.pathname.startsWith('/turniere');

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Logo variant="small" withLink />

        {showLinks && (
          <nav aria-label="Hauptnavigation" className="hidden md:flex items-center gap-8">
            <Link to="/" aria-current={isHome ? "page" : undefined} className={isHome ? "text-primary font-semibold text-sm transition-colors" : "text-slate-300 text-sm font-medium transition-colors hover:text-white"}>
              {t('nav.home', 'Startseite')}
            </Link>
            <Link to="/reservierung" aria-current={isBooking ? "page" : undefined} className={isBooking ? "text-primary font-semibold text-sm transition-colors" : "text-slate-300 text-sm font-medium transition-colors hover:text-white"}>
              {t('nav.bookNow', 'Jetzt Buchen')}
            </Link>
            <Link to="/turniere" aria-current={isTournaments ? "page" : undefined} className={isTournaments ? "text-primary font-semibold text-sm transition-colors" : "text-slate-300 text-sm font-medium transition-colors hover:text-white"}>
              {t('nav.tournaments', 'Turniere')}
            </Link>
            <Link to="/reservierung/verwalten" aria-current={isManage ? "page" : undefined} className={isManage ? "text-primary font-semibold text-sm transition-colors" : "text-slate-300 text-sm font-medium transition-colors hover:text-white"}>
              {t('nav.manageBooking', 'Buchung Verwalten')}
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          
          <div role="group" aria-label="Sprachauswahl" className="hidden lg:flex bg-white/5 border border-white/10 rounded-full p-1 mx-2 items-center">
            {['de', 'tr', 'en', 'bs', 'sq'].map(lang => (
              <button
                key={lang}
                title={lang.toUpperCase()}
                aria-label={`Sprache: ${lang.toUpperCase()}`}
                aria-pressed={i18n.language === lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`px-2 py-1 rounded-full text-xs font-bold transition-all uppercase ${i18n.language === lang ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,140,0,0.5)]' : 'text-slate-400 hover:text-white bg-transparent'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {showLinks && (
            <Link
              to="/reservierung"
              className="hidden md:flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,68,0,0.3)]"
            >
              <span className="material-symbols-outlined mr-1 text-lg">calendar_month</span>
              {t('nav.bookNow', 'Jetzt Buchen')}
            </Link>
          )}

          {showLinks && (
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
        </div>
        </div>
      </header>

      {showLinks && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobilmenü"
          className={`fixed inset-0 z-100 bg-[#050505] transition-transform duration-300 ease-in-out flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt={`${COMPANY_NAME} Logo`} className="h-12 w-12 object-contain" />
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-tight tracking-tight uppercase">{COMPANY_NAME.split(' ')[0]}</span>
                {COMPANY_NAME.split(' ').length > 1 && (
                  <span className="text-[10px] font-black text-primary tracking-widest uppercase">{COMPANY_NAME.split(' ').slice(1).join(' ')}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Menü schließen"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-dark border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div role="group" aria-label="Sprachauswahl" className="flex mb-6 bg-white/5 border border-white/10 rounded-xl p-1 items-center justify-center w-full flex-wrap gap-1">
              {[
                { code: 'de', label: 'DE' },
                { code: 'tr', label: 'TR' },
                { code: 'en', label: 'EN' },
                { code: 'bs', label: 'BS' },
                { code: 'sq', label: 'SQ' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  aria-label={`Sprache: ${lang.label}`}
                  aria-pressed={i18n.language === lang.code}
                  className={`flex-1 min-w-[45px] py-1.5 rounded-lg text-sm font-bold transition-all ${i18n.language === lang.code ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white bg-transparent'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {[
              { path: '/', label: t('nav.home', 'Startseite'), icon: 'home', isActive: isHome },
              { path: '/reservierung', label: t('nav.bookNow', 'Jetzt Buchen'), icon: 'calendar_month', isActive: isBooking },
              { path: '/turniere', label: t('nav.tournaments', 'Turniere'), icon: 'emoji_events', isActive: isTournaments },
              { path: '/reservierung/verwalten', label: t('nav.manageBooking', 'Buchung Verwalten'), icon: 'receipt_long', isActive: isManage },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                aria-current={item.isActive ? "page" : undefined}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  item.isActive 
                    ? 'bg-primary/5 border-primary/20 text-white shadow-[inset_0_0_20px_rgba(255,140,0,0.05)]' 
                    : 'bg-transparent border-transparent text-slate-300 hover:bg-surface-dark hover:border-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${item.isActive ? 'text-primary' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold">{item.label}</span>
                </div>
                {item.isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,140,0,0.8)]"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-surface-dark/50 mt-auto">
            <div className="flex gap-4 mb-6">
              <a href="https://www.instagram.com/salamanda.soccerarena" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-dark border border-white/5 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">photo_camera</span>
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">{t('nav.designedFor', 'Designed For')}</p>
              <p className="text-xs font-bold text-white">{COMPANY_NAME} © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
