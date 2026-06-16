import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

export const Forbidden: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('errorPages.forbidden.seoTitle', '403 - Kein Zugriff')}
        description={t('errorPages.forbidden.seoDesc', 'Zugriff verweigert.')}
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
        .glow-red {
            filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.5));
        }
      `}</style>

      <div className="flex-1 flex items-center justify-center relative px-4 py-16 bg-grid w-full min-h-[calc(100vh-200px)]">
        
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <span className="text-[15rem] md:text-[20rem] lg:text-[35rem] font-black text-primary/3 leading-none">403</span>
        </div>
        
        <div className="max-w-2xl w-full glass-panel rounded-2xl p-8 lg:p-12 shadow-2xl relative z-10 overflow-hidden border-white/10">
          
          <div className="absolute -top-24 -left-24 size-48 bg-primary/20 rounded-full blur-[100px]"></div>
          
          <div className="flex flex-col items-center text-center space-y-8">
            
            <div className="relative group">
              <div className="w-32 h-48 bg-red-600 rounded-lg shadow-xl glow-red rotate-6 transform transition-transform group-hover:rotate-0 flex flex-col items-center justify-center border-2 border-red-400/30 overflow-hidden">
                <div className="absolute top-0 w-full h-1/4 bg-white/10"></div>
                <span className="material-symbols-outlined text-white text-6xl font-bold">block</span>
                <div className="mt-4 text-white/40 text-[10px] uppercase font-bold tracking-widest">Forbidden</div>
              </div>
              
              <div className="absolute -bottom-4 -right-6 size-14 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 shadow-lg -rotate-12">
                <span className="material-symbols-outlined text-slate-300">sports</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-white text-4xl lg:text-5xl font-extrabold tracking-tight">
                {t('errorPages.forbidden.titlePart1', 'Halt!')} {t('errorPages.forbidden.titlePart2', 'Rote Karte.')}
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                {t('errorPages.forbidden.desc', 'Sie haben keine ausreichende Berechtigung, um diesen Bereich zu betreten. Bitte kehren Sie zur Startseite zurück.')}
              </p>
            </div>
            
            <Link to="/" className="h-14 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4">
              <span className="material-symbols-outlined text-xl">home</span>
              <span>{t('errorPages.forbidden.backHome', 'Zurück zur Startseite')}</span>
            </Link>
            
          </div>
        </div>
      </div>
    </>
  );
};
