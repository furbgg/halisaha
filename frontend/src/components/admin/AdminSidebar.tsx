import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ADMIN_PORTAL_PATH } from '../../config/brand';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const PORTAL_BASE = ADMIN_PORTAL_PATH;

const getNavSections = (t: any) => [
  {
    items: [
      { to: `${PORTAL_BASE}/dashboard`, icon: 'analytics', label: t('nav.admin.dashboard', 'Dashboard') },
      { to: `${PORTAL_BASE}/reservierungen`, icon: 'calendar_month', label: t('nav.admin.reservations', 'Reservierungen') },
      { to: `${PORTAL_BASE}/zahlungen`, icon: 'credit_card', label: t('nav.admin.payments', 'Zahlungen') },
    ],
  },
  {
    header: t('nav.admin.communication', 'Kommunikation'),
    items: [
      { to: `${PORTAL_BASE}/kontakt-formular`, icon: 'mark_email_unread', label: t('nav.admin.contactRequests', 'Kontaktanfragen') },
    ],
  },
  {
    header: t('nav.admin.management', 'Verwaltung'),
    items: [
      { to: `${PORTAL_BASE}/material`, icon: 'inventory_2', label: t('nav.admin.equipment', 'Materialliste') },
      { to: `${PORTAL_BASE}/personal`, icon: 'group', label: t('nav.admin.staff', 'Personalliste') },
      { to: `${PORTAL_BASE}/einstellungen`, icon: 'settings', label: t('nav.admin.settings', 'Einstellungen') },
    ],
  },
];

function NotificationBadge({ collapsed }: { collapsed: boolean }) {
  const { unreadCount, setOpen } = useNotificationStore();

  return (
    <div className="px-3 pb-1">
      <button
        onClick={() => setOpen(true)}
        aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ''}`}
        className={`flex items-center gap-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors w-full text-left px-3 py-2.5 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <span className="material-symbols-outlined text-xl shrink-0 relative" aria-hidden="true">
          notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-white text-[9px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        {!collapsed && (
          <span className="text-sm font-medium flex-1">Benachrichtigungen</span>
        )}
        {!collapsed && unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const { t, i18n } = useTranslation();
  
  const navSections = getNavSections(t);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
    }
    logout();
    navigate(ADMIN_PORTAL_PATH);
  };

  return (
    <aside
      aria-label="Admin-Seitenleiste"
      className={`flex flex-col justify-between shrink-0 h-full overflow-hidden transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        background: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 140, 0, 0.1)',
      }}
    >
      <div
        className={`h-20 flex items-center border-b border-surface-border ${
          collapsed ? 'justify-center px-2' : 'px-6 justify-between'
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl">sports_soccer</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors shrink-0"
          title={collapsed ? t('nav.admin.openSidebar', 'Sidebar öffnen') : t('nav.admin.closeSidebar', 'Sidebar schließen')}
          aria-label={collapsed ? t('nav.admin.openSidebar', 'Sidebar öffnen') : t('nav.admin.closeSidebar', 'Sidebar schließen')}
          aria-expanded={!collapsed}
        >
          <span
            className={`material-symbols-outlined text-lg transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          >
            chevron_left
          </span>
        </button>
      </div>

      <nav aria-label="Admin-Navigation" className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.header && !collapsed && (
              <div className="px-3 pt-4 pb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.header}
                </p>
              </div>
            )}
            {collapsed && section.header && (
              <div className="my-2 mx-2 border-t border-white/5" />
            )}
            {section.items.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,140,0,0.1)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined text-xl shrink-0 transition-colors ${
                        !isActive && 'group-hover:text-primary'
                      }`}
                    >
                      {link.icon}
                    </span>
                    {!collapsed && (
                      <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'} truncate`}>
                        {link.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-surface-border">
        {!collapsed && user ? (
          <div className="p-4">
            <div className="flex items-center gap-3 rounded-lg bg-surface-dark p-3 border border-surface-border">
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-orange-600 flex items-center justify-center text-black font-bold text-xs shrink-0">
                {user.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>
        ) : collapsed ? (
          <div className="flex justify-center py-3">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-orange-600 flex items-center justify-center text-black font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        ) : null}

        <NotificationBadge collapsed={collapsed} />

        <div className={`px-3 ${collapsed ? 'pb-2' : 'pb-4'}`}>
          <div role="group" aria-label="Sprachauswahl" className="flex bg-white/5 border border-white/10 rounded-xl p-1 items-center justify-center w-full flex-wrap gap-1">
            {['de', 'tr', 'en', 'bs', 'sq'].map(lang => (
              <button
                key={lang}
                title={lang.toUpperCase()}
                aria-label={`Sprache: ${lang.toUpperCase()}`}
                aria-pressed={i18n.language === lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`flex-1 min-w-[30px] py-1.5 rounded-lg text-sm font-bold transition-all uppercase ${i18n.language === lang ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white bg-transparent'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            title={collapsed ? t('nav.admin.logout', 'Abmelden') : undefined}
            className={`flex items-center gap-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left px-3 py-2.5 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            {!collapsed && <span className="text-sm font-medium">{t('nav.admin.logout', 'Abmelden')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
