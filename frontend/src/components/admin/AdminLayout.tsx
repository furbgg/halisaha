import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { useNotificationStore } from '../../store/notificationStore';

export function AdminLayout() {
  const { startPolling, stopPolling } = useNotificationStore();

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-slate-100 font-display antialiased selection:bg-primary selection:text-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto relative bg-background-dark">
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #3d1400, transparent 60%)' }}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
