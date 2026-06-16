import { Link } from 'react-router-dom';
import { 
  COMPANY_LEGAL_NAME, 
  COMPANY_LEGAL_FORM, 
  COMPANY_OWNERS,
  ADDRESS_STREET,
  ADDRESS_ZIP,
  ADDRESS_CITY,
  ADDRESS_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_PHONES,
  CONTACT_WEBSITE,
  LEGAL_UID,
  LEGAL_COURT,
} from '../config/brand';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export function Impressum() {
  const { t } = useTranslation();
  return (
    <main className="grow relative">
      <div 
        className="absolute inset-0 bg-background-dark -z-20"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-[120px] -z-10"></div>
      
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('impressum.tag', 'Rechtliches')}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4 drop-shadow-[0_0_20px_rgba(255,68,0,0.3)]">
            {t('impressum.title', 'Impressum')}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('impressum.subtitle', 'Informationen gemäß § 5 E-Commerce-Gesetz (ECG) und Offenlegungspflicht gemäß § 25 Mediengesetz.')}
          </p>
        </div>
        
        <div className="space-y-8">
          
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 transition-all hover:border-primary/30 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">business</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="h-8 w-1 bg-primary rounded-full"></span>
                {t('impressum.companyDetails', 'Angaben zum Unternehmen')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{t('impressum.companyName', 'Firmenname')}</p>
                  <p className="text-slate-200 text-lg">{COMPANY_LEGAL_NAME}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{t('impressum.legalForm', 'Rechtsform')}</p>
                  <p className="text-slate-200 text-lg">{COMPANY_LEGAL_FORM}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{t('impressum.headquarters', 'Sitz')}</p>
                  <p className="text-slate-200 text-lg">{ADDRESS_CITY}, {ADDRESS_COUNTRY}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{t('impressum.owners', 'Gesellschafter')}</p>
                  <p className="text-slate-200 text-lg">{COMPANY_OWNERS}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{t('impressum.addressTitle', 'Anschrift')}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {ADDRESS_STREET}<br/>
                      {ADDRESS_ZIP} {ADDRESS_CITY}<br/>
                      {ADDRESS_COUNTRY}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{t('impressum.registerEntryTitle', 'Registereintrag')}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {t('impressum.registeredCourt', 'Eingetragen im Firmenbuch des')} {LEGAL_COURT}<br/>
                      {t('impressum.uid', 'UID-Nummer:')} {LEGAL_UID}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <ScrollReveal>
              <div className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 hover:border-primary/30 transition-all hover:shadow-[0_0_25px_rgba(255,68,0,0.15)] h-full">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="h-6 w-1 bg-primary rounded-full"></span>
                  {t('impressum.contactTitle', 'Kontakt')}
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-primary">call</span>
                    <div className="flex flex-col">
                      {CONTACT_PHONES.map(phone => (
                        <a key={phone} className="hover:text-primary transition-colors text-sm" href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                      ))}
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-primary">mail</span>
                    <a className="hover:text-primary transition-colors break-all" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-primary">language</span>
                    <a className="hover:text-primary transition-colors" href={`https://${CONTACT_WEBSITE}`} target="_blank" rel="noopener noreferrer">{CONTACT_WEBSITE}</a>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            
            <ScrollReveal>
              <div className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 hover:border-primary/30 transition-all hover:shadow-[0_0_25px_rgba(255,68,0,0.15)] h-full">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="h-6 w-1 bg-primary rounded-full"></span>
                  {t('impressum.chamberTitle', 'Aufsicht & Kammer')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{t('impressum.chamberMembership', 'Kammerzugehörigkeit')}</p>
                    <p className="text-slate-300 text-sm">{t('impressum.chamberMember', 'Mitglied der Wirtschaftskammer Österreich (WKO)')}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{t('impressum.tradeRegulations', 'Gewerbeordnung')}</p>
                    <a className="text-primary text-sm hover:underline" href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer">www.ris.bka.gv.at</a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
          </div>
          
          <ScrollReveal>
            <div className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 hover:border-primary/30 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">{t('impressum.liabilityTitle', 'Haftung für Inhalte und Links')}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    {t('impressum.liabilityDesc1', 'Der Inhalt dieser Website wurde sorgfältig erstellt, jedoch übernehmen wir keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.')}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('impressum.liabilityDesc2', 'Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">{t('impressum.copyrightTitle', 'Urheberrecht')}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('impressum.copyrightDesc', 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.')}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
          
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('impressum.backHome', 'Zurück zur Startseite')}
          </Link>
        </div>
        
      </div>
    </main>
  );
}
