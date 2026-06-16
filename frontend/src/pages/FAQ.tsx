import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  COMPANY_LEGAL_NAME,
  ADDRESS_STREET,
  ADDRESS_ZIP,
  ADDRESS_CITY,
  ADDRESS_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_PHONES,
  MAP_COORDINATES,
} from '../config/brand';
import { useTranslation } from 'react-i18next';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const getFaqs = (t: any) => [
  {
    question: t('faq.items.0.q', "Kann man auch ohne Reservierung spielen?"),
    answer: t('faq.items.0.a', "Spontanes Spielen ist möglich, wenn ein Platz frei ist. Wir empfehlen aber dringend, vorher online oder telefonisch zu reservieren.")
  },
  {
    question: t('faq.items.1.q', "Wie lange im Voraus kann man einen Platz reservieren?"),
    answer: t('faq.items.1.a', "Über unser Online-Buchungssystem kann ein Platz bis zu 90 Tage im Voraus reserviert werden. Wenn du kurzfristig, also ein paar Stunden vorher, spielen möchtest, empfehlen wir dir, uns telefonisch zu kontaktieren, um die aktuelle Verfügbarkeit zu prüfen.")
  },
  {
    question: t('faq.items.2.q', "Kann man ein regelmäßiges Abo oder eine Dauerbuchung abschließen?"),
    answer: t('faq.items.2.a', "Ja, wenn du regelmäßig spielen möchtest – zum Beispiel jede Woche oder alle zwei Wochen zur gleichen Zeit – ist das kein Problem. In diesem Fall kontaktiere uns bitte direkt über unsere Kontaktseite oder telefonisch, damit wir gemeinsam eine individuelle Dauerbuchung für dich einrichten können.")
  },
  {
    question: t('faq.items.3.q', "Auf welchem Boden wird gespielt?"),
    answer: t('faq.items.3.a', "Es wird auf einem hochwertigen Polytan-Kunstrasen gespielt, der ein optimales Spielgefühl und maximale Sicherheit bietet.")
  },
  {
    question: t('faq.items.4.q', "Mit welchen Schuhen darf gespielt werden?"),
    answer: t('faq.items.4.a', "Es kann mit allen gängigen Sportschuhen gespielt werden – Stollenschuhe sind aus Sicherheitsgründen nicht erlaubt.")
  },
  {
    question: t('faq.items.5.q', "Gibt es Duschen und Umkleiden?"),
    answer: t('faq.items.5.a', "Ja, es stehen kostenlose Duschen und Umkleiden für unsere Gäste zur Verfügung. Bitte beachte, dass derzeit keine Schließfächer für Wertsachen vorhanden sind.")
  },
  {
    question: t('faq.items.6.q', "Gibt es Parkmöglichkeiten vor Ort?"),
    answer: t('faq.items.6.a', "Ja, es stehen ausreichend kostenlose Parkplätze direkt vor der Soccer Arena zur Verfügung.")
  }
];

export const FAQ = () => {
  const { t } = useTranslation();
  const faqs = getFaqs(t);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const position: [number, number] = [MAP_COORDINATES.lat, MAP_COORDINATES.lng];

  return (
    <div className="relative min-h-screen flex flex-col items-center pb-20 overflow-hidden bg-background-dark">
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[60px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[60px] pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mt-8 relative z-10 grow flex flex-col">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 italic text-white tracking-tight">
            {t('faq.titlePart1', 'Häufig gestellte')} <span className="text-primary">{t('faq.titlePart2', 'Fragen')}</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            {t('faq.subtitle', 'Alles, was du über deinen Kick bei uns wissen musst. Falls noch etwas unklar ist, kontaktiere uns einfach!')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-surface-dark/60 backdrop-blur-md rounded-xl px-6 cursor-pointer border transition-all duration-300 ${isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(255,140,0,0.15)]' : 'border-white/10 hover:border-primary/30'}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center py-5">
                  <h3 className="font-bold text-lg text-white pr-4">{faq.question}</h3>
                  <span className={`transition-transform duration-300 text-slate-400 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                </div>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl">
          <div className="p-8 md:p-12 flex flex-col justify-center items-center md:items-start space-y-6 relative border-b md:border-b-0 md:border-r border-white/10">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm">{t('faq.contactTitle', 'Kontakt & Anfahrt')}</h4>
            <div className="space-y-2 text-center md:text-left">
              <p className="font-bold text-xl text-white">{ADDRESS_STREET}, {ADDRESS_ZIP} {ADDRESS_CITY}</p>
              <div className="text-slate-400 space-y-1 mt-2">
                <p className="flex gap-2">{t('faq.contactTel', 'Tel:')} 
                  <span className="flex flex-col">
                    {CONTACT_PHONES.map(phone => (
                      <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="text-white hover:text-primary transition-colors">{phone}</a>
                    ))}
                  </span>
                </p>
                <p>{t('faq.contactEmail', 'Email:')} <a href={`mailto:${CONTACT_EMAIL}`} className="text-white hover:text-primary transition-colors">{CONTACT_EMAIL}</a></p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="#" className="p-3 bg-primary/10 rounded-full text-slate-300 hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </a>
              <a href="#" className="p-3 bg-primary/10 rounded-full text-slate-300 hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
            </div>
          </div>
          
          <div className="h-64 md:h-auto min-h-[300px] w-full bg-background-dark overflow-hidden relative">
            <div className="absolute inset-0 z-0">
               <MapContainer 
                 center={position} 
                 zoom={15} 
                 scrollWheelZoom={false} 
                 style={{ height: "100%", width: "100%", zIndex: 0 }}
                 className="z-0"
               >
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                 />
                 <Marker position={position}>
                   <Popup>
                     <div className="text-slate-900 font-bold">
                       {COMPANY_LEGAL_NAME}<br />
                       <span className="font-normal">{ADDRESS_STREET}, {ADDRESS_ZIP} {ADDRESS_CITY}</span>
                     </div>
                   </Popup>
                 </Marker>
               </MapContainer>
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none bg-linear-to-t from-background-dark/40 to-transparent"></div>
            <div className="absolute inset-0 z-20 pointer-events-none border-l border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"></div>
            
             <div className="absolute bottom-4 left-4 z-40 flex flex-col md:flex-row items-start md:items-center gap-3 pointer-events-none">
                <div className="bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-lg border border-white/10 shadow-lg pointer-events-auto">
                    <p className="text-white text-sm font-bold">{ADDRESS_STREET}</p>
                    <p className="text-slate-400 text-xs">{ADDRESS_ZIP} {ADDRESS_CITY}, {ADDRESS_COUNTRY}</p>
                </div>
            </div>
            <div className="absolute top-4 right-4 z-40">
                <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${ADDRESS_STREET}, ${ADDRESS_ZIP} ${ADDRESS_CITY}, ${ADDRESS_COUNTRY}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                >
                    {t('faq.planRoute', 'Route planen')}
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

