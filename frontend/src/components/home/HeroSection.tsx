import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Magnetic } from '../animations/Magnetic';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section 
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-black"
      aria-label="Dark dramatic football stadium video background"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      >
        <source src="/file.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-neon-glow pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 px-4 text-center max-w-4xl mx-auto flex flex-col items-center gap-6"
      >
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm mb-2">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          {t('home.hero.badge')}
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl md:text-8xl leading-[0.9] text-glow">
          {t('home.hero.title1')}<br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400">{t('home.hero.title2')}</span>
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-300 sm:text-lg font-light">
          {t('home.hero.subtitle').split('<br/>').map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Magnetic strength={0.3}>
            <Link
              to="/reservierung"
              className="h-14 min-w-[200px] rounded-full bg-primary px-8 text-base font-bold text-white transition-all hover:bg-[#e63d00] hover:shadow-[0_0_25px_rgba(255,68,0,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">sports_soccer</span>
              {t('home.hero.bookNow')}
            </Link>
          </Magnetic>
          <Magnetic strength={0.3}>
            <Link
              to="/reservierung/verwalten"
              className="h-14 min-w-[200px] rounded-full border border-white/20 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">edit_calendar</span>
              {t('home.hero.manageBooking')}
            </Link>
          </Magnetic>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">2</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{t('home.hero.stats.courts')}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">5k+</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{t('home.hero.stats.players')}</span>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">4.9</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{t('home.hero.stats.rating')}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
