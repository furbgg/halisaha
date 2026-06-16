import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageTitle } from '../../config/brand';
import { useTranslation, Trans } from 'react-i18next';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import QRCode from 'react-qr-code';

interface Field {
  id: number;
  name: string;
  supportedSports: string[];
  hourlyPrice: number;
  allowedDurations: number[];
  active: boolean;
  openingTime: string;
  closingTime: string;
  weekdayOpening: string | null;
  weekdayClosing: string | null;
  weekendOpening: string | null;
  weekendClosing: string | null;
}

interface AppSetting {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string | null;
}

interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

import { AdminSpielfelder } from '../../components/admin/AdminSpielfelder';

const getDays = (t: any) => [t('adminSettings.days.monday', 'Montag'), t('adminSettings.days.tuesday', 'Dienstag'), t('adminSettings.days.wednesday', 'Mittwoch'), t('adminSettings.days.thursday', 'Donnerstag'), t('adminSettings.days.friday', 'Freitag'), t('adminSettings.days.saturday', 'Samstag'), t('adminSettings.days.sunday', 'Sonntag')];

export function AdminEinstellungen() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string; enabled: boolean }>>({}); 

  const [holdDuration, setHoldDuration] = useState('15');
  const [cancellationDeadline, setCancellationDeadline] = useState('24');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [happyHourEnabled, setHappyHourEnabled] = useState(false);
  const [happyHourStart, setHappyHourStart] = useState('10:00');
  const [happyHourEnd, setHappyHourEnd] = useState('14:00');
  const [happyHourDiscount, setHappyHourDiscount] = useState('15');

  const [editedFields, setEditedFields] = useState<Record<number, Partial<Field>>>({});

  const [sportPrices, setSportPrices] = useState({
    football: '80',
    bubble: '160',
    tennis: '0',
    basketball: '0',
    volleyball: '0'
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailConfirmation, setEmailConfirmation] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [emailCancellation, setEmailCancellation] = useState(true);
  const [waEnabled, setWaEnabled] = useState(false);
  const [waApiToken, setWaApiToken] = useState('');
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waMsgConfirmationEnabled, setWaMsgConfirmationEnabled] = useState(true);
  const [waMsgCancellationEnabled, setWaMsgCancellationEnabled] = useState(true);
  const [waMsgModificationEnabled, setWaMsgModificationEnabled] = useState(true);
  const [waMsgCouponEnabled, setWaMsgCouponEnabled] = useState(false);
  const [waMsgConfirmationText, setWaMsgConfirmationText] = useState('Hallo {name}! ✅ Ihre Reservierung ist bestätigt.\n\n📋 Buchungs-Nr: {code}\n⚽ Platz: {field}\n📅 Datum: {date}\n🕐 Zeit: {time}\n💰 Preis: {price} €\n\nWir freuen uns auf Sie! ⚽');
  const [waMsgCancellationText, setWaMsgCancellationText] = useState('Hallo {name}, Ihre Reservierung wurde storniert.\n\n📋 Buchungs-Nr: {code}\n⚽ Platz: {field}\n📅 Datum: {date}\n\nFalls dies ein Fehler war, kontaktieren Sie uns bitte.');
  const [waMsgModificationText, setWaMsgModificationText] = useState('Hallo {name}, Ihre Reservierung wurde geändert.\n\n📋 Buchungs-Nr: {code}\n⚽ Platz: {field}\n📅 Neues Datum: {date}\n🕐 Neue Zeit: {time}\n\nVielen Dank!');
  const [waMsgCouponText, setWaMsgCouponText] = useState('🎉 Hallo {name}! Sie haben einen Gutschein eingelöst!\n\n🎫 Gutschein: {code}\n💰 Ersparnis: {price} €\n\nVielen Dank für Ihre Buchung!');
  const [adminDailyReport, setAdminDailyReport] = useState(true);
  const [adminNewBooking, setAdminNewBooking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDailyReportHour, setAdminDailyReportHour] = useState('23');
  const [sysSecurityAlerts, setSysSecurityAlerts] = useState(true);
  const [sysMaintenanceAlerts, setSysMaintenanceAlerts] = useState(true);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '0',
    minOrderAmount: '0', validFrom: '', validUntil: '', active: true
  });
  const [couponError, setCouponError] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);

  interface Session { id: number; deviceInfo: string; ipAddress: string; createdAt: string; lastUsedAt: string; current: boolean; }
  const [secCurrentPw, setSecCurrentPw] = useState('');
  const [secNewPw, setSecNewPw] = useState('');
  const [secConfirmPw, setSecConfirmPw] = useState('');
  const [secPwError, setSecPwError] = useState('');
  const [secPwSuccess, setSecPwSuccess] = useState('');
  const [secPwSaving, setSecPwSaving] = useState(false);
  const [secSessions, setSecSessions] = useState<Session[]>([]);
  const [secSessionsLoading, setSecSessionsLoading] = useState(false);
  const [sec2faEnabled, setSec2faEnabled] = useState(false);
  const [sec2faLoading, setSec2faLoading] = useState(false);
  const [sec2faQr, setSec2faQr] = useState('');
  const [sec2faSecret, setSec2faSecret] = useState('');
  const [sec2faCode, setSec2faCode] = useState('');
  const [sec2faShowModal, setSec2faShowModal] = useState(false);
  const [sec2faError, setSec2faError] = useState('');

  const fetch2faStatus = async () => {
    try {
      const res = await api.get('/admin/2fa/status');
      setSec2faEnabled(res.data?.data?.enabled ?? false);
    } catch { /* ignore */ }
  };

  const handle2faToggle = async () => {
    if (sec2faEnabled) {
      setSec2faLoading(true);
      try {
        await api.delete('/auth/2fa');
        setSec2faEnabled(false);
      } catch { /* ignore */ }
      setSec2faLoading(false);
    } else {
      setSec2faLoading(true);
      setSec2faError('');
      try {
        const res = await api.get('/auth/2fa/setup');
        setSec2faQr(res.data?.data?.qrCodeUri ?? '');
        setSec2faSecret(res.data?.data?.secret ?? '');
        setSec2faShowModal(true);
      } catch { setSec2faError(t('adminSettings.errors.twoFAError', '2FA konnte nicht eingerichtet werden.')); }
      setSec2faLoading(false);
    }
  };

  const handle2faVerify = async () => {
    setSec2faLoading(true);
    setSec2faError('');
    try {
      await api.post('/auth/2fa/verify', { code: parseInt(sec2faCode) });
      setSec2faEnabled(true);
      setSec2faShowModal(false);
      setSec2faCode('');
    } catch {
      setSec2faError(t('adminSettings.errors.twoFAInvalid', 'Ungültiger Code. Bitte erneut versuchen.'));
    }
    setSec2faLoading(false);
  };

  const fetchSessions = async () => {
    setSecSessionsLoading(true);
    try {
      const res = await api.get('/admin/sessions');
      setSecSessions(res.data?.data ?? []);
    } catch { setSecSessions([]); }
    setSecSessionsLoading(false);
  };

  const handleChangePassword = async () => {
    setSecPwError(''); setSecPwSuccess('');
    if (!secCurrentPw || !secNewPw || !secConfirmPw) { setSecPwError(t('adminSettings.errors.pwFillAll', 'Bitte alle Felder ausfüllen.')); return; }
    if (secNewPw.length < 8) { setSecPwError(t('adminSettings.errors.pwLength', 'Neues Passwort muss mindestens 8 Zeichen haben.')); return; }
    if (secNewPw !== secConfirmPw) { setSecPwError(t('adminSettings.errors.pwMismatch', 'Passwörter stimmen nicht überein.')); return; }
    setSecPwSaving(true);
    try {
      await api.put('/admin/password', { currentPassword: secCurrentPw, newPassword: secNewPw });
      setSecPwSuccess(t('adminSettings.errors.pwSuccess', 'Passwort erfolgreich geändert!'));
      setSecCurrentPw(''); setSecNewPw(''); setSecConfirmPw('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('adminSettings.errors.pwError', 'Fehler beim Ändern des Passworts.');
      setSecPwError(msg);
    }
    setSecPwSaving(false);
  };

  const handleRevokeSession = async (id: number) => {
    try {
      await api.delete(`/admin/sessions/${id}`);
      fetchSessions();
    } catch { /* ignore */ }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await api.delete('/admin/sessions/others');
      fetchSessions();
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (activeTab === 3) { fetchSessions(); fetch2faStatus(); }
  }, [activeTab]);

  useEffect(() => {
    fetchAll();
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data || []);
    } catch {
    }
  };

  const handleCouponSubmit = async () => {
    try {
      setCouponSaving(true);
      setCouponError('');
      const body = {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue) || 0,
        maxUses: parseInt(couponForm.maxUses) || 0,
        minOrderAmount: parseFloat(couponForm.minOrderAmount) || 0,
        validFrom: couponForm.validFrom ? new Date(couponForm.validFrom).toISOString() : null,
        validUntil: couponForm.validUntil ? new Date(couponForm.validUntil).toISOString() : null,
        active: couponForm.active,
      };
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, body);
      } else {
        await api.post('/admin/coupons', body);
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      await fetchCoupons();
    } catch (err: any) {
      setCouponError(err.response?.data?.message || t('adminSettings.errors.couponSaveError', 'Fehler beim Speichern'));
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm(t('adminSettings.coupons.deleteConfirm', 'Gutschein wirklich löschen?'))) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      await fetchCoupons();
    } catch (err) {
    }
  };

  const handleToggleCoupon = async (id: number) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      await fetchCoupons();
    } catch {
    }
  };

  const openCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: '0', minOrderAmount: '0', validFrom: '', validUntil: '', active: true });
    setCouponError('');
    setShowCouponModal(true);
  };

  const openEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      maxUses: String(c.maxUses),
      minOrderAmount: String(c.minOrderAmount),
      validFrom: c.validFrom ? c.validFrom.substring(0, 16) : '',
      validUntil: c.validUntil ? c.validUntil.substring(0, 16) : '',
      active: c.active,
    });
    setCouponError('');
    setShowCouponModal(true);
  };

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [fieldsRes, settingsRes] = await Promise.all([
        api.get('/fields'),
        api.get('/admin/settings'),
      ]);
      const fieldsData: Field[] = fieldsRes.data.data;
      const settingsData: AppSetting[] = settingsRes.data.data;

      setFields(fieldsData);

      const settingsMap: Record<string, string> = {};
      settingsData.forEach(s => { settingsMap[s.key] = s.value; });
      setSettings(settingsMap);

      setHoldDuration(settingsMap['hold_duration_minutes'] || '15');
      setCancellationDeadline(settingsMap['cancellation_deadline_hours'] || '48');
      setReminderEnabled(settingsMap['reminder_enabled'] !== 'false');
      setHappyHourEnabled(settingsMap['happy_hour_enabled'] === 'true');
      setHappyHourStart(settingsMap['happy_hour_start'] || '10:00');
      setHappyHourEnd(settingsMap['happy_hour_end'] || '14:00');
      setHappyHourDiscount(settingsMap['happy_hour_discount'] || '15');

      setSportPrices({
        football: settingsMap['price_football'] || '80',
        bubble: settingsMap['price_bubble_soccer'] || '160',
        tennis: settingsMap['price_tennis'] || '0',
        basketball: settingsMap['price_basketball'] || '0',
        volleyball: settingsMap['price_volleyball'] || '0',
      });

      setEmailEnabled(settingsMap['email_notifications_enabled'] !== 'false');
      setEmailConfirmation(settingsMap['email_confirmation_enabled'] !== 'false');
      setEmailReminder(settingsMap['email_reminder_enabled'] !== 'false');
      setEmailCancellation(settingsMap['email_cancellation_enabled'] !== 'false');
      setWaEnabled(settingsMap['whatsapp_enabled'] === 'true');
      setWaApiToken(settingsMap['whatsapp_api_token'] || '');
      setWaPhoneId(settingsMap['whatsapp_phone_number_id'] || '');
      setWaMsgConfirmationEnabled(settingsMap['wa_msg_confirmation_enabled'] !== 'false');
      setWaMsgCancellationEnabled(settingsMap['wa_msg_cancellation_enabled'] !== 'false');
      setWaMsgModificationEnabled(settingsMap['wa_msg_modification_enabled'] !== 'false');
      setWaMsgCouponEnabled(settingsMap['wa_msg_coupon_enabled'] === 'true');
      if (settingsMap['wa_msg_confirmation_text']) setWaMsgConfirmationText(settingsMap['wa_msg_confirmation_text']);
      if (settingsMap['wa_msg_cancellation_text']) setWaMsgCancellationText(settingsMap['wa_msg_cancellation_text']);
      if (settingsMap['wa_msg_modification_text']) setWaMsgModificationText(settingsMap['wa_msg_modification_text']);
      if (settingsMap['wa_msg_coupon_text']) setWaMsgCouponText(settingsMap['wa_msg_coupon_text']);
      setAdminDailyReport(settingsMap['admin_daily_report'] !== 'false');
      setAdminNewBooking(settingsMap['admin_new_booking'] !== 'false');
      setAdminEmail(settingsMap['admin_email'] || '');
      setAdminDailyReportHour(settingsMap['admin_daily_report_hour'] || '23');
      setSysSecurityAlerts(settingsMap['sys_security_alerts'] !== 'false');
      setSysMaintenanceAlerts(settingsMap['sys_maintenance_alerts'] !== 'false');

      if (fieldsData.length > 0) {
        const f = fieldsData[0];
        const hours: Record<string, { open: string; close: string; enabled: boolean }> = {};
        getDays(t).forEach((day, i) => {
          const isWeekend = i >= 4;
          hours[day] = {
            open: isWeekend ? (f.weekendOpening || f.openingTime || '12:00') : (f.weekdayOpening || f.openingTime || '16:30'),
            close: isWeekend ? (f.weekendClosing || f.closingTime || '01:30') : (f.weekdayClosing || f.closingTime || '00:00'),
            enabled: true,
          };
        });
        setOpeningHours(hours);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldPriceChange = (fieldId: number, key: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], [key]: key === 'hourlyPrice' ? parseFloat(value) || 0 : value },
    }));
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');

      const settingsToSave: Record<string, string> = {
        hold_duration_minutes: holdDuration,
        cancellation_deadline_hours: cancellationDeadline,
        reminder_enabled: String(reminderEnabled),
        happy_hour_enabled: String(happyHourEnabled),
        happy_hour_start: happyHourStart,
        happy_hour_end: happyHourEnd,
        happy_hour_discount: happyHourDiscount,
        price_football: sportPrices.football,
        price_bubble_soccer: sportPrices.bubble,
        price_tennis: sportPrices.tennis,
        price_basketball: sportPrices.basketball,
        price_volleyball: sportPrices.volleyball,
        email_notifications_enabled: String(emailEnabled),
        email_confirmation_enabled: String(emailConfirmation),
        email_reminder_enabled: String(emailReminder),
        email_cancellation_enabled: String(emailCancellation),
        whatsapp_enabled: String(waEnabled),
        whatsapp_api_token: waApiToken,
        whatsapp_phone_number_id: waPhoneId,
        wa_msg_confirmation_enabled: String(waMsgConfirmationEnabled),
        wa_msg_cancellation_enabled: String(waMsgCancellationEnabled),
        wa_msg_modification_enabled: String(waMsgModificationEnabled),
        wa_msg_coupon_enabled: String(waMsgCouponEnabled),
        wa_msg_confirmation_text: waMsgConfirmationText,
        wa_msg_cancellation_text: waMsgCancellationText,
        wa_msg_modification_text: waMsgModificationText,
        wa_msg_coupon_text: waMsgCouponText,
        admin_daily_report: String(adminDailyReport),
        admin_new_booking: String(adminNewBooking),
        admin_email: adminEmail,
        admin_daily_report_hour: adminDailyReportHour,
        sys_security_alerts: String(sysSecurityAlerts),
        sys_maintenance_alerts: String(sysMaintenanceAlerts),
      };

      const settingsPromises = Object.entries(settingsToSave).map(([key, value]) =>
        api.put(`/admin/settings/${key}`, { value })
      );

      const fieldPromises = Object.entries(editedFields).map(([id, changes]) => {
        const field = fields.find(f => f.id === Number(id));
        if (!field) return Promise.resolve();
        return api.put(`/admin/fields/${id}`, { ...field, ...changes });
      });

      const hourPromises = fields.map(f => {
        const weekdayOpen = openingHours['Montag']?.open || f.openingTime;
        const weekdayClose = openingHours['Montag']?.close || f.closingTime;
        const weekendOpen = openingHours['Freitag']?.open || f.openingTime;
        const weekendClose = openingHours['Freitag']?.close || f.closingTime;
        return api.put(`/admin/fields/${f.id}`, {
          ...f,
          ...editedFields[f.id],
          weekdayOpening: weekdayOpen,
          weekdayClosing: weekdayClose,
          weekendOpening: weekendOpen,
          weekendClosing: weekendClose,
        });
      });

      await Promise.all([...settingsPromises, ...fieldPromises, ...hourPromises]);
      setSaveMessage(t('adminSettings.saveBar.successMsg', 'Einstellungen erfolgreich gespeichert!'));
      await fetchAll();
    } catch {
      setSaveMessage(t('adminSettings.saveBar.saveError', 'Fehler beim Speichern.'));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const getFieldIcon = (type: string) => {
    return type === 'BUBBLE' ? 'sports_handball' : 'sports_soccer';
  };

  const getFieldTypeLabel = (type: string) => {
    return type === 'BUBBLE' ? 'Indoor Special' : 'Outdoor Synthetic';
  };

  const getFieldPrice = (field: Field) => {
    if (editedFields[field.id]?.hourlyPrice !== undefined) return editedFields[field.id].hourlyPrice!;
    return field.hourlyPrice;
  };

  const tabs = [
    { icon: 'stadium', label: t('adminSettings.tabs.fields', 'Saha-Einstellungen') },
    { icon: 'person', label: t('adminSettings.tabs.staff', 'Personal-Einstellungen') },
    { icon: 'business', label: t('adminSettings.tabs.company', 'Unternehmensdaten') },
    { icon: 'shield', label: t('adminSettings.tabs.security', 'Sicherheit') },
    { icon: 'notifications', label: t('adminSettings.tabs.notifications', 'Benachrichtigungen') },
    { icon: 'confirmation_number', label: t('adminSettings.tabs.coupons', 'Gutscheine') },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="inline-block h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle(t('adminSettings.title'))}</title>
      </Helmet>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="container mx-auto max-w-5xl px-6 py-8 pb-32">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{t('adminSettings.title')}</h1>
              <p className="text-slate-400 font-medium">{t('adminSettings.desc')}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-surface-dark/50">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">{t('adminSettings.online')}</span>
            </div>
          </div>

          <div className="mb-8 border-b border-white/10">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
              {tabs.map((tab, i) => (
                <li key={i} className="me-2" role="presentation">
                  <button
                    onClick={() => setActiveTab(i)}
                    className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg transition-all ${activeTab === i ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-white hover:border-white/10'}`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {activeTab === 0 && (
            <div id="settings-content">

              <section className="mb-10">
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">schedule</span>
                      <h2 className="text-xl font-bold text-white">{t('adminSettings.fields.hoursTitle')}</h2>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-white/5 text-slate-400">
                        <tr>
                          <th className="px-6 py-4 font-bold tracking-wider" scope="col">{t('adminSettings.fields.table.day')}</th>
                          <th className="px-6 py-4 font-bold tracking-wider w-48" scope="col">{t('adminSettings.fields.table.open')}</th>
                          <th className="px-6 py-4 font-bold tracking-wider w-48" scope="col">{t('adminSettings.fields.table.close')}</th>
                          <th className="px-6 py-4 font-bold tracking-wider text-center w-24" scope="col">{t('adminSettings.fields.table.status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {getDays(t).map((day, i) => {
                          const h = openingHours[day] || { open: '16:30', close: '00:00', enabled: true };
                          const isWeekend = i >= 5;
                          return (
                            <tr key={day} className={`hover:bg-white/5 transition-colors ${isWeekend ? 'bg-surface-dark/30' : ''}`}>
                              <td className={`px-6 py-4 font-medium ${isWeekend ? 'text-primary font-bold' : 'text-white'}`}>{day}</td>
                              <td className="px-6 py-4">
                                <input
                                  className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                                  type="time"
                                  value={h.open}
                                  onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                                  type="time"
                                  value={h.close}
                                  onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                                />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={h.enabled}
                                    onChange={e => setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: e.target.checked } }))}
                                  />
                                  <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <AdminSpielfelder 
                 fields={fields} 
                 onFieldsChange={fetchAll} 
              />

              <section className="mb-10">
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 border-l-4 border-l-primary">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">celebration</span>
                        <h3 className="text-lg font-bold text-white">{t('adminSettings.fields.happyHourTitle')}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{t('adminSettings.fields.happyHourDesc')}</p>
                      <label className="inline-flex items-center cursor-pointer mb-2">
                        <input
                          className="sr-only peer"
                          type="checkbox"
                          checked={happyHourEnabled}
                          onChange={e => setHappyHourEnabled(e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        <span className="ms-3 text-sm font-medium text-white">{t('adminSettings.fields.happyHourEnable')}</span>
                      </label>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminSettings.fields.startTime')}</label>
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                          type="time"
                          value={happyHourStart}
                          onChange={e => setHappyHourStart(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminSettings.fields.endTime')}</label>
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                          type="time"
                          value={happyHourEnd}
                          onChange={e => setHappyHourEnd(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminSettings.fields.discount')}</label>
                        <div className="relative">
                          <input
                            className="bg-background-dark border border-white/10 text-primary font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                            type="number"
                            value={happyHourDiscount}
                            onChange={e => setHappyHourDiscount(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-400">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <h2 className="text-xl font-bold text-white">{t('adminSettings.fields.pricingBySport', 'Pricing (By Sport Type)')}</h2>
                </div>
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <p className="text-sm text-slate-400 mb-6">{t('adminSettings.fields.pricingBySportDesc', 'Set default hourly rates for different sport types here. These prices will automatically be applied based on the duration when booking a specific sport.')}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-bold text-white flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary text-sm">sports_soccer</span>
                         {t('adminSettings.fields.sports.football', 'Fußball (pro Stunde)')}
                      </label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={sportPrices.football}
                          onChange={e => setSportPrices(prev => ({ ...prev, football: e.target.value }))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-bold text-white flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary text-sm">sports_handball</span>
                         {t('adminSettings.fields.sports.bubbleSoccer', 'Bubble Soccer (pro Stunde)')}
                      </label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={sportPrices.bubble}
                          onChange={e => setSportPrices(prev => ({ ...prev, bubble: e.target.value }))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-bold text-white flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary text-sm">sports_tennis</span>
                         {t('adminSettings.fields.sports.tennis', 'Tennis (pro Stunde)')}
                      </label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={sportPrices.tennis}
                          onChange={e => setSportPrices(prev => ({ ...prev, tennis: e.target.value }))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-bold text-white flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary text-sm">sports_basketball</span>
                         {t('adminSettings.fields.sports.basketball', 'Basketball (pro Stunde)')}
                      </label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={sportPrices.basketball}
                          onChange={e => setSportPrices(prev => ({ ...prev, basketball: e.target.value }))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-2 text-sm font-bold text-white flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary text-sm">sports_volleyball</span>
                         {t('adminSettings.fields.sports.volleyball', 'Volleyball (pro Stunde)')}
                      </label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={sportPrices.volleyball}
                          onChange={e => setSportPrices(prev => ({ ...prev, volleyball: e.target.value }))}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-24">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="material-symbols-outlined text-primary">rule_settings</span>
                  <h2 className="text-xl font-bold text-white">{t('adminSettings.fields.rulesTitle')}</h2>
                </div>
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.holdDuration')}</label>
                      <p className="text-xs text-slate-400 mb-3 min-h-[32px]">{t('adminSettings.fields.holdDesc')}</p>
                      <div className="mt-auto relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-12"
                          type="number"
                          value={holdDuration}
                          onChange={e => setHoldDuration(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400 text-xs">MIN</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.cancelDeadline')}</label>
                      <p className="text-xs text-slate-400 mb-3 min-h-[32px]">{t('adminSettings.fields.cancelDesc')}</p>
                      <div className="mt-auto relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-12"
                          type="number"
                          value={cancellationDeadline}
                          onChange={e => setCancellationDeadline(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400 text-xs">STD</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.fields.notifications')}</label>
                      <p className="text-xs text-slate-400 mb-3 min-h-[32px]">{t('adminSettings.fields.notifDesc')}</p>
                      <div className="mt-auto flex items-center justify-between p-3 rounded-lg border border-white/10 bg-surface-dark/50">
                        <span className="text-sm font-medium text-white">{t('adminSettings.fields.reminders')}</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={reminderEnabled}
                            onChange={e => setReminderEnabled(e.target.checked)}
                          />
                          <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 5 && (
            <div id="gutscheine-content">
              <section className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">confirmation_number</span>
                    <h2 className="text-xl font-bold text-white">{t('adminSettings.coupons.title')}</h2>
                  </div>
                  <button
                    onClick={openCreateCoupon}
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,68,0,0.2)]"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Neuer Gutschein
                  </button>
                </div>

                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 font-bold">{t('adminSettings.coupons.table.code')}</th>
                          <th className="px-6 py-4 font-bold">{t('adminSettings.coupons.table.discount')}</th>
                          <th className="px-6 py-4 font-bold">{t('adminSettings.coupons.table.minOrder')}</th>
                          <th className="px-6 py-4 font-bold">{t('adminSettings.coupons.table.validity')}</th>
                          <th className="px-6 py-4 font-bold">{t('adminSettings.coupons.table.uses')}</th>
                          <th className="px-6 py-4 font-bold text-right">Status</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {coupons.length === 0 && (
                          <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">{t('adminSettings.coupons.noCoupons')}</td></tr>
                        )}
                        {coupons.map(c => {
                          const isExpired = new Date(c.validUntil) < new Date();
                          const usagePercent = c.maxUses > 0 ? Math.min(100, (c.currentUses / c.maxUses) * 100) : 0;
                          return (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-mono font-bold text-white bg-background-dark px-2 py-1 rounded border border-white/10">{c.code}</span>
                              </td>
                              <td className="px-6 py-4 text-white">
                                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Rabatt` : `€ ${c.discountValue.toFixed(2)}`}
                              </td>
                              <td className="px-6 py-4 text-slate-400">€ {c.minOrderAmount.toFixed(2)}</td>
                              <td className="px-6 py-4 text-slate-400">
                                {isExpired ? (
                                  <span className="text-red-400">{t('adminSettings.coupons.expired')}</span>
                                ) : (
                                  <span>{format(parseISO(c.validUntil), 'dd. MMM yyyy', { locale: de })}</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-white">{c.currentUses}/{c.maxUses === 0 ? '∞' : c.maxUses}</span>
                                  {c.maxUses > 0 && (
                                    <div className="w-24 h-1.5 bg-background-dark rounded-full overflow-hidden">
                                      <div className={`h-full ${c.active ? 'bg-primary' : 'bg-slate-600'}`} style={{ width: `${usagePercent}%` }} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleToggleCoupon(c.id)}>
                                  {c.active ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">{t('adminSettings.coupons.active')}</span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-dark text-slate-400 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">{t('adminSettings.coupons.inactive')}</span>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex gap-1 justify-end">
                                  <button onClick={() => openEditCoupon(c)} className="text-slate-400 hover:text-white p-1 transition-colors" title={t('adminSettings.coupons.edit')}>
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteCoupon(c.id)} className="text-slate-400 hover:text-red-400 p-1 transition-colors" title={t('adminSettings.coupons.delete')}>
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 4 && (
            <div id="benachrichtigungen-content">
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="material-symbols-outlined text-primary">mark_email_read</span>
                  <h2 className="text-xl font-bold text-white">{t('adminSettings.notifications.clientTitle')}</h2>
                </div>
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark/40 border border-white/5 hover:bg-surface-dark/60 transition-colors">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-white font-bold">{t('adminSettings.notifications.emailSettings')}</h3>
                        <p className="text-sm text-slate-400">{t('adminSettings.notifications.emailDesc')}</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" checked={emailEnabled} onChange={e => setEmailEnabled(e.target.checked)} />
                        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                    <div className={`space-y-4 ${!emailEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark/40 border border-white/5 hover:bg-surface-dark/60 transition-colors">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.emailConfirm')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.emailConfirmDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={emailConfirmation} onChange={e => setEmailConfirmation(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark/40 border border-white/5 hover:bg-surface-dark/60 transition-colors">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.emailReminder')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.emailReminderDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={emailReminder} onChange={e => setEmailReminder(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark/40 border border-white/5 hover:bg-surface-dark/60 transition-colors">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.emailCancel')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.emailCancelDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={emailCancellation} onChange={e => setEmailCancellation(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="material-symbols-outlined text-primary">chat</span>
                  <h2 className="text-xl font-bold text-white">{t('adminSettings.notifications.waTitle')}</h2>
                </div>
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 border-l-4 border-l-green-600">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{t('adminSettings.notifications.waEnable')}</span>
                          <span className="bg-green-900/40 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-800">BETA</span>
                        </div>
                        <p className="text-sm text-slate-400">{t('adminSettings.notifications.waDesc')}</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" checked={waEnabled} onChange={e => setWaEnabled(e.target.checked)} />
                        <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                      </label>
                    </div>

                    <div className={`${!waEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="pt-6 border-t border-white/10">
                        <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.notifications.waKey')}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3.5 pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">key</span>
                          </div>
                          <input
                            className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full ps-10 p-2.5 placeholder-slate-500 font-mono"
                            placeholder="EAAxxxxxxx..."
                            type="password"
                            value={waApiToken}
                            onChange={e => setWaApiToken(e.target.value)}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{t('adminSettings.notifications.waKeyDesc')}</p>
                      </div>

                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-bold text-white">{t('adminSettings.notifications.waPhoneId')}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3.5 pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">phone</span>
                          </div>
                          <input
                            className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-green-600 focus:border-green-600 block w-full ps-10 p-2.5 placeholder-slate-500 font-mono"
                            placeholder="1234567890"
                            value={waPhoneId}
                            onChange={e => setWaPhoneId(e.target.value)}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{t('adminSettings.notifications.waPhoneDesc')}</p>
                      </div>

                      <div className="mt-8 space-y-6">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                          Nachrichtenvorlagen
                        </h3>
                        <p className="text-xs text-slate-500 -mt-4">Platzhalter: <code className="text-primary/80">{'{name}'}</code> <code className="text-primary/80">{'{field}'}</code> <code className="text-primary/80">{'{date}'}</code> <code className="text-primary/80">{'{time}'}</code> <code className="text-primary/80">{'{code}'}</code> <code className="text-primary/80">{'{price}'}</code></p>

                        <div className="p-4 rounded-lg bg-surface-dark/40 border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                              <span className="text-white font-bold">{t('adminSettings.notifications.confirmTpl')}</span>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input className="sr-only peer" type="checkbox" checked={waMsgConfirmationEnabled} onChange={e => setWaMsgConfirmationEnabled(e.target.checked)} />
                              <div className="relative w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                            </label>
                          </div>
                          <textarea
                            className="w-full bg-background-dark border border-white/10 text-white rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs leading-relaxed"
                            rows={5}
                            value={waMsgConfirmationText}
                            onChange={e => setWaMsgConfirmationText(e.target.value)}
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-surface-dark/40 border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-red-400 text-lg">cancel</span>
                              <span className="text-white font-bold">{t('adminSettings.notifications.cancelTpl')}</span>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input className="sr-only peer" type="checkbox" checked={waMsgCancellationEnabled} onChange={e => setWaMsgCancellationEnabled(e.target.checked)} />
                              <div className="relative w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                            </label>
                          </div>
                          <textarea
                            className="w-full bg-background-dark border border-white/10 text-white rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs leading-relaxed"
                            rows={5}
                            value={waMsgCancellationText}
                            onChange={e => setWaMsgCancellationText(e.target.value)}
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-surface-dark/40 border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-yellow-400 text-lg">edit_calendar</span>
                              <span className="text-white font-bold">{t('adminSettings.notifications.modTpl')}</span>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input className="sr-only peer" type="checkbox" checked={waMsgModificationEnabled} onChange={e => setWaMsgModificationEnabled(e.target.checked)} />
                              <div className="relative w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                            </label>
                          </div>
                          <textarea
                            className="w-full bg-background-dark border border-white/10 text-white rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs leading-relaxed"
                            rows={5}
                            value={waMsgModificationText}
                            onChange={e => setWaMsgModificationText(e.target.value)}
                          />
                        </div>

                        <div className="p-4 rounded-lg bg-surface-dark/40 border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-lg">confirmation_number</span>
                              <span className="text-white font-bold">{t('adminSettings.notifications.couponTpl')}</span>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input className="sr-only peer" type="checkbox" checked={waMsgCouponEnabled} onChange={e => setWaMsgCouponEnabled(e.target.checked)} />
                              <div className="relative w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600" />
                            </label>
                          </div>
                          <textarea
                            className="w-full bg-background-dark border border-white/10 text-white rounded-lg p-3 placeholder-slate-500 focus:ring-green-600 focus:border-green-600 min-h-[120px] resize-y font-mono text-xs leading-relaxed"
                            rows={5}
                            value={waMsgCouponText}
                            onChange={e => setWaMsgCouponText(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <section>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <span className="material-symbols-outlined text-primary">assessment</span>
                    <h2 className="text-xl font-bold text-white">{t('adminSettings.notifications.adminReports')}</h2>
                  </div>
                  <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 h-full">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 pr-4">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.dailyRev')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.dailyRevDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={adminDailyReport} onChange={e => setAdminDailyReport(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 pr-4">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.newBooking')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.newBookingDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={adminNewBooking} onChange={e => setAdminNewBooking(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div>
                        <label className="block text-white font-bold mb-1">Admin E-Mail-Adresse</label>
                        <p className="text-sm text-slate-400 mb-2">Tagesberichte und Benachrichtigungen werden an diese Adresse gesendet.</p>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="h-px bg-white/5" />
                      <div>
                        <label className="block text-white font-bold mb-1">Tagesbericht Uhrzeit</label>
                        <p className="text-sm text-slate-400 mb-2">Wann soll der tägliche Bericht gesendet werden?</p>
                        <select
                          value={adminDailyReportHour}
                          onChange={e => setAdminDailyReportHour(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={String(i)} className="bg-[#111a0e] text-white">
                              {String(i).padStart(2, '0')}:00 Uhr
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <span className="material-symbols-outlined text-primary">dns</span>
                    <h2 className="text-xl font-bold text-white">{t('adminSettings.notifications.sysAlerts')}</h2>
                  </div>
                  <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 h-full border-l-4 border-l-red-500">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 pr-4">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.secAlerts')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.secAlertsDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={sysSecurityAlerts} onChange={e => setSysSecurityAlerts(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 pr-4">
                          <h3 className="text-white font-bold">{t('adminSettings.notifications.maintAlerts')}</h3>
                          <p className="text-sm text-slate-400">{t('adminSettings.notifications.maintAlertsDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" checked={sysMaintenanceAlerts} onChange={e => setSysMaintenanceAlerts(e.target.checked)} />
                          <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <div className="glass-panel rounded-xl h-full">
                  <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/2">
                    <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">admin_panel_settings</span>
                    <h2 className="text-xl font-bold text-white">{t('adminSettings.security.adminSec')}</h2>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-base">lock_reset</span>
                        Passwort ändern
                      </h3>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-400">{t('adminSettings.security.currentPw')}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                            <span className="material-symbols-outlined text-lg">key</span>
                          </span>
                          <input
                            type="password"
                            className="bg-[#0d1208] border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 placeholder-gray-600"
                            placeholder="••••••••"
                            value={secCurrentPw}
                            onChange={e => setSecCurrentPw(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-400">{t('adminSettings.security.newPw')}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                            <span className="material-symbols-outlined text-lg">lock</span>
                          </span>
                          <input
                            type="password"
                            className="bg-[#0d1208] border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 placeholder-gray-600"
                            placeholder="••••••••"
                            value={secNewPw}
                            onChange={e => setSecNewPw(e.target.value)}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">info</span>
                          Mindestens 8 Zeichen, inkl. Sonderzeichen
                        </p>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-400">{t('adminSettings.security.confirmPw')}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                            <span className="material-symbols-outlined text-lg">lock_clock</span>
                          </span>
                          <input
                            type="password"
                            className="bg-[#0d1208] border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 placeholder-gray-600"
                            placeholder="••••••••"
                            value={secConfirmPw}
                            onChange={e => setSecConfirmPw(e.target.value)}
                          />
                        </div>
                      </div>
                      {secPwError && <p className="text-red-400 text-xs">{secPwError}</p>}
                      {secPwSuccess && <p className="text-green-400 text-xs">{secPwSuccess}</p>}
                      <button
                        onClick={handleChangePassword}
                        disabled={secPwSaving}
                        className="w-full py-2.5 mt-2 text-sm font-bold text-[#0d1208] bg-slate-300 rounded hover:bg-white transition-colors disabled:opacity-50"
                      >
                        {secPwSaving ? t('adminSettings.saveBar.saving') : t('adminSettings.security.password.submit', 'Passwort aktualisieren')}
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-white font-bold text-base">{t('adminSettings.security.twoFactor')}</h3>
                          <p className="text-xs text-slate-500 max-w-xs">{t('adminSettings.security.twoFactorDesc')}</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={sec2faEnabled}
                            onChange={handle2faToggle}
                            disabled={sec2faLoading}
                          />
                          <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      {sec2faError && <p className="text-red-400 text-xs mt-2">{sec2faError}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {sec2faShowModal && (
                <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSec2faShowModal(false)}>
                  <div className="glass-panel rounded-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">qr_code_2</span>
                      2FA einrichten
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{t('adminSettings.security.scanQr')}</p>
                    {sec2faQr && (
                      <div className="flex justify-center mb-4 bg-white rounded-lg p-3">
                        <QRCode value={sec2faQr} size={192} bgColor="#ffffff" fgColor="#000000" />
                      </div>
                    )}
                    {sec2faSecret && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">{t('adminSettings.security.manualEntry')}</p>
                        <code className="block bg-[#0d1208] border border-white/10 rounded p-2 text-xs text-primary font-mono break-all">{sec2faSecret}</code>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-slate-400">{t('adminSettings.security.sixDigitCode')}</label>
                      <input
                        type="text"
                        className="bg-[#0d1208] border border-white/10 text-white rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 text-center tracking-[0.5em] font-mono text-lg"
                        placeholder="000000"
                        maxLength={6}
                        value={sec2faCode}
                        onChange={e => setSec2faCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    {sec2faError && <p className="text-red-400 text-xs mb-3">{sec2faError}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => setSec2faShowModal(false)} className="flex-1 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">{t('adminSettings.security.cancel')}</button>
                      <button
                        onClick={handle2faVerify}
                        disabled={sec2faCode.length !== 6 || sec2faLoading}
                        className="flex-1 py-2 text-sm font-bold bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {sec2faLoading ? t('adminSettings.security.verifying') : 'Aktivieren'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <section>
                <div className="glass-panel rounded-xl h-full flex flex-col">
                  <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">devices</span>
                      <h2 className="text-xl font-bold text-white">{t('adminSettings.security.sessions')}</h2>
                    </div>
                    <button
                      onClick={handleRevokeAllSessions}
                      className="text-primary hover:text-white border border-primary/30 hover:border-primary hover:bg-primary/10 px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Alle anderen beenden
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t('adminSettings.security.activeSessions')}</h3>
                    {secSessionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : secSessions.length === 0 ? (
                      <div className="text-slate-500 text-sm text-center py-8">{t('adminSettings.security.noSessions')}</div>
                    ) : (
                      secSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-start gap-4 p-4 rounded-lg relative group transition-colors ${
                            session.current
                              ? 'bg-primary/5 border border-primary/20'
                              : 'bg-white/2 border border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${session.current ? 'text-primary bg-primary/10' : 'text-slate-400 bg-white/5 group-hover:text-white'} transition-colors`}>
                            <span className="material-symbols-outlined">
                              {session.deviceInfo?.includes('iOS') || session.deviceInfo?.includes('Android')
                                ? 'smartphone'
                                : session.deviceInfo?.includes('macOS')
                                  ? 'laptop_mac'
                                  : 'desktop_windows'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-white font-bold text-sm">{session.deviceInfo || t('adminSettings.security.unknownDevice')}</h4>
                              {session.current ? (
                                <span className="px-2 py-0.5 bg-primary text-[#0d1208] text-[10px] font-black rounded uppercase">{t('adminSettings.security.current')}</span>
                              ) : (
                                <button
                                  onClick={() => handleRevokeSession(session.id)}
                                  className="text-slate-500 hover:text-red-400 transition-colors"
                                  title={t('adminSettings.security.revoke')}
                                >
                                  <span className="material-symbols-outlined text-lg">cancel</span>
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">IP: {session.ipAddress || '—'}</p>
                            <p className="text-xs text-slate-500">
                              {session.current ? t('adminSettings.security.justNow') : `{t('adminSettings.security.lastActivity')} ${session.lastUsedAt}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-white/10 bg-white/1">
                    <div className="flex gap-2 items-start">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                      <p className="text-xs text-slate-500">{t('adminSettings.security.sessionWarning')}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab > 0 && activeTab < 3 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">{tabs[activeTab].icon}</span>
              <h3 className="text-xl font-bold text-white mb-2">{tabs[activeTab].label}</h3>
              <p className="text-slate-400">{t('adminSettings.placeholder.soon')}</p>
            </div>
          )}

          {showCouponModal && (
            <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCouponModal(false)}>
              <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">{editingCoupon ? 'Gutschein bearbeiten' : 'Neuer Gutschein'}</h3>
                  <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {couponError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">{couponError}</div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gutscheincode</label>
                    <input
                      className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 uppercase"
                      value={couponForm.code}
                      onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="z.B. WELCOME2024"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.discountType')}</label>
                      <select
                        className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                        value={couponForm.discountType}
                        onChange={e => setCouponForm(f => ({ ...f, discountType: e.target.value }))}
                      >
                        <option value="PERCENTAGE">{t('adminSettings.coupons.modal.percent')}</option>
                        <option value="FIXED">{t('adminSettings.coupons.modal.fixed')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.discountValue')}</label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={couponForm.discountValue}
                          onChange={e => setCouponForm(f => ({ ...f, discountValue: e.target.value }))}
                          placeholder="15"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">{couponForm.discountType === 'PERCENTAGE' ? '%' : '€'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.maxUses')}</label>
                      <input
                        className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        type="number"
                        value={couponForm.maxUses}
                        onChange={e => setCouponForm(f => ({ ...f, maxUses: e.target.value }))}
                        placeholder="{t('adminSettings.coupons.modal.unlimited')}"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">{t('adminSettings.coupons.modal.unlimited')}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.minOrder')}</label>
                      <div className="relative">
                        <input
                          className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
                          type="number"
                          value={couponForm.minOrderAmount}
                          onChange={e => setCouponForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-slate-400">€</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{t('adminSettings.coupons.modal.noMinOrder')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.validFrom')}</label>
                      <input
                        className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                        type="datetime-local"
                        value={couponForm.validFrom}
                        onChange={e => setCouponForm(f => ({ ...f, validFrom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('adminSettings.coupons.modal.validUntil')}</label>
                      <input
                        className="bg-background-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 scheme-dark"
                        type="datetime-local"
                        value={couponForm.validUntil}
                        onChange={e => setCouponForm(f => ({ ...f, validUntil: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={couponForm.active}
                        onChange={e => setCouponForm(f => ({ ...f, active: e.target.checked }))}
                      />
                      <div className="relative w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                    <span className="text-sm font-medium text-white">{t('adminSettings.coupons.modal.activateNow')}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowCouponModal(false)}
                    className="text-slate-300 hover:text-white px-5 py-2.5 text-sm font-bold transition-colors border border-white/10 rounded-lg hover:bg-white/5"
                  >{t('adminSettings.security.cancel')}</button>
                  <button
                    onClick={handleCouponSubmit}
                    disabled={couponSaving}
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {couponSaving ? (
                      <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        {editingCoupon ? 'Speichern' : 'Erstellen'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 lg:left-20 right-0 p-4 bg-background-dark/90 backdrop-blur-md border-t border-white/10 z-50 flex justify-end items-center gap-4">
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes('Fehler') ? 'text-red-400' : 'text-green-400'}`}>
              {saveMessage}
            </span>
          )}
          <span className="text-slate-400 text-sm hidden sm:inline-block">
            {t('adminSettings.saveBar.lastChange')} {settings['_last_updated'] || t('adminSettings.saveBar.notSaved')}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-white hover:text-primary px-6 py-2.5 text-sm font-bold transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,68,0,0.3)] hover:shadow-[0_0_30px_rgba(255,68,0,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-white">save</span>
                Einstellungen Speichern
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
