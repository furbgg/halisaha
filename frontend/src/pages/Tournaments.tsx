import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Tournaments() {
  const { t } = useTranslation();
  return (
    <main className="grow flex flex-col relative overflow-hidden bg-background-dark min-h-screen">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #1f1208 1px, transparent 1px), linear-gradient(to bottom, #1f1208 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-transparent via-background-dark/50 to-background-dark pointer-events-none"></div>

      <section className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-[1200px] mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,94,0,0.8)]"></span>
          {t('tournaments.hero.season', 'Saison 2026')}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
          {t('tournaments.hero.title1', 'Kommende')} <span className="text-primary drop-shadow-[0_0_15px_rgba(255,94,0,0.5)]">{t('tournaments.hero.title2', 'Turniere')}</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          {t('tournaments.hero.desc', 'Messen Sie sich mit den besten Teams Österreichs. Melden Sie Ihr Team noch heute an und kämpfen Sie um Ruhm, Ehre und Preisgelder.')}
        </p>
      </section>

      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#0a0a0a]/70 backdrop-blur-md border border-primary/15 rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col hover:border-primary/50 shadow-lg shadow-black/50">
            <div className="h-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent z-10 opacity-90"></div>
              <img 
                alt="Salamanda Cup 2026" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://images.unsplash.com/photo-1518605368461-1e1292234955?q=80&w=2670&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1 rounded bg-primary text-white text-xs font-bold uppercase shadow-[0_0_10px_rgba(255,94,0,0.6)]">
                  {t('tournaments.badges.open', 'Anmeldung Offen')}
                </span>
              </div>
            </div>
            <div className="p-5 grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{t('tournaments.list.t1.title', 'Salamanda Cup 2026')}</h3>
              <p className="text-slate-500 text-sm mb-4">{t('tournaments.list.t1.desc', 'Der Klassiker im Herzen von Stadl-Paura.')}</p>
              
              <div className="space-y-3 mb-6 grow border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                  <span>{t('tournaments.list.t1.date', '12. Juni 2026')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  <span>{t('tournaments.details.players', { count: 5, defaultValue: '5 gegen 5' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  <span>{t('tournaments.details.price', { price: 150, defaultValue: '150€ pro Team' })}</span>
                </div>
              </div>
              
              <Link to="/turniere/anmeldung" className="w-full bg-primary hover:bg-orange-600 text-white border-none py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_0_10px_rgba(255,94,0,0.4)] hover:shadow-[0_0_20px_rgba(255,94,0,0.7)]">
                TEAM ANMELDEN
                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#0a0a0a]/70 backdrop-blur-md border border-primary/15 rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col hover:border-primary/50 shadow-lg shadow-black/50">
            <div className="h-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent z-10 opacity-90"></div>
              <img 
                alt="Salzburg Sommerliga" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://images.unsplash.com/photo-1510566337590-2fc1f21100ab?q=80&w=2670&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1 rounded bg-orange-700 text-white text-xs font-bold uppercase border border-orange-500/30 shadow-[0_0_10px_rgba(194,65,12,0.4)]">
                  {t('tournaments.badges.few', 'Wenige Plätze')}
                </span>
              </div>
            </div>
            <div className="p-5 grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{t('tournaments.list.t2.title', 'Salzburg Sommerliga')}</h3>
              <p className="text-slate-500 text-sm mb-4">{t('tournaments.list.t2.desc', 'Das größte Outdoor-Event des Jahres.')}</p>
              
              <div className="space-y-3 mb-6 grow border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                  <span>{t('tournaments.list.t2.date', '15. Juli 2026')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  <span>{t('tournaments.details.players', { count: 7, defaultValue: '7 gegen 7' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  <span>{t('tournaments.details.price', { price: 200, defaultValue: '200€ pro Team' })}</span>
                </div>
              </div>
              
              <Link to="/turniere/anmeldung" className="w-full bg-primary hover:bg-orange-600 text-white border-none py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_0_10px_rgba(255,94,0,0.4)] hover:shadow-[0_0_20px_rgba(255,94,0,0.7)]">
                TEAM ANMELDEN
                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#0a0a0a]/70 backdrop-blur-md rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col grayscale opacity-60 border border-slate-800 hover:border-slate-700">
            <div className="h-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent z-10 opacity-90"></div>
              <img 
                alt="Graz Hallencup" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=2574&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1 rounded bg-slate-700 text-slate-300 text-xs font-bold uppercase border border-slate-600">
                  {t('tournaments.badges.full', 'Ausgebucht')}
                </span>
              </div>
            </div>
            <div className="p-5 grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{t('tournaments.list.t3.title', 'Graz Hallencup')}</h3>
              <p className="text-slate-500 text-sm mb-4">{t('tournaments.list.t3.desc', 'Intensives Hallenturnier im Winter.')}</p>
              
              <div className="space-y-3 mb-6 grow border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-slate-600 text-[20px]">calendar_month</span>
                  <span>{t('tournaments.list.t3.date', '20. Feb 2026')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-slate-600 text-[20px]">groups</span>
                  <span>{t('tournaments.details.players', { count: 5, defaultValue: '5 gegen 5' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-slate-600 text-[20px]">payments</span>
                  <span>{t('tournaments.details.price', { price: 120, defaultValue: '120€ pro Team' })}</span>
                </div>
              </div>
              
              <button disabled className="w-full bg-slate-900 text-slate-500 border border-slate-800 py-3 rounded-lg font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                {t('tournaments.actions.waitlist', 'WARTELISTE')}
                <span className="material-symbols-outlined text-lg">lock</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0a0a0a]/70 backdrop-blur-md border border-primary/15 rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col hover:border-primary/50 shadow-lg shadow-black/50 md:col-span-2 lg:col-span-1 lg:max-w-md lg:mx-auto lg:mt-6">
            <div className="h-48 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent z-10 opacity-90"></div>
              <img 
                alt="Innsbruck Alpine Cup" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2629&auto=format&fit=crop"
              />
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1 rounded bg-primary text-white text-xs font-bold uppercase shadow-[0_0_10px_rgba(255,94,0,0.6)]">
                  {t('tournaments.badges.new', 'Neu')}
                </span>
              </div>
            </div>
            <div className="p-5 grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{t('tournaments.list.t4.title', 'Innsbruck Alpine Cup')}</h3>
              <p className="text-slate-500 text-sm mb-4">{t('tournaments.list.t4.desc', 'Fußball vor atemberaubender Kulisse.')}</p>
              
              <div className="space-y-3 mb-6 grow border-t border-white/5 pt-4 mt-2">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                  <span>{t('tournaments.list.t4.date', '05. Aug 2026')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  <span>{t('tournaments.details.players', { count: 6, defaultValue: '6 gegen 6' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  <span>{t('tournaments.details.price', { price: 180, defaultValue: '180€ pro Team' })}</span>
                </div>
              </div>
              
              <Link to="/turniere/anmeldung" className="w-full bg-primary hover:bg-orange-600 text-white border-none py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_0_10px_rgba(255,94,0,0.4)] hover:shadow-[0_0_20px_rgba(255,94,0,0.7)]">
                TEAM ANMELDEN
                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
          
        </div>
      </section>

      <section className="bg-[#050505] py-20 px-4 sm:px-6 lg:px-8 border-t border-orange-900/30 relative">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{
            backgroundImage: 'linear-gradient(to right, #1f1208 1px, transparent 1px), linear-gradient(to bottom, #1f1208 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-bold uppercase tracking-wider block mb-2">{t('tournaments.hallOfFame.subtitle', 'Die Besten der Besten')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t('tournaments.hallOfFame.title', 'Ruhmeshalle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 text-yellow-500 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <span className="material-symbols-outlined text-3xl">emoji_events</span>
              </div>
              <h3 className="text-white font-bold text-lg">FC Rapid</h3>
              <p className="text-slate-500 text-sm mb-2">Wien Cup</p>
              <span className="inline-block px-2 py-1 rounded bg-orange-900/40 text-orange-200 text-xs font-medium border border-orange-700/30">
                {t('tournaments.hallOfFame.winner', { year: 2025, defaultValue: '2025 Sieger' })}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 border border-slate-700">
                <span className="material-symbols-outlined text-3xl">trophy</span>
              </div>
              <h3 className="text-white font-bold text-lg">Dynamo Graz</h3>
              <p className="text-slate-500 text-sm mb-2">{t('tournaments.list.t3.title', 'Graz Hallencup')}</p>
              <span className="inline-block px-2 py-1 rounded bg-orange-900/40 text-orange-200 text-xs font-medium border border-orange-700/30">
                {t('tournaments.hallOfFame.winner', { year: 2024, defaultValue: '2024 Sieger' })}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 border border-slate-700">
                <span className="material-symbols-outlined text-3xl">trophy</span>
              </div>
              <h3 className="text-white font-bold text-lg">Kickers Salzburg</h3>
              <p className="text-slate-500 text-sm mb-2">{t('tournaments.list.t2.title', 'Salzburg Sommerliga')}</p>
              <span className="inline-block px-2 py-1 rounded bg-orange-900/40 text-orange-200 text-xs font-medium border border-orange-700/30">
                {t('tournaments.hallOfFame.winner', { year: 2024, defaultValue: '2024 Sieger' })}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 border border-slate-700">
                <span className="material-symbols-outlined text-3xl">trophy</span>
              </div>
              <h3 className="text-white font-bold text-lg">Alpine Stars</h3>
              <p className="text-slate-500 text-sm mb-2">{t('tournaments.list.t4.title', 'Innsbruck Alpine Cup')}</p>
              <span className="inline-block px-2 py-1 rounded bg-orange-900/40 text-orange-200 text-xs font-medium border border-orange-700/30">
                {t('tournaments.hallOfFame.winner', { year: 2023, defaultValue: '2023 Sieger' })}
              </span>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
