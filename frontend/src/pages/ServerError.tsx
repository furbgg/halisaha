import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

export const ServerError: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('errorPages.serverError.seoTitle', '500 - Server Error')}
        description={t('errorPages.serverError.seoDesc', 'Ein unerwarteter Fehler ist aufgetreten.')}
        noindex={true}
      />
      
      <style>{`
        .glow-effect {
            box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
        }
        .stadium-gradient {
            background: radial-gradient(circle at center, #1a1614 0%, #050505 100%);
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 stadium-gradient relative overflow-hidden w-full min-h-[calc(100vh-200px)]">
        
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary rounded-full"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-primary bg-linear-to-b from-transparent via-primary to-transparent"></div>
        </div>

        <div className="max-w-2xl w-full text-center z-10">
          
          <div className="mb-8 relative inline-block">
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 relative group">
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 bg-primary w-32 h-48 rounded-lg shadow-[0_0_40px_rgba(255,107,0,0.4)] flex items-center justify-center border-2 border-orange-400/30 transition-transform hover:scale-105 duration-300">
                <span className="material-symbols-outlined text-background-dark text-6xl font-bold">priority_high</span>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-background-dark p-4 rounded-xl border border-primary/30 shadow-lg">
                <span className="material-symbols-outlined text-primary text-4xl">sports_soccer</span>
              </div>
            </div>
            
            <div className="absolute -top-4 -left-4 font-black text-6xl md:text-8xl text-primary/10 select-none italic pointer-events-none">500</div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tighter uppercase italic">
                {t('errorPages.serverError.titlePart1', 'Uff!')} <span className="text-primary">{t('errorPages.serverError.titlePart2', 'Foulspiel im Code.')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                {t('errorPages.serverError.desc', 'Unser Server hat einen überraschenden Treffer abbekommen. Unser Technik-Team ist bereits auf dem Spielfeld. Bitte versuchen Sie es später noch einmal.')}
            </p>
            
            <div className="pt-8">
              <Link to="/" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-all transform hover:scale-105 glow-effect">
                <span className="material-symbols-outlined">home</span>
                    {t('errorPages.serverError.backHome', 'ZURÜCK ZUR STARTSEITE')}
              </Link>
            </div>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Status</span>
              <span className="text-sm font-mono text-slate-300">VAR Review (500)</span>
            </div>
            
            <div className="w-px h-8 bg-primary/20"></div>
            
            <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Match ID</span>
              <span className="text-sm font-mono text-slate-300">#992-ERR</span>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};
