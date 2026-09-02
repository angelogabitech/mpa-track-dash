import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { generateAlerts } from '@/lib/mpaflow';
import { Bell, AlertTriangle, XOctagon, Info, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  message: string;
  pavimentoName: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  read: boolean;
}

export function NotificationCenter() {
  const { pavimentos } = useData();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('mpaflow-read-notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const notifications: Notification[] = useMemo(() => {
    const alerts = generateAlerts(pavimentos);
    return alerts.map(a => ({
      id: a.id,
      message: a.message,
      pavimentoName: a.pavimentoName,
      severity: a.severity === 'critical' ? 'critical' : 'warning',
      type: a.type,
      read: readIds.has(a.id),
    }));
  }, [pavimentos, readIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('mpaflow-read-notifications', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      localStorage.setItem('mpaflow-read-notifications', JSON.stringify([...next]));
      return next;
    });
  }, [notifications]);

  const severityConfig = {
    critical: { icon: XOctagon, color: 'text-status-rejected', bg: 'bg-status-rejected-bg' },
    warning: { icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning-bg' },
    info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-status-rejected text-white text-[10px] font-bold flex items-center justify-center animate-fade-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-[28rem] bg-card border rounded-xl shadow-lg z-50 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-card-foreground">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = severityConfig[n.severity];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors',
                        !n.read && 'bg-accent/30'
                      )}
                    >
                      <div className={cn('mt-0.5 p-1 rounded-full shrink-0', cfg.bg)}>
                        <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{n.pavimentoName}</p>
                        <p className="text-sm text-card-foreground mt-0.5 leading-snug">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="shrink-0 p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                          title="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
