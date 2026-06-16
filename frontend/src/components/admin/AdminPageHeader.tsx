import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  icon: string;
  actionButton?: React.ReactNode;
  badge?: React.ReactNode;
}

export function AdminPageHeader({ title, icon, actionButton, badge }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
        </div>
        <div className="flex items-center gap-3 relative">
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {badge && badge}
        </div>
      </div>
      {actionButton && (
        <div className="flex shrink-0">
          {actionButton}
        </div>
      )}
    </div>
  );
}
