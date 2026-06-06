export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

const STATUS_MAP: Record<string, BadgeVariant> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export const orderStatusVariant = (status: string): BadgeVariant =>
  STATUS_MAP[status] ?? 'default';

export const orderStatusLabel = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1);
