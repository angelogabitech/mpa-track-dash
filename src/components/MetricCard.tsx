import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'approved' | 'rejected' | 'warning' | 'above';
  delay?: number;
}

const variantStyles = {
  default: 'bg-card border-border',
  approved: 'bg-status-approved-bg border-status-approved/20',
  rejected: 'bg-status-rejected-bg border-status-rejected/20',
  warning: 'bg-status-warning-bg border-status-warning/20',
  above: 'bg-status-above-bg border-status-above/20',
};

const iconVariantStyles = {
  default: 'text-primary',
  approved: 'text-status-approved',
  rejected: 'text-status-rejected',
  warning: 'text-status-warning',
  above: 'text-status-above',
};

export function MetricCard({ title, value, subtitle, icon, variant = 'default', delay = 0 }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-all hover:shadow-md animate-slide-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className={cn('shrink-0', iconVariantStyles[variant])}>{icon}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight text-card-foreground">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
