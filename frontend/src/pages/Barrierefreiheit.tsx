import { Link } from 'react-router-dom';
import { COMPANY_LEGAL_NAME, CONTACT_EMAIL, CONTACT_WEBSITE, CONTACT_PHONES } from '../config/brand';
import { useTranslation, Trans } from 'react-i18next';

export function Barrierefreiheit() {
  const { t } = useTranslation();

  return (
    <main className="grow w-full relative">
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #3a3027 1px, transparent 1px), linear-gradient(to bottom, #3a3027 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="relative z-10 px-6 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-[960px]">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(249,128,6,0.4)]">
              <span className="text-primary">{t('barrierefreiheit.titlePart1', 'Barrierefreiheits')}</span>{t('barrierefreiheit.titlePart2', 'erklärung')}
            </h1>
            <p className="text-[#bbab9b] text-lg max-w-2xl">
              {t('barrierefreiheit.desc', { company: COMPANY_LEGAL_NAME, defaultValue: `Informationen zur Zugänglichkeit dieser Website. ${COMPANY_LEGAL_NAME} ist bemüht, ihre Website im Einklang mit dem Bundes-Behindertengleichstellungsgesetz (BGStG) barrierefrei zugänglich zu machen.` })}
            </p>
          </div>
          
          <div className="bg-[#141414]/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 md:p-12 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {t('barrierefreiheit.scope', 'Diese Erklärung zur Barrierefreiheit gilt für die Website')} <span className="text-primary font-medium">{CONTACT_WEBSITE}</span>.
            </p>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                <h2 className="text-2xl font-bold text-white">{t('barrierefreiheit.sections.1.title', 'Stand der Vereinbarkeit mit den Anforderungen')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10">
                {t('barrierefreiheit.sections.1.desc', 'Diese Website ist wegen der folgenden Unvereinbarkeiten und Ausnahmen teilweise mit der Konformitätsstufe AA der "Richtlinien für barrierefreie Webinhalte Web – WCAG 2.1" vereinbar.')}
              </p>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">warning</span>
                <h2 className="text-2xl font-bold text-white">{t('barrierefreiheit.sections.2.title', 'Nicht barrierefreie Inhalte')}</h2>
              </div>
              <div className="pl-10 text-slate-300 space-y-4">
                <p>{t('barrierefreiheit.sections.2.desc', 'Die nachstehend aufgeführten Inhalte sind aus den folgenden Gründen nicht barrierefrei:')}</p>
                
                <div className="bg-[#181411]/50 rounded-lg p-6 border border-white/5">
                  <h3 className="text-primary font-bold text-lg mb-2">{t('barrierefreiheit.sections.2.a.title', 'a) Unvereinbarkeit mit den Barrierefreiheitsbestimmungen')}</h3>
                  <ul className="list-none space-y-3">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0"></div>
                      <span>{t('barrierefreiheit.sections.2.a.i1', 'Manche Bilder haben noch keinen Alternativtext, sodass diese Information für Screenreader-Benutzer nicht zugänglich ist. Wir arbeiten daran, diese Texte laufend zu ergänzen.')}</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0"></div>
                      <span>{t('barrierefreiheit.sections.2.a.i2', 'Die Kontraste bei einigen Navigationselementen entsprechen noch nicht vollständig dem erforderlichen Standard. Eine Überarbeitung des Farbschemas ist in Planung.')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#181411]/50 rounded-lg p-6 border border-white/5">
                  <h3 className="text-primary font-bold text-lg mb-2">{t('barrierefreiheit.sections.2.b.title', 'b) Unverhältnismäßige Belastung')}</h3>
                  <p className="mb-2">{t('barrierefreiheit.sections.2.b.desc', 'Unsere Videos sind derzeit noch nicht mit Untertiteln ausgestattet. Wir arbeiten an einer Lösung, dies für neue Videos standardmäßig umzusetzen.')}</p>
                </div>
              </div>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">edit_document</span>
                <h2 className="text-2xl font-bold text-white">{t('barrierefreiheit.sections.3.title', 'Erstellung der Erklärung')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10">
                <Trans i18nKey="barrierefreiheit.sections.3.desc" components={{ 1: <span className="text-white font-medium" /> }}>
                  Diese Erklärung wurde am <span className="text-white font-medium">15. Oktober 2023</span> erstellt. Die Bewertung der Vereinbarkeit der Website mit dem WZG zur Umsetzung der Anforderungen der Richtlinie (EU) 2016/2102 erfolgte in Form eines Selbsttests nach WCAG 2.1 im Konformitätslevel AA.
                </Trans>
              </p>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">mail</span>
                <h2 className="text-2xl font-bold text-white">{t('barrierefreiheit.sections.4.title', 'Feedback und Kontaktangaben')}</h2>
              </div>
              <div className="pl-10 text-slate-300">
                <p className="mb-6 leading-relaxed">
                  {t('barrierefreiheit.sections.4.p1', 'Die Angebote und Services auf dieser Website werden laufend verbessert, ausgetauscht und ausgebaut. Dabei ist uns die Bedienbarkeit und Zugänglichkeit ein großes Anliegen.')}
                </p>
                <p className="mb-6 leading-relaxed">
                  {t('barrierefreiheit.sections.4.p2', 'Wenn Ihnen Barrieren auffallen, die Sie an der Benutzung unserer Website behindern – Probleme, die in dieser Erklärung nicht beschrieben sind, Mängel in Bezug auf die Einhaltung der Barrierefreiheitsanforderungen – so bitten wir Sie, uns diese per E-Mail mitzuteilen.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center justify-center px-6 py-3 bg-[#3a3027] hover:bg-primary hover:text-white text-white rounded-lg transition-all border border-white/10 group">
                    <span className="material-symbols-outlined mr-2 text-primary group-hover:text-white group-hover:scale-110 transition-transform">send</span>
                    {CONTACT_EMAIL}
                  </a>
                  {CONTACT_PHONES.map(phone => (
                    <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center px-6 py-3 bg-[#3a3027] hover:bg-primary hover:text-white text-white rounded-lg transition-all border border-white/10 group">
                      <span className="material-symbols-outlined mr-2 text-primary group-hover:text-white group-hover:scale-110 transition-transform">call</span>
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </section>
            
            <section>
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">gavel</span>
                <h2 className="text-2xl font-bold text-white">{t('barrierefreiheit.sections.5.title', 'Durchsetzungsverfahren')}</h2>
              </div>
              <div className="pl-10 text-slate-300">
                <p className="mb-4 leading-relaxed">
                  {t('barrierefreiheit.sections.5.p1', 'Bei nicht zufriedenstellenden Antworten aus oben genannter Kontaktmöglichkeit können Sie sich mittels Beschwerde an die Österreichische Forschungsförderungsgesellschaft (FFG) wenden.')}
                </p>
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                  <p className="text-sm">
                    {t('barrierefreiheit.sections.5.p2', 'Die FFG nimmt über das Kontaktformular Beschwerden auf elektronischem Weg entgegen.')}<br/>
                    <a href="#" className="text-primary hover:text-primary/80 font-medium underline mt-2 inline-block">{t('barrierefreiheit.sections.5.link', 'Kontaktformular der Beschwerdestelle')}</a>
                  </p>
                </div>
              </div>
            </section>
            
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              {t('barrierefreiheit.backHome', 'Zurück zur Startseite')}
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}
