import { supabase } from '@/integrations/supabase/client';

export type AuditSeverity = 'info' | 'warning' | 'error';

export interface AuditEvent {
  event_type: string;
  message: string;
  severity?: AuditSeverity;
  context?: Record<string, unknown>;
}

/**
 * Schreibt einen Audit-Log-Eintrag. Fehler werden geschluckt, damit
 * Logging nie die UX bricht.
 */
export async function logAudit(event: AuditEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('audit_logs') as any).insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      event_type: event.event_type,
      severity: event.severity ?? 'info',
      message: event.message,
      context: event.context ?? {},
    });
  } catch (e) {
    console.warn('[audit] failed to log event', e);
  }
}
