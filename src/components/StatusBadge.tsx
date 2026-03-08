import { cn } from '@/lib/utils';

const statusConfig = {
  aktiv: { label: 'Aktiv', className: 'bg-success/15 text-success border-success/20' },
  inaktiv: { label: 'Inaktiv', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  ausstehend: { label: 'Ausstehend', className: 'bg-warning/15 text-warning border-warning/20' },
};

const StatusBadge = ({ status }: { status: 'aktiv' | 'inaktiv' | 'ausstehend' }) => {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
