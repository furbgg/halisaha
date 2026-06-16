import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { format, parseISO } from 'date-fns';
import { de, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/common/Logo';
import { 
  COMPANY_NAME,
  COMPANY_SLOGAN,
  ADDRESS_STREET,
  ADDRESS_ZIP,
  ADDRESS_CITY,
  ADDRESS_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_PHONES,
  CONTACT_WEBSITE
} from '../config/brand';

export function BookingTicketPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const bookingId = id || '';

  const dateLocale = i18n.language === 'tr' ? tr : de;

  const [ticketData, setTicketData] = useState({
    date: new Date(),
    fieldName: '',
    customerName: t('common.guest', 'Gast'),
    amount: '€0,00',
    time: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedString = decodeURIComponent(atob(dataParam));
        const decoded = JSON.parse(decodedString);
        setTicketData({
          date: decoded.date ? parseISO(decoded.date) : new Date(),
          fieldName: decoded.fieldName || '',
          customerName: decoded.customerName || t('common.guest', 'Gast'),
          amount: decoded.amount || '€0,00',
          time: decoded.time || ''
        });
      } catch {
      }
    }
  }, [location]);



  return (
    <>
      <style>
        {`
          @media print {
            body {
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
            /* Hide the main app layout elements if they bleed through */
            header, footer, nav {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-display flex flex-col items-center pb-12">
        <div className="no-print bg-white w-full border-b border-gray-200 py-3 px-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-sm">
          <Logo variant="small" inverted />
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              {t('bookingTicketPrint.actions.print', 'PDF Drucken / Speichern')}
            </button>
            <button 
              onClick={() => window.close()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
            >
              {t('bookingTicketPrint.actions.close', 'Schließen')}
            </button>
          </div>
        </div>

        <div 
          className="bg-white mx-auto relative flex flex-col justify-between"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            width: '100%',
            maxWidth: '210mm',
            minHeight: '297mm',
            padding: '40px 50px'
          }}
        >
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-6">
              <div className="flex flex-col">
                <div className="mb-2">
                  <Logo variant="large" inverted className="w-32 h-32" />
                </div>
                <p className="text-sm text-gray-500 font-medium">{COMPANY_SLOGAN}</p>
              </div>
              <div className="sm:text-right">
                <h2 className="text-xl font-light text-gray-800 uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
                  {t('bookingTicketPrint.header.title', 'Buchungsbestätigung')}
                </h2>
                <p className="text-sm text-gray-500">{t('bookingTicketPrint.header.issuedAt', 'Ausgestellt am:')} {format(new Date(), 'dd. MMM, yyyy', { locale: dateLocale })}</p>
              </div>
            </div>

            <div className="mb-10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.reference.title', 'Buchungsreferenz')}</p>
              <p className="text-3xl font-bold text-gray-800 tracking-tight">{t('bookingTicketPrint.reference.id', 'Buchungs-ID:')} #{bookingId}</p>
            </div>

            <hr className="border-t border-gray-200 mb-10"/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.customer', 'Kunde')}</p>
                  <p className="text-lg font-medium text-gray-800">{ticketData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.field', 'Platz')}</p>
                  <p className="text-lg font-medium text-gray-800">{ticketData.fieldName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Outdoor • Beleuchtet</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.date', 'Datum')}</p>
                    <p className="text-lg font-medium text-gray-800">{format(ticketData.date, 'dd. MMM yyyy', { locale: dateLocale })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.time', 'Zeit')}</p>
                    <p className="text-lg font-medium text-gray-800">{ticketData.time}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 md:pl-8 md:border-l border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.status', 'Status')}</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider border border-gray-200">
                    {t('bookingTicketPrint.details.paid', 'Bezahlt')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.total', 'Gesamtbetrag')}</p>
                  <p className="text-2xl font-bold text-gray-800">{ticketData.amount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('bookingTicketPrint.details.tax', 'Inkl. MwSt.')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">{t('bookingTicketPrint.details.paymentMethod', 'Zahlungsmethode')}</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-gray-500">credit_card</span>
                    <p className="text-lg font-medium text-gray-800">{t('bookingTicketPrint.details.creditCard', 'Kreditkarte')}</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-200 mb-12"/>

            <div className="flex flex-col items-center justify-center mb-16">
              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl flex flex-col items-center gap-6 w-full max-w-sm">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <QRCode 
                    value={`${window.location.origin}/reservierung/verwalten/${bookingId}`}
                    size={160}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1f2937"
                  />
                </div>
                <div className="text-center">
                  <p className="text-gray-800 text-sm font-bold uppercase tracking-widest mb-1">{t('bookingTicketPrint.qrCode.title', 'Check-in Code')}</p>
                  <p className="text-gray-500 text-xs font-medium">{t('bookingTicketPrint.qrCode.desc', 'Bitte am Empfang vorzeigen')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <hr className="border-t border-gray-200 mb-6"/>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-sm text-gray-500">
              <div className="space-y-1">
                <p className="font-bold text-gray-800">{COMPANY_NAME}</p>
                <p>{ADDRESS_STREET}</p>
                <p>{ADDRESS_ZIP} {ADDRESS_CITY}, {ADDRESS_COUNTRY}</p>
              </div>
              <div className="space-y-1 md:text-right">
                <p>{t('bookingTicketPrint.footer.tel', 'Tel:')} {CONTACT_PHONES[0]}</p>
                <p>{t('bookingTicketPrint.footer.web', 'Web:')} {CONTACT_WEBSITE}</p>
                <p>{t('bookingTicketPrint.footer.email', 'Email:')} {CONTACT_EMAIL}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400 font-medium italic">{t('bookingTicketPrint.footer.thanks', 'Vielen Dank für deine Buchung! Wir freuen uns auf deinen Besuch.')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
