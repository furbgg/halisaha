import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpotlightCard } from '../animations/SpotlightCard';
import { Magnetic } from '../animations/Magnetic';

const fadeInVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="relative w-full bg-background-dark py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInVariant}
          className="mb-16 text-center"
        >
          <h2 className="text-primary font-bold tracking-wider uppercase mb-2">{t('home.features.subtitle')}</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{t('home.features.title')}</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariant}
          >
            <SpotlightCard className="group relative overflow-hidden rounded-xl border border-white/10 bg-glass p-1 backdrop-blur-md transition-all duration-300 box-glow flex flex-col h-full">
              <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-[url('/bubblesoccer.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                aria-label="People playing bubble soccer in inflatable transparent spheres on a green field"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="inline-block rounded bg-primary px-2 py-1 text-xs font-bold text-black mb-2">{t('home.features.bubble.badge')}</span>
                <h4 className="text-2xl font-bold text-white">{t('home.features.bubble.title')}</h4>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <p className="text-slate-300 mb-6">
                  {t('home.features.bubble.description').split('<br/>').map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                  ))}
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center text-sm text-slate-400">
                    <span className="material-symbols-outlined text-primary text-lg mr-2">check_circle</span>
                    {t('home.features.bubble.feature1')}
                  </li>
                  <li className="flex items-center text-sm text-slate-400">
                    <span className="material-symbols-outlined text-primary text-lg mr-2">check_circle</span>
                    {t('home.features.bubble.feature2')}
                  </li>
                </ul>
              </div>
              <Magnetic strength={0.2}>
                <Link to="/reservierung?type=bubble" className="w-full py-3 rounded-lg border border-primary/50 text-primary font-bold uppercase text-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                  {t('home.features.bubble.button')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </Magnetic>
            </div>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariant}
            transition={{ delay: 0.2 }}
          >
            <SpotlightCard className="group relative overflow-hidden rounded-xl border border-white/10 bg-glass p-1 backdrop-blur-md transition-all duration-300 box-glow flex flex-col h-full">
              <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-[url('/soccer.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                aria-label="Professional green artificial turf football field under bright stadium lights"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="inline-block rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white mb-2">{t('home.features.soccer.badge')}</span>
                <h4 className="text-2xl font-bold text-white">{t('home.features.soccer.title')}</h4>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <p className="text-slate-300 mb-6">
                  {t('home.features.soccer.description').split('<br/>').map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                  ))}
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center text-sm text-slate-400">
                    <span className="material-symbols-outlined text-primary text-lg mr-2">check_circle</span>
                    {t('home.features.soccer.feature1')}
                  </li>
                  <li className="flex items-center text-sm text-slate-400">
                    <span className="material-symbols-outlined text-primary text-lg mr-2">check_circle</span>
                    {t('home.features.soccer.feature2')}
                  </li>
                </ul>
              </div>
              <Magnetic strength={0.2}>
                <Link to="/reservierung?type=field" className="w-full py-3 rounded-lg border border-primary/50 text-primary font-bold uppercase text-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                  {t('home.features.soccer.button')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </Magnetic>
            </div>
            </SpotlightCard>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
