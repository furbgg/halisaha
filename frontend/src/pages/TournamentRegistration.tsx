import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function TournamentRegistration() {
  const { t } = useTranslation();
  return (
    <main className="relative z-10 grow px-4 py-8 lg:px-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 94, 0, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 94, 0, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-6">
          <Link to="/turniere" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('tournamentRegistration.back', 'Zurück zu Turnieren')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-[#1a1816]/65 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">groups</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{t('tournamentRegistration.teamInfo.title', 'Team-Informationen')}</h2>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('tournamentRegistration.teamInfo.nameLabel', 'Teamname')}</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_10px_rgba(255,94,0,0.3)] transition-all outline-none" 
                      placeholder={t('tournamentRegistration.teamInfo.namePlaceholder', 'z.B. Die Wilden Kerle')} 
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">badge</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('tournamentRegistration.teamInfo.colorLabel', 'Trikotfarbe')}</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer">
                        <option disabled selected value="">{t('tournamentRegistration.teamInfo.colorSelect', 'Farbe wählen')}</option>
                        <option value="red">{t('tournamentRegistration.teamInfo.colors.red', 'Rot')}</option>
                        <option value="blue">{t('tournamentRegistration.teamInfo.colors.blue', 'Blau')}</option>
                        <option value="green">{t('tournamentRegistration.teamInfo.colors.green', 'Grün')}</option>
                        <option value="black">{t('tournamentRegistration.teamInfo.colors.black', 'Schwarz')}</option>
                        <option value="white">{t('tournamentRegistration.teamInfo.colors.white', 'Weiß')}</option>
                        <option value="neon">{t('tournamentRegistration.teamInfo.colors.neon', 'Neon Gelb')}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-500 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('tournamentRegistration.teamInfo.captainLabel', 'Teamkapitän Name')}</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                        placeholder={t('tournamentRegistration.teamInfo.captainPlaceholder', 'Max Mustermann')} 
                        type="text"
                      />
                      <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-500">person</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('tournamentRegistration.teamInfo.phoneLabel', 'Telefonnummer')}</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border-r border-white/10">
                      <span className="text-slate-400 text-sm font-medium">+43</span>
                    </div>
                    <input 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-16 pr-4 py-3.5 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                      placeholder={t('tournamentRegistration.teamInfo.phonePlaceholder', '664 1234 567')} 
                      type="tel"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    {t('tournamentRegistration.teamInfo.phoneHelp', 'Wir nutzen diese Nummer für Turnier-Updates via WhatsApp.')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1a1816]/65 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">person_add</span>
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{t('tournamentRegistration.playerList.title', 'Spielerliste')}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">{t('tournamentRegistration.playerList.subtitle', { min: 5, max: 10, defaultValue: 'Min. 5 / Max. 10 Spieler' })}</p>
                </div>
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">5/10</span>
              </div>
              
              <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(255,123,0,0.2)]">C</div>
                  <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-slate-300 text-sm cursor-not-allowed" disabled type="text" value="Max Mustermann"/>
                  <span className="material-symbols-outlined text-primary text-sm" title="Captain">star</span>
                </div>
                {[2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-white/5 border border-white/10 text-slate-400 font-bold text-sm">{num}</div>
                    <input className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" placeholder={t('tournamentRegistration.playerList.placeholder', 'Spielername')} type="text"/>
                    <button className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-primary/40 text-primary hover:bg-primary/5 rounded-xl transition-all group">
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-medium text-sm">{t('tournamentRegistration.playerList.addPlayer', 'Spieler hinzufügen')}</span>
                </button>
              </div>
            </div>

          </div>
          
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#1a1816]/65 backdrop-blur-md border border-white/10 rounded-2xl p-6 border-t-4 border-t-primary sticky top-24 shadow-2xl shadow-black/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-primary font-bold tracking-wider uppercase mb-1">{t('tournamentRegistration.summary.tournamentLabel', 'Turnier')}</p>
                  <h3 className="text-2xl font-bold text-white leading-tight">Wien Cup 2026</h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    <span>12. - 14. Juni 2026</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>Prater Sportzentrum</span>
                  </div>
                </div>
                <div className="size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-white">emoji_events</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">{t('tournamentRegistration.summary.feeLabel', 'Startgebühr pro Team')}</span>
                  <span className="text-white font-medium">€150,00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">{t('tournamentRegistration.summary.playersLabel', 'Spieleranzahl')}</span>
                  <span className="text-white font-medium">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white font-bold">{t('tournamentRegistration.summary.totalLabel', 'Gesamtbetrag')}</span>
                  <span className="text-2xl font-bold text-primary drop-shadow-[0_0_15px_rgba(255,94,0,0.5)]">€150,00</span>
                </div>
              </div>
              
              <button className="w-full bg-primary hover:bg-[#e05e00] text-white font-bold text-base py-4 rounded-xl shadow-[0_0_15px_rgba(255,123,0,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                <span>{t('tournamentRegistration.summary.submit', 'ANMELDUNG ABSCHLIESSEN')}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              
              <p className="text-xs text-center text-slate-500 mt-4">
                {t('tournamentRegistration.summary.terms', 'Mit der Anmeldung akzeptieren Sie die')} <Link to="/regeln" className="text-slate-400 hover:text-primary underline">{t('tournamentRegistration.summary.rules', 'Turnierregeln')}</Link>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
