import { Link } from 'react-router-dom';
import { COMPANY_NAME, CONTACT_EMAIL } from '../config/brand';
import { useTranslation, Trans } from 'react-i18next';
import { ScrollReveal } from '../components/animations/ScrollReveal';

export function AGB() {
  const { t } = useTranslation();
  return (
    <main className="grow relative w-full bg-background-dark">
      <div className="absolute inset-0 bg-background-dark pointer-events-none"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-[120px]"></div>
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            {t('agb.tag', 'Rechtliches')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-6">
            {t('agb.titlePart1', 'Allgemeine')} <br/><span className="text-primary drop-shadow-[0_0_15px_rgba(255,68,0,0.5)]">{t('agb.titlePart2', 'Geschäftsbedingungen')}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t('agb.subtitle', 'Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unsere Dienste nutzen. Transparenz und Fairness sind uns wichtig.')}
          </p>
          <div className="text-sm text-slate-500 mt-4">{t('agb.date', 'Stand: Mai 2024')}</div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#141414]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(255,68,0,0.1)] p-8 sm:p-12 mb-12">
          <div className="space-y-12 text-slate-300 leading-relaxed">
            
            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">01</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.0.title', 'Geltungsbereich')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.0.p1', { company: COMPANY_NAME, defaultValue: `Diese Allgemeine Geschäftsbedingungen (nachfolgend "AGB" genannt) regeln die Nutzung der Sportanlage ${COMPANY_NAME} (nachfolgend "Betreiber" genannt) durch Kunden und Besucher (nachfolgend "Nutzer" genannt).` })}
                </p>
                <p>
                  {t('agb.sections.0.p2', 'Mit der Buchung eines Spielfeldes oder dem Betreten der Anlage erkennt der Nutzer diese AGB in ihrer jeweils gültigen Fassung an. Abweichende Bedingungen des Nutzers werden nicht Vertragsbestandteil, es sei denn, der Betreiber stimmt ihrer Geltung ausdrücklich schriftlich zu.')}
                </p>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">02</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.1.title', 'Buchung & Vertragsabschluss')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.1.p1', 'Die Buchung von Spielfeldern erfolgen vorrangig über das Online-Buchungssystem auf unserer Website.')}
                </p>
                <ul className="list-disc pl-5 space-y-3 text-slate-400 marker:text-primary">
                  <li>{t('agb.sections.1.i1', 'Der Vertrag zwischen dem Nutzer und dem Betreiber kommt zustande, sobald der Nutzer den Buchungsprozess abgeschlossen hat und eine Buchungsbestätigung per E-Mail erhält.')}</li>
                  <li>{t('agb.sections.1.i2', 'Die Buchungsbestätigung enthält alle relevanten Details zur Buchung (Datum, Uhrzeit, Platznummer, Preis).')}</li>
                  <li>{t('agb.sections.1.i3', 'Der Nutzer ist verpflichtet, die Angaben in der Buchungsbestätigung umgehend auf Richtigkeit zu überprüfen und etwaige Fehler unverzüglich mitzuteilen.')}</li>
                </ul>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">03</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.2.title', 'Zahlungsbedingungen')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.2.p1', 'Die Preise für die Nutzung der Spielfelder richten sich nach der aktuellen Preisliste auf der Website. Alle Preise sind in Euro (EUR) angegeben.')}
                </p>
                <ul className="list-disc pl-5 space-y-3 text-slate-400 marker:text-primary">
                  <li>{t('agb.sections.2.i1', 'Zahlungsmethoden: Die Zahlung erfolgt online über die angebotenen Zahlungsmethoden (Kreditkarte, Apple Pay, Google Pay, Klarna). PayPal steht in Kürze zur Verfügung.')}</li>
                  <li>{t('agb.sections.2.i2', 'Fälligkeit: Der volle Rechnungsbetrag ist unmittelbar bei Buchung oder spätestens vor Spielantritt fällig.')}</li>
                  <li>{t('agb.sections.2.i3', 'Eine Nutzung des Platzes ohne vorherige vollständige Bezahlung ist nicht gestattet.')}</li>
                </ul>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">04</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.3.title', 'Stornierung & Rückerstattung')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.3.p1', 'Stornierungen müssen schriftlich (per E-Mail) oder über das Benutzerkonto im Online-Buchungssystem erfolgen.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      <h4 className="text-white font-bold">{t('agb.sections.3.b1Title', 'Bis 48h vor Spielbeginn')}</h4>
                    </div>
                    <p className="text-sm text-slate-400">{t('agb.sections.3.b1Desc', 'Kostenfreie Stornierung möglich. Der bereits gezahlte Betrag wird vollständig zurückerstattet.')}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-red-500">cancel</span>
                      <h4 className="text-white font-bold">{t('agb.sections.3.b2Title', 'Innerhalb von 48h')}</h4>
                    </div>
                    <p className="text-sm text-slate-400">{t('agb.sections.3.b2Desc', 'Keine Rückerstattung. Bei später Stornierung oder Nichterscheinen ("No-Show") wird der volle Betrag einbehalten.')}</p>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">05</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.4.title', 'Nutzung der Anlage & Hausordnung')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.4.p1', 'Die Nutzung der Anlage ist nur während der gebuchten Zeiten gestattet.')}
                </p>
                <ul className="list-disc pl-5 space-y-3 text-slate-400 marker:text-primary">
                  <li>{t('agb.sections.4.i1', 'Nutzer müssen die Anlage pünktlich zum Ende ihrer Buchungszeit verlassen, um nachfolgenden Gruppen einen pünktlichen Beginn zu ermöglichen.')}</li>
                  <li>{t('agb.sections.4.i2', 'Es gelten die in der Anlage ausgehängte Hausordnung sowie die Anweisungen des Personals.')}</li>
                  <li>{t('agb.sections.4.i3', 'Das Betreten der Spielfelder ist nur mit geeignetem Sportschuhwerk gestattet (keine Schraubstollen).')}</li>
                  <li>{t('agb.sections.4.i4', 'Rauchen und Alkoholkonsum sind auf den Sportflächen untersagt.')}</li>
                </ul>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">06</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.5.title', 'Haftung')}</h2>
                </div>
                <p className="mb-4">
                  {t('agb.sections.5.p1', { company: COMPANY_NAME, defaultValue: `Die Nutzung der ${COMPANY_NAME} und ihrer Einrichtungen erfolgt auf eigene Gefahr.` })}
                </p>
                <ul className="list-disc pl-5 space-y-3 text-slate-400 marker:text-primary">
                  <li>{t('agb.sections.5.i1', 'Der Betreiber haftet nicht für Schäden oder Verletzungen, die durch die Nutzung der Anlage entstehen, es sei denn, sie beruhen auf grober Fahrlässigkeit oder Vorsatz des Betreibers.')}</li>
                  <li>{t('agb.sections.5.i2', 'Für mitgebrachte Wertgegenstände, Kleidung und Ausrüstung wird keine Haftung übernommen. Wir empfehlen, keine Wertsachen in den Umkleiden zurückzulassen.')}</li>
                  <li>{t('agb.sections.5.i3', 'Für mutwillige Beschädigungen an der Einrichtung haftet der Verursacher bzw. der Buchende vollumfänglich.')}</li>
                </ul>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">07</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.6.title', 'Rücktritt durch den Betreiber')}</h2>
                </div>
                <p>
                  {t('agb.sections.6.p1', 'Der Betreiber behält sich das Recht vor, Buchungen aus wichtigem Grund (z.B. technische Probleme, Unbespielbarkeit des Platzes, höhere Gewalt) abzusagen. In diesem Fall wird der bereits gezahlte Betrag vollständig erstattet. Weitergehende Schadensersatzansprüche sind ausgeschlossen.')}
                </p>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">08</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.7.title', 'Datenschutz')}</h2>
                </div>
                <p>
                  <Trans i18nKey="agb.sections.7.p1" components={{ link: <Link className="text-primary hover:underline" to="/datenschutz" /> }}>
                    Der Schutz Ihrer persönlichen Daten ist uns wichtig. Informationen zur Erhebung, Verarbeitung und Nutzung Ihrer Daten finden Sie in unserer separaten <span className="underline">Datenschutzerklärung</span>.
                  </Trans>
                </p>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">09</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.8.title', 'Änderungen der AGB')}</h2>
                </div>
                <p>
                  {t('agb.sections.8.p1', 'Der Betreiber behält sich vor, diese AGB jederzeit zu ändern. Die Änderungen werden auf der Website bekannt gegeben und gelten für alle Buchungen, die nach der Veröffentlichung getätigt werden.')}
                </p>
              </section>
            </ScrollReveal>

            <div className="h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>

            <ScrollReveal>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary font-bold text-lg">10</span>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{t('agb.sections.9.title', 'Gerichtsstand & Recht')}</h2>
                </div>
                <p>
                  {t('agb.sections.9.p1', 'Es gilt österreichisches Recht. Als Gerichtsstand für alle Streitigkeiten aus dem Vertragsverhältnis wird Wels vereinbart, sofern der Kunde Unternehmer ist oder keinen allgemeinen Gerichtsstand in Österreich hat.')}
                </p>
              </section>
            </ScrollReveal>

            <div className="mt-16 p-8 rounded-xl bg-linear-to-br from-primary/10 to-transparent border border-primary/20 text-center">
              <h3 className="text-xl text-white font-bold mb-3">{t('agb.footer.title', 'Haben Sie Fragen zu unseren AGB?')}</h3>
              <p className="text-slate-400 mb-6">{t('agb.footer.subtitle', 'Unser Support-Team steht Ihnen gerne zur Verfügung.')}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex px-8 py-3 rounded-full bg-primary text-white text-base font-bold transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,68,0,0.5)] transform hover:-translate-y-1">
                {t('agb.footer.button', 'Kontakt aufnehmen')}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('agb.backHome', 'Zurück zur Startseite')}
          </Link>
        </div>
      </div>
    </main>
  );
}
