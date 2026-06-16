import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { format, parseISO } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/common/Logo';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
    COMPANY_NAME, 
    ADDRESS_STREET, 
    ADDRESS_ZIP, 
    ADDRESS_CITY, 
    ADDRESS_COUNTRY,
    MAP_COORDINATES
} from '../config/brand';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationState {
    bookingId: string;
    manageToken?: string | null;
    selectedField: {
        name: string;
        type: string;
    };
    dateTime: {
        startTime: string;
        endTime: string;
        durationMinutes: number;
    };
    price: {
        total: number;
        status: string;
    };
}

export function BookingSuccess() {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'tr' ? tr : de;
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as LocationState | null;

    useEffect(() => {
        if (!location.state || !(location.state as LocationState).bookingId) {
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    if (!state) return null;

    const { bookingId, manageToken, selectedField, dateTime, price } = state;
    const startDateTime = parseISO(dateTime.startTime);
    const endDateTime = parseISO(dateTime.endTime);

    return (
        <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background-dark text-slate-100 antialiased"
             style={{
                 backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
             }}>
            
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[96px] pointer-events-none"></div>

            <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-start relative z-10">
                
                <div className="flex flex-col justify-center h-full lg:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-6">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-xs font-bold tracking-wider uppercase">{t('booking.success.confirmed', 'Buchung Bestätigt')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-4 leading-tight">
                            {t('booking.success.thankYou', 'Vielen Dank,')} <br /><span className="text-primary">{t('booking.success.gameReady', 'Dein Spiel steht!')}</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                            {t('booking.success.description', 'Deine Buchung wurde erfolgreich bestätigt. Wir haben dir eine Zusammenfassung per E-Mail gesendet. Bereite dich auf das Match vor!')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button 
                          onClick={() => navigate(`/reservierung/verwalten/${bookingId}`, { state: { manageToken } })}
                          className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined">settings</span>
                            {t('booking.success.manageBtn', 'BUCHUNG VERWALTEN')}
                        </button>
                        <button onClick={() => navigate('/')} className="flex-1 bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 text-slate-200 hover:text-primary font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5">
                            <span className="material-symbols-outlined">event</span>
                            {t('booking.success.homeBtn', 'Startseite')}
                        </button>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <p className="text-sm text-slate-500 mb-4">{t('booking.success.needHelp', 'Brauchst du Hilfe? Wir sind für dich da.')}</p>
                        <button onClick={() => navigate('/kontakt')} className="inline-flex items-center gap-2 text-primary hover:text-orange-400 font-medium transition-colors cursor-pointer bg-transparent border-none">
                            <span className="material-symbols-outlined text-lg">support_agent</span>
                            {t('booking.success.contactSupport', 'Support kontaktieren')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 delay-150 relative z-10 w-full">
                    <div className="bg-surface-dark/80 backdrop-blur-xl border border-primary/15 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl p-1 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
                        <div className="bg-background-dark/40 rounded-[1.4rem] p-8 relative overflow-hidden flex flex-col h-full">
                            
                            <div className="absolute -top-12 -right-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 rotate-12">
                                <Logo variant="large" className="w-64 h-64 opacity-50 grayscale" />
                            </div>

                            <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5 relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2">{t('booking.success.bookingId', 'Buchungs-ID')}</p>
                                    <p className="text-2xl font-mono text-slate-100 tracking-tight">#{bookingId}</p>
                                </div>
                                <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8 relative z-10 grow">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">{t('booking.success.date', 'Datum')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
                                        <p className="text-lg font-semibold text-slate-200">{format(startDateTime, 'E. dd. MMM', { locale: dateLocale })}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">{t('booking.success.time', 'Zeit')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                                        <p className="text-lg font-semibold text-slate-200">{format(startDateTime, 'HH:mm')} — {format(endDateTime, 'HH:mm')}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">{t('booking.success.field', 'Platz')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-primary">stadium</span>
                                        <p className="text-base font-medium text-slate-200">{selectedField.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">{t('booking.success.price', 'Preis')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-primary">payments</span>
                                        <p className="text-base font-medium text-slate-200">€{price.total.toFixed(2)} <span className="text-xs opacity-70">({t('booking.success.paidStatus', price.status)})</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative z-10 border border-white/5 mt-auto">
                                <div className="bg-white p-2 rounded-xl shrink-0 transition-transform duration-300 hover:scale-105">
                                    <QRCode 
                                    value={`${window.location.origin}/reservierung/verwalten/${bookingId}`} 
                                    size={96} 
                                    level="M"
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2">{t('booking.success.checkIn', 'Check-In Code')}</p>
                                    <p className="text-sm text-slate-400 leading-relaxed">{t('booking.success.qrDesc', 'Zeige diesen QR-Code am Empfang vor, um Zutritt zum Spielfeld zu erhalten.')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/10 h-64 relative group shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] z-0">
                        <MapContainer 
                            center={[MAP_COORDINATES.lat, MAP_COORDINATES.lng]}
                            zoom={14} 
                            scrollWheelZoom={false} 
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={[MAP_COORDINATES.lat, MAP_COORDINATES.lng]}>
                                <Popup>
                                    {COMPANY_NAME} <br /> {ADDRESS_STREET}
                                </Popup>
                            </Marker>
                        </MapContainer>
                        <div className="absolute bottom-4 left-4 z-400 flex flex-col md:flex-row items-start md:items-center gap-3 pointer-events-none">
                            <div className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 shadow-lg pointer-events-auto">
                                <p className="text-slate-900 dark:text-white text-sm font-bold">{ADDRESS_STREET}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">{ADDRESS_ZIP} {ADDRESS_CITY}, {ADDRESS_COUNTRY}</p>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 z-400">
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${ADDRESS_STREET}, ${ADDRESS_ZIP} ${ADDRESS_CITY}, ${ADDRESS_COUNTRY}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                            >
                                {t('booking.success.planRoute', 'Route planen')}
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
