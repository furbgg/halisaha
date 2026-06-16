import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LocationState {
    bookingId?: string;
    selectedField?: {
        name: string;
        type: string;
    };
    price?: {
        total: number;
    };
    errorReason?: string;
}

export function BookingFailure() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const state = location.state as LocationState | null;

    useEffect(() => {
        if (!state) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    if (!state) return null;

    const { bookingId, selectedField, price, errorReason } = state;

    return (
        <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background-dark text-slate-100 antialiased"
             style={{
                 backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
             }}>
             
            <div className="max-w-[540px] w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div className="size-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(249,115,22,0.4)] animate-pulse ring-1 ring-primary/40 border-4 border-background-dark">
                        <span className="material-symbols-outlined text-primary text-6xl">warning</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-50 mb-3 tracking-tight">{t('bookingFailure.title', 'Hoppla! Etwas ist schiefgelaufen.')}</h1>
                    <p className="text-lg text-slate-400">{t('bookingFailure.desc', 'Deine Zahlung oder Reservierung konnte nicht verarbeitet werden.')}</p>
                </div>
                
                <div className="bg-surface-dark/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-white">credit_card_off</span>
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6">
                            <div>
                                <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-1.5 opacity-80">{t('bookingFailure.idLabel', 'Buchungs-ID')}</p>
                                <p className="text-2xl font-semibold text-slate-100 font-mono">#{bookingId}</p>
                            </div>
                            <div className="mt-4 sm:mt-0 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                {t('bookingFailure.failedLabel', 'Fehlgeschlagen')}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 py-2">
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-2">{t('bookingFailure.fieldLabel', 'Platz')}</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-white/5 p-1.5 rounded text-primary">
                                        <span className="material-symbols-outlined text-lg">stadium</span>
                                    </div>
                                    <p className="text-base font-medium text-slate-200">{selectedField?.name}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-2">{t('bookingFailure.priceLabel', 'Preis')}</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-white/5 p-1.5 rounded text-primary">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                    </div>
                                    <p className="text-base font-medium text-slate-200">€{price?.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-4 shadow-inner">
                                <span className="material-symbols-outlined text-red-400 text-xl mt-0.5 shrink-0">error_outline</span>
                                <div>
                                    <p className="text-sm text-red-200 font-semibold mb-1">{t('bookingFailure.reasonLabel', 'Grund der Ablehnung')}</p>
                                    <p className="text-sm text-red-300/80 leading-relaxed">{errorReason}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button 
                        onClick={() => navigate('/reservierung')}
                        className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_35px_rgba(249,115,22,0.5)] transform hover:-translate-y-0.5">
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                        {t('bookingFailure.retryBtn', 'ERNEUT VERSUCHEN')}
                    </button>
                    <button 
                         onClick={() => navigate('/kontakt')}
                        className="flex-1 bg-transparent border border-white/20 hover:border-primary/50 text-slate-300 hover:text-primary font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/5">
                        <span className="material-symbols-outlined text-[20px]">contact_support</span>
                        {t('bookingFailure.helpBtn', 'HILFE ERHALTEN')}
                    </button>
                </div>
            </div>
        </div>
    );
}
