import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api';
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

export const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const position: [number, number] = [MAP_COORDINATES.lat, MAP_COORDINATES.lng];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<unknown>>;
      setError(axiosErr.response?.data?.message || t('contact.form.errorFallback', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start relative z-10">
        
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t('contact.title1', 'Kontaktieren')} <span className="text-primary">{t('contact.title2', 'Sie uns')}</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md">
              {t('contact.subtitle', 'Haben Sie Fragen zu Ihrer Buchung oder unserem Platz? Wir sind für Sie da. Füllen Sie einfach das Formular aus.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface-dark/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 border border-white/10">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 transition-all duration-300 rounded-lg group">
                <label className="block text-sm font-medium text-slate-300 group-focus-within:text-primary transition-colors" htmlFor="name">{t('contact.form.nameLabel', 'Name')}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-xl">person</span>
                  </div>
                  <input 
                    className="block w-full rounded-lg border-white/10 bg-surface-dark p-3 pl-10 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.namePlaceholder', 'Ihr Name')} 
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2 transition-all duration-300 rounded-lg group">
                <label className="block text-sm font-medium text-slate-300 group-focus-within:text-primary transition-colors" htmlFor="email">{t('contact.form.emailLabel', 'E-Mail-Adresse')}</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-xl">mail</span>
                  </div>
                  <input 
                    className="block w-full rounded-lg border-white/10 bg-surface-dark p-3 pl-10 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.emailPlaceholder', 'name@beispiel.at')}
                    type="email"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 transition-all duration-300 rounded-lg group">
              <label className="block text-sm font-medium text-slate-300 group-focus-within:text-primary transition-colors" htmlFor="subject">{t('contact.form.subjectLabel', 'Betreff')}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-xl">label</span>
                </div>
                <input 
                  className="block w-full rounded-lg border-white/10 bg-surface-dark p-3 pl-10 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm" 
                  id="subject"
                  required 
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder={t('contact.form.subjectPlaceholder', 'Worum geht es?')} 
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-2 transition-all duration-300 rounded-lg group">
              <label className="block text-sm font-medium text-slate-300 group-focus-within:text-primary transition-colors" htmlFor="message">{t('contact.form.messageLabel', 'Ihre Nachricht')}</label>
              <div className="relative">
                <textarea 
                  className="block w-full rounded-lg border-white/10 bg-surface-dark p-3 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm resize-none transition-all shadow-sm" 
                  id="message" 
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('contact.form.messagePlaceholder', 'Schreiben Sie uns Ihre Nachricht...')} 
                  rows={4}
                ></textarea>
              </div>
            </div>

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {t('contact.form.successData', 'Vielen Dank für Ihre Nachricht. Wir werden uns in Kürze bei Ihnen melden.')}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              className="group mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-base font-bold text-background-dark transition-all hover:shadow-[0_0_20px_rgba(255,140,0,0.4)] hover:bg-[#e67e00] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block h-5 w-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin mr-2" />
              ) : (
                <span className="material-symbols-outlined mr-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">send</span>
              )}
              {loading ? t('contact.form.sendingBtn', 'Wird gesendet...') : t('contact.form.sendBtn', 'Nachricht Senden')}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-8 lg:pt-8">
          <div className="grid gap-4 sm:grid-cols-1">
            
            <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-surface-dark/40 p-4 transition-colors hover:bg-surface-dark/60 hover:border-primary/30 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">{t('contact.info.address', 'Adresse')}</h3>
                <p className="text-slate-400 group-hover:text-white transition-colors">{ADDRESS_STREET}, {ADDRESS_ZIP} {ADDRESS_CITY}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-surface-dark/40 p-4 transition-colors hover:bg-surface-dark/60 hover:border-primary/30 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                <span className="material-symbols-outlined text-2xl">call</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">{t('contact.info.phone', 'Telefon')}</h3>
                <p className="text-slate-400 hover:text-white transition-colors flex flex-col">
                  {CONTACT_PHONES.map(phone => (
                     <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-surface-dark/40 p-4 transition-colors hover:bg-surface-dark/60 hover:border-primary/30 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">{t('contact.info.email', 'E-Mail')}</h3>
                <p className="text-slate-400 hover:text-white transition-colors">
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-surface-dark/40 p-4 transition-colors hover:bg-surface-dark/60 hover:border-primary/30 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors duration-300">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-primary transition-colors">{t('contact.info.hoursTitle', 'Öffnungszeiten')}</h3>
                <div className="text-slate-400 group-hover:text-white transition-colors space-y-0.5 mt-1">
                  <p>{t('contact.info.hoursLine1', 'Mo - Do: 16:30 - 00:00 Uhr')}</p>
                  <p>{t('contact.info.hoursLine2', 'Fr - So: 12:00 - 01:30 Uhr')}</p>
                </div>
              </div>
            </div>
            
          </div>

          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-background-dark shadow-lg h-[300px]">
             <div className="w-full h-full z-0">
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
             
             <div className="absolute inset-0 z-20 pointer-events-none bg-linear-to-t from-background-dark/60 to-transparent"></div>
             
             <div className="absolute bottom-4 left-4 z-400 flex flex-col md:flex-row items-start md:items-center gap-3 pointer-events-none">
                <div className="bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-lg border border-white/10 shadow-lg pointer-events-auto">
                    <p className="text-white text-sm font-bold">{ADDRESS_STREET}</p>
                    <p className="text-slate-400 text-xs">{ADDRESS_ZIP} {ADDRESS_CITY}, {t('contact.info.mapAustria', 'Österreich')}</p>
                </div>
            </div>
            <div className="absolute top-4 right-4 z-400">
                <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${ADDRESS_STREET}, ${ADDRESS_ZIP} ${ADDRESS_CITY}, ${t('contact.info.mapAustria', 'Österreich')}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                >
                    {t('contact.info.planRoute', 'Route planen')}
                </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

