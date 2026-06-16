import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { SOCIAL_INSTAGRAM, COMPANY_NAME } from '../config/brand';
import { useTranslation } from 'react-i18next';

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('errorPages.maintenance.seoTitle', 'System-Wartung')}
        description={t('errorPages.maintenance.seoDesc', 'Das Spielfeld wird gerade präpariert.')}
        noindex={true}
      />
      
      <style>{`
        .glass-panel {
            background: rgba(10, 10, 10, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 107, 0, 0.15);
        }
        .bg-grid {
            background-size: 40px 40px;
            background-image: radial-gradient(circle, rgba(255, 107, 0, 0.1) 1px, transparent 1px);
        }
        .glow-orange {
            filter: drop-shadow(0 0 15px rgba(255, 107, 0, 0.5));
        }
      `}</style>

      <div className="flex-1 flex items-center justify-center relative px-4 py-16 bg-grid w-full min-h-[calc(100vh-200px)]">
        
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <span className="text-[15rem] md:text-[20rem] lg:text-[35rem] font-black text-primary/3 leading-none">W</span>
        </div>
        
        <div className="max-w-2xl w-full glass-panel rounded-2xl p-8 lg:p-12 shadow-2xl relative z-10 overflow-hidden border-white/10">
          
          <div className="absolute -top-24 -left-24 size-48 bg-primary/20 rounded-full blur-[100px]"></div>
          
          <div className="flex flex-col items-center text-center space-y-8">
            
            <div className="relative group">
              <div className="w-32 h-48 bg-primary rounded-lg shadow-xl glow-orange rotate-6 transform transition-transform group-hover:rotate-0 flex flex-col items-center justify-center border-2 border-orange-400/30 overflow-hidden">
                <div className="absolute top-0 w-full h-1/4 bg-white/10"></div>
                <span className="material-symbols-outlined text-white text-6xl font-bold">build</span>
                <div className="mt-4 text-white/40 text-[10px] uppercase font-bold tracking-widest">{t('errorPages.maintenance.titlePart1', 'Wartung').substring(0, 10)}</div>
              </div>
              
              <div className="absolute -bottom-4 -right-6 size-14 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 shadow-lg -rotate-12">
                <span className="material-symbols-outlined text-slate-300">sports</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-white text-4xl lg:text-5xl font-extrabold tracking-tight">
                        {t('errorPages.maintenance.titlePart2', 'Wartungsmodus.')}
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                        {t('errorPages.maintenance.desc', 'Wir arbeiten gerade an der Website, um dein Erlebnis zu verbessern. Bitte schau später wieder vorbei.')}
              </p>
            </div>
            
            <div className="w-full max-w-md pt-2 flex flex-col items-center gap-6">
              <p className="text-slate-300 text-base leading-relaxed">
                        Wenn Sie über die neuesten Entwicklungen informiert werden möchten, folgen Sie uns auf Instagram.
              </p>
              
              <a 
                href={SOCIAL_INSTAGRAM} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 duration-200 glow-orange"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                </svg>
                <span>FOLGEN</span>
              </a>
            </div>
            
            <Link to="/" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group mt-4">
              <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
                    {t('errorPages.serverError.backHome', 'Zurück zur Startseite')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
