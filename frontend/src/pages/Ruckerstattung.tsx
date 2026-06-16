import { Link } from 'react-router-dom';
import { COMPANY_LEGAL_NAME, CONTACT_EMAIL, CONTACT_PHONES, CONTACT_WEBSITE } from '../config/brand';
import { useTranslation, Trans } from 'react-i18next';

export function Ruckerstattung() {
  const { t } = useTranslation();

  return (
    <main className="grow w-full relative">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #3a3027 1px, transparent 1px), linear-gradient(to bottom, #3a3027 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="relative z-10 px-6 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-[960px]">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(249,128,6,0.4)]">
              <span className="text-primary">{t('ruckerstattung.titlePart1', 'Rückerstattungs')}</span>{t('ruckerstattung.titlePart2', 'richtlinie')}
            </h1>
            <p className="text-[#bbab9b] text-lg max-w-2xl">
              {t('ruckerstattung.desc', { company: COMPANY_LEGAL_NAME, defaultValue: `Informationen zu Stornierungen, Umbuchungen und Rückerstattungen bei ${COMPANY_LEGAL_NAME}. Wir streben nach Fairness und Transparenz für alle unsere Spieler.` })}
            </p>
          </div>
          
          <div className="bg-[#141414]/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 md:p-12 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              <Trans i18nKey="ruckerstattung.scope" components={{ 1: <span className="text-primary font-medium" /> }} values={{ website: CONTACT_WEBSITE }}>
                Diese Richtlinie gilt für alle Buchungen von Plätzen, Events und Dienstleistungen über die Website <span className="text-primary font-medium">{CONTACT_WEBSITE}</span> oder direkt vor Ort.
              </Trans>
            </p>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">info</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.1.title', '1. Allgemeines')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10">
                {t('ruckerstattung.sections.1.desc', 'Wir verstehen, dass Pläne sich ändern können. Unsere Rückerstattungsrichtlinie wurde entwickelt, um flexibel zu sein, während wir gleichzeitig sicherstellen müssen, dass unsere Plätze für alle Fußballbegeisterten verfügbar bleiben. Mit der Buchung eines Platzes akzeptieren Sie die folgenden Bedingungen.')}
              </p>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">cancel</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.2.title', '2. Stornierungen durch Kunden')}</h2>
              </div>
              <div className="pl-10 text-slate-300 space-y-4">
                <p>{t('ruckerstattung.sections.2.desc', 'Stornierungen müssen schriftlich oder über das Benutzerkonto auf unserer Website erfolgen. Die Rückerstattungshöhe richtet sich nach dem Zeitpunkt der Stornierung:')}</p>
                <div className="bg-[#181411]/50 rounded-lg p-6 border border-white/5">
                  <ul className="list-none space-y-4">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0"></div>
                      <div>
                        <span className="text-white font-bold block mb-1">{t('ruckerstattung.sections.2.mehr.title', 'Mehr als 48 Stunden vor Spielbeginn')}</span>
                        <span>{t('ruckerstattung.sections.2.mehr.desc', 'Sie erhalten eine vollständige Rückerstattung des Buchungsbetrags. Alternativ kann der Betrag als Guthaben für zukünftige Buchungen gutgeschrieben werden.')}</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0"></div>
                      <div>
                        <span className="text-white font-bold block mb-1">{t('ruckerstattung.sections.2.weniger.title', 'Weniger als 48 Stunden vor Spielbeginn')}</span>
                        <span>{t('ruckerstattung.sections.2.weniger.desc', 'Leider ist keine Rückerstattung möglich, da wir den Platz so kurzfristig oft nicht mehr weitervermieten können.')}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">calendar_month</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.3.title', '3. Umbuchungen')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10 mb-4">
                {t('ruckerstattung.sections.3.desc', 'Möchten Sie Ihren Termin verschieben, anstatt ihn zu stornieren? Umbuchungen sind unter folgenden Bedingungen möglich:')}
              </p>
              <div className="pl-10">
                <ul className="list-none space-y-3 text-slate-300">
                  <li className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-primary text-sm shrink-0">arrow_forward</span>
                    <span>{t('ruckerstattung.sections.3.i1', 'Umbuchungen sind bis zu 48 Stunden vor dem ursprünglichen Termin kostenlos möglich.')}</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-primary text-sm shrink-0">arrow_forward</span>
                    <span>{t('ruckerstattung.sections.3.i2', 'Der neue Termin muss innerhalb von 30 Tagen nach dem ursprünglichen Buchungsdatum liegen.')}</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-primary text-sm shrink-0">arrow_forward</span>
                    <span>{t('ruckerstattung.sections.3.i3', 'Preisdifferenzen (z.B. Wechsel von Nebenzeit zu Hauptzeit) müssen aufgezahlt werden.')}</span>
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">gavel</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.4.title', '4. Rückerstattung bei Ausfall durch den Betreiber')}</h2>
              </div>
              <div className="pl-10 text-slate-300">
                <p className="leading-relaxed">
                  <Trans i18nKey="ruckerstattung.sections.4.desc" components={{ 1: <span className="text-white font-bold" /> }} values={{ company: COMPANY_LEGAL_NAME }}>
                    Sollte die {COMPANY_LEGAL_NAME} aufgrund technischer Probleme, Wartungsarbeiten oder höherer Gewalt (z.B. Wasserschaden, Stromausfall) nicht in der Lage sein, den gebuchten Platz zur Verfügung zu stellen, erhalten Sie selbstverständlich eine <span className="text-white font-bold">100%ige Rückerstattung</span> des gezahlten Betrags.
                  </Trans>
                </p>
                <p className="mt-4 text-sm text-[#bbab9b]">
                  {t('ruckerstattung.sections.4.note', '* In solchen Fällen werden Sie umgehend per E-Mail oder Telefon kontaktiert.')}
                </p>
              </div>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">local_offer</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.5.title', '5. Besondere Angebote & Gutscheine')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10">
                {t('ruckerstattung.sections.5.desc', 'Bitte beachten Sie, dass Buchungen, die im Rahmen von Sonderaktionen getätigt wurden oder mit Aktionsgutscheinen bezahlt wurden, von der regulären Rückerstattung ausgeschlossen sein können. Käuflich erworbene Wertgutscheine können nicht in bar abgelöst werden, behalten aber ihre Gültigkeit bei einer Stornierung (Gutschrift auf Kundenkonto).')}
              </p>
            </section>
            
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">schedule</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.6.title', '6. Bearbeitungszeit')}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed pl-10">
                <Trans i18nKey="ruckerstattung.sections.6.desc" components={{ 1: <span className="text-white font-bold" /> }}>
                  Wir bemühen uns, alle Rückerstattungsanfragen so schnell wie möglich zu bearbeiten. Bitte erlauben Sie uns eine Bearbeitungszeit von <span className="text-white font-bold">7-10 Werktagen</span>, bis der Betrag auf Ihrem ursprünglichen Zahlungsmittel gutgeschrieben ist.
                </Trans>
              </p>
            </section>
            
            <section>
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-primary mt-1">contact_support</span>
                <h2 className="text-2xl font-bold text-white">{t('ruckerstattung.sections.7.title', '7. Kontakt für Rückerstattungen')}</h2>
              </div>
              <div className="pl-10 text-slate-300">
                <p className="mb-6 leading-relaxed">
                  {t('ruckerstattung.sections.7.desc', 'Haben Sie Fragen zu Ihrer Rechnung oder einer spezifischen Rückerstattung? Unser Support-Team steht Ihnen gerne zur Verfügung.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center justify-center px-6 py-3 bg-[#3a3027] hover:bg-primary hover:text-white text-white rounded-lg transition-all border border-white/10 group">
                    <span className="material-symbols-outlined mr-2 text-primary group-hover:text-white group-hover:scale-110 transition-transform">mail</span>
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
            
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              {t('ruckerstattung.backHome', 'Zurück zur Startseite')}
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}
