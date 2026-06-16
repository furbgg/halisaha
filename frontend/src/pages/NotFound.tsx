import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';
import { COMPANY_NAME } from '../config/brand';

export const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('errorPages.notFound.seoTitle', '404 - Seite nicht gefunden')}
        description={t('errorPages.notFound.seoDesc', { company: COMPANY_NAME, defaultValue: `Hoppla! Diese Seite existiert leider nicht. Kehren Sie zur Startseite von ${COMPANY_NAME} zurück.` })}
        noindex={true}
      />
      
      <style>{`
        .pitch-grid {
            background-image: radial-gradient(circle at 2px 2px, rgba(249, 115, 22, 0.05) 1px, transparent 0);
            background-size: 40px 40px;
        }
        .glass-panel {
            background: rgba(26, 22, 20, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(249, 115, 22, 0.1);
        }
        .neon-glow {
            text-shadow: 0 0 10px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3);
        }
      `}</style>

      {/* 
        This div replaces the raw <main> tag from the HTML. 
        It flex-grows to take up whatever space Layout.tsx gives it, centering the card.
      */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative pitch-grid w-full py-16">
        
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20">
            <div className="absolute inset-0 bg-linear-to-t from-background-dark via-transparent to-transparent"></div>
            <img 
              alt="Stadium Background" 
              className="w-full h-full object-cover opacity-40 grayscale" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOnpQvYC_ABMKtphEb00OvUYGf_DdkxjWh_KLfB1s0tu-Hm1uM7_quWH3Vk5Z-DTujm50TUwMLV_AZUDpWwmv--3aeX359Tut2_5-vmE_HnPFf_bQRYypJScY1rx1HD6quepebFT5pNKltgV1VFjJcdJQlSu-Jx_KW8GSEX2VrHspKROZZWQGhCGTeIXvRMxtU_knOOkYHntSO9tNSdpBr_YMS4s16i_BVGzYdPZBAY9MkXFz0bIULyXEE1jlTHh3UO_at-Km9M9hV"
            />
          </div>
        </div>

        <div className="z-10 w-full max-w-2xl glass-panel rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-white/10">
          <div className="relative inline-block mb-6">
            <h1 className="text-9xl md:text-[12rem] font-black text-primary/20 neon-glow leading-none select-none tracking-tighter">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-6xl md:text-8xl" style={{ filter: 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.8))' }}>sports_soccer</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white italic">
              {t('errorPages.notFound.titlePart1', 'Hoppla!')} <span className="text-primary">{t('errorPages.notFound.titlePart2', 'Abseits.')}</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
              {t('errorPages.notFound.desc', 'Diese Seite existiert leider nicht oder wurde verschoben. Vielleicht ist der Ball ins Aus gerollt?')}
            </p>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Link 
              to="/"
              className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-background-dark transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full md:w-auto"
            >
              <span className="material-symbols-outlined mr-2">home</span>
              {t('errorPages.notFound.backHome', 'ZURÜCK ZUR STARTSEITE')}
            </Link>
            
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <Link to="/reservierung" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium">
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                {t('errorPages.notFound.bookNow', 'JETZT BUCHEN')}
              </Link>
              <div className="w-1 h-1 rounded-full bg-slate-700 self-center hidden md:block"></div>
              <Link to="/kontakt" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium">
                <span className="material-symbols-outlined text-lg">mail</span>
                {t('errorPages.notFound.contact', 'KONTAKT')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent blur-[2px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-primary opacity-50"></div>
      </div>
    </>
  );
};
