import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

export const Unauthorized: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('errorPages.unauthorized.seoTitle', '401 - Nicht angemeldet')}
        description={t('errorPages.unauthorized.seoDesc', 'Bitte loggen Sie sich ein.')}
        noindex={true}
      />
      
      <style>{`
        @keyframes shimmer {
            100% {
                transform: translateX(100%);
            }
        }
      `}</style>
      
      <div className="relative flex min-h-[calc(100vh-200px)] w-full flex-col overflow-x-hidden">
        
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-background-dark/90 via-background-dark/95 to-background-dark"></div>
          
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-30"></div>
        </div>
        
        <main className="relative flex flex-1 items-center justify-center p-6 z-10 w-full">
            <div className="relative z-10 max-w-[800px] w-full flex flex-col items-center text-center">
                
                <div className="relative mb-12 group">
                    <div className="absolute -inset-8 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative size-32 lg:size-40 rounded-full bg-surface-dark border-2 border-primary/20 flex items-center justify-center shadow-[0_0_60px_-10px_rgba(255,107,0,0.3)] group-hover:shadow-[0_0_80px_-10px_rgba(255,107,0,0.5)] transition-all duration-500">
                        
                        <div className="absolute inset-0 rounded-full bg-linear-to-tr from-primary/5 to-transparent"></div>
                        
                        <span className="material-symbols-outlined text-primary text-6xl lg:text-7xl drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]">
                            lock
                        </span>
                        
                        <div className="absolute -bottom-3 bg-background-dark border border-primary text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                            401
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6 max-w-lg mb-12">
                    <h1 className="text-white text-5xl lg:text-6xl font-black uppercase tracking-tighter drop-shadow-lg">
                        {t('errorPages.unauthorized.titlePart1', 'Stopp!')} <span className="text-primary">{t('errorPages.unauthorized.titlePart2', 'Einlasskontrolle.')}</span>
                    </h1>
                    
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
                    
                    <p className="text-slate-400 text-lg leading-relaxed font-medium">
                        {t('errorPages.unauthorized.desc', 'Bitte melden Sie sich an, um diesen Bereich zu betreten. Ein Ticket wird benötigt.')}
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    
                    <Link to="/login" className="group relative inline-flex min-w-[220px] items-center justify-center rounded-xl bg-primary hover:bg-primary/90 h-14 px-8 text-background-dark text-lg font-bold uppercase tracking-wide transition-all hover:-translate-y-1 shadow-[0_10px_20px_-5px_rgba(255,107,0,0.4)] overflow-hidden">
                        <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <span className="material-symbols-outlined mr-2 group-hover:rotate-12 transition-transform text-background-dark">login</span>
                        {t('errorPages.unauthorized.loginBtn', 'ZUM LOGIN')}
                    </Link>
                    
                    <Link to="/" className="inline-flex min-w-[220px] items-center justify-center rounded-xl border border-slate-700 bg-surface-dark/50 hover:bg-surface-dark h-14 px-8 text-slate-300 text-lg font-medium hover:text-white hover:border-slate-500 transition-all">
                        <span className="material-symbols-outlined mr-2">home</span>
                        {t('errorPages.forbidden.backHome', 'Zurück zur Startseite')}
                    </Link>
                </div>
                
                <div className="mt-20 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="h-px w-8 bg-slate-700"></div>
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        <div className="h-px w-8 bg-slate-700"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-600">
                        Error Code: 401_UNAUTHORIZED_ACCESS
                    </span>
                </div>
            </div>
        </main>
      </div>
    </>
  );
};
