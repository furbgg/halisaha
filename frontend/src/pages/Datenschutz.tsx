import { Link } from 'react-router-dom';
import { 
  COMPANY_LEGAL_NAME,
  COMPANY_OWNERS,
  ADDRESS_FULL,
  CONTACT_EMAIL,
} from '../config/brand';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export function Datenschutz() {
  const { t } = useTranslation();
  return (
    <main className="grow relative">
      <div 
        className="absolute inset-0 bg-background-dark pointer-events-none z-0 opacity-50"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-[rgba(255,68,0,0.1)] px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            {t('datenschutz.tag', 'Rechtliches & Datenschutz')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6 drop-shadow-[0_0_15px_rgba(255,68,0,0.4)]">
            {t('datenschutz.title', 'Datenschutzerklärung')}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            {t('datenschutz.subtitle', { company: COMPANY_LEGAL_NAME, defaultValue: `Wir nehmen den Schutz deiner persönlichen Daten sehr ernst. Hier erfährst du transparent, wie wir deine Informationen bei ${COMPANY_LEGAL_NAME} verarbeiten und schützen.` })}
          </p>
        </div>

        <div className="space-y-8">
          
          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.0.title', '1. Verantwortlicher')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {t('datenschutz.sections.0.content', 'Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:')}
                  </p>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-white font-semibold">{COMPANY_LEGAL_NAME}</p>
                    <p className="text-slate-400 text-sm">{ADDRESS_FULL}</p>
                    <p className="text-slate-400 text-sm mt-2"><strong>{t('datenschutz.sections.0.representedBy', 'Vertreten durch:')}</strong> {COMPANY_OWNERS}</p>
                    <p className="text-slate-400 text-sm mt-2"><strong>{t('datenschutz.sections.0.email', 'E-Mail:')}</strong> {CONTACT_EMAIL}</p>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">data_usage</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('datenschutz.sections.1.title', '2. Erhebung und Verarbeitung von Daten')}</h2>
                </div>
              </div>
              <div className="space-y-4 pl-0 md:pl-14">
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t('datenschutz.sections.1.content', 'Wir verarbeiten personenbezogene Daten, die wir im Rahmen unserer Geschäftsbeziehung von Ihnen erhalten. Zu den verarbeiteten Daten gehören insbesondere:')}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.0', 'Name, Vorname')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.1', 'Telefonnummer')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.2', 'E-Mail-Adresse')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.3', 'Buchungsdetails')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.4', 'Zahlungsdaten')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('datenschutz.sections.1.items.5', 'Technische Daten (IP, Cookies)')}
                  </li>
                </ul>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">target</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{t('datenschutz.sections.2.title', '3. Zweck der Verarbeitung')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {t('datenschutz.sections.2.content', 'Wir verarbeiten Ihre personenbezogenen Daten unter Beachtung der Bestimmungen der EU-Datenschutz-Grundverordnung (DSGVO) und des Datenschutzgesetzes (DSG) zu folgenden Zwecken:')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      <span><strong>{t('datenschutz.sections.2.items.0.t', 'Buchungs- und Zahlungsabwicklung:')}</strong> {t('datenschutz.sections.2.items.0.c', 'Zur Verwaltung Ihrer Platzreservierungen und der dazugehörigen Transaktionen.')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      <span><strong>{t('datenschutz.sections.2.items.1.t', 'Vertragserfüllung:')}</strong> {t('datenschutz.sections.2.items.1.c', 'Zur Erbringung unserer Dienstleistungen im Rahmen des Nutzungsvertrages.')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      <span><strong>{t('datenschutz.sections.2.items.2.t', 'Kommunikation:')}</strong> {t('datenschutz.sections.2.items.2.c', 'Zur Kontaktaufnahme bei Rückfragen oder Änderungen Ihrer Buchung.')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      <span><strong>{t('datenschutz.sections.2.items.3.t', 'Serviceverbesserung:')}</strong> {t('datenschutz.sections.2.items.3.c', 'Analyse zur Optimierung unseres Angebots und der Website.')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.3.title', '4. Rechtsgrundlage')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.3.content', 'Die Verarbeitung Ihrer Daten erfolgt auf Basis der folgenden Rechtsgrundlagen gemäß Art. 6 Abs. 1 DSGVO:')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary font-bold block mb-1">{t('datenschutz.sections.3.items.0.t', 'Lit. a')}</span>
                      <span className="text-xs text-slate-400">{t('datenschutz.sections.3.items.0.c', 'Einwilligung (z.B. Newsletter, Cookies)')}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary font-bold block mb-1">{t('datenschutz.sections.3.items.1.t', 'Lit. b')}</span>
                      <span className="text-xs text-slate-400">{t('datenschutz.sections.3.items.1.c', 'Vertragserfüllung (Buchungen)')}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary font-bold block mb-1">{t('datenschutz.sections.3.items.2.t', 'Lit. c')}</span>
                      <span className="text-xs text-slate-400">{t('datenschutz.sections.3.items.2.c', 'Rechtliche Verpflichtung (Steuerrecht)')}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary font-bold block mb-1">{t('datenschutz.sections.3.items.3.t', 'Lit. f')}</span>
                      <span className="text-xs text-slate-400">{t('datenschutz.sections.3.items.3.c', 'Berechtigtes Interesse (Sicherheit, Analyse)')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">share</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.4.title', '5. Weitergabe von Daten')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.4.content', 'Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden aufgeführten Zwecken findet nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn dies für die Vertragsabwicklung erforderlich ist, etwa an das mit der Zahlungsabwicklung beauftragte Kreditinstitut oder Zahlungsdienstleister.')}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">cookie</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.5.title', '6. Cookies & Tracking')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.5.content', 'Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Wir setzen Analyse- und Marketing-Tools nur auf Basis Ihrer ausdrücklichen Einwilligung ein. Sie können Ihren Browser so konfigurieren, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben.')}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.6.title', '7. Speicherdauer')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.6.content', 'Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies zur Erfüllung der vertraglichen oder gesetzlichen Pflichten erforderlich ist. Sind die Daten für die Erfüllung vertraglicher oder gesetzlicher Pflichten nicht mehr erforderlich, werden diese regelmäßig gelöscht.')}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{t('datenschutz.sections.7.title', '8. Rechte der Betroffenen')}</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 md:pl-14">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.0.t', 'Auskunft')}</strong>
                  {t('datenschutz.sections.7.items.0.c', 'Sie können Auskunft über Ihre verarbeiteten Daten verlangen.')}
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.1.t', 'Berichtigung')}</strong>
                  {t('datenschutz.sections.7.items.1.c', 'Sie können die Korrektur falscher Daten verlangen.')}
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.2.t', 'Löschung')}</strong>
                  {t('datenschutz.sections.7.items.2.c', 'Sie können die Löschung Ihrer Daten verlangen.')}
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.3.t', 'Einschränkung')}</strong>
                  {t('datenschutz.sections.7.items.3.c', 'Sie können die Einschränkung der Verarbeitung verlangen.')}
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.4.t', 'Übertragbarkeit')}</strong>
                  {t('datenschutz.sections.7.items.4.c', 'Sie haben das Recht auf Datenübertragbarkeit.')}
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-slate-300">
                  <strong className="text-white block mb-1">{t('datenschutz.sections.7.items.5.t', 'Widerspruch')}</strong>
                  {t('datenschutz.sections.7.items.5.c', 'Sie können der Verarbeitung widersprechen.')}
                </div>
              </div>
              <div className="mt-4 pl-0 md:pl-14">
                <div className="p-3 rounded-lg bg-[rgba(255,68,0,0.1)]/30 border border-primary/20 text-sm text-slate-300">
                  <strong className="text-primary block mb-1">{t('datenschutz.sections.7.items.6.t', 'Widerruf')}</strong>
                  {t('datenschutz.sections.7.items.6.c', 'Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen.')}
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.8.title', '9. Sicherheit')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.8.content', 'Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre durch uns verwalteten Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.')}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section className="rounded-2xl border border-white/10 bg-[#141414]/60 backdrop-blur-xl p-8 shadow-[0_0_40px_-10px_rgba(255,68,0,0.15)] transition-all hover:border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-[rgba(255,68,0,0.1)] text-primary">
                  <span className="material-symbols-outlined">update</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('datenschutz.sections.9.title', '10. Änderungen')}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t('datenschutz.sections.9.content', 'Wir behalten uns vor, diese Datenschutzerklärung gelegentlich anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.')}
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-6">{t('datenschutz.footer.q', 'Haben Sie noch Fragen zum Datenschutz?')}</p>
            <a 
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(255,68,0,0.4)] active:scale-95"
            >
              <span className="material-symbols-outlined mr-2">contact_mail</span>
              {t('datenschutz.footer.btn', 'Datenschutzbeauftragten kontaktieren')}
            </a>
          </div>

        </div>
        
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('datenschutz.backHome', 'Zurück zur Startseite')}
          </Link>
        </div>
      </div>
    </main>
  );
}
