import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ScrollText } from 'lucide-react';

interface AuditRow {
  id: string;
  created_at: string;
  user_email: string | null;
  event_type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  context: Record<string, unknown> | null;
}

const sevColor = (s: string) =>
  s === 'error' ? 'destructive' : s === 'warning' ? 'secondary' : 'outline';

const AdminAudit = () => {
  const { isAdminOrAbove } = useAuth();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
    enabled: isAdminOrAbove,
  });

  if (!isAdminOrAbove) return <Navigate to="/" replace />;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="h-6 w-6" /> Audit-Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sicherheits- und Systemereignisse (letzte 200 Einträge)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ereignisse</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Lädt...</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Noch keine Ereignisse protokolliert.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeit</TableHead>
                    <TableHead>Stufe</TableHead>
                    <TableHead>Ereignis</TableHead>
                    <TableHead>Nachricht</TableHead>
                    <TableHead>Nutzer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sevColor(row.severity) as 'default' | 'destructive' | 'secondary' | 'outline'}>
                          {row.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{row.event_type}</TableCell>
                      <TableCell className="text-sm max-w-md">
                        <div>{row.message}</div>
                        {row.context && Object.keys(row.context).length > 0 && (
                          <pre className="text-[10px] text-muted-foreground mt-1 overflow-hidden">
                            {JSON.stringify(row.context).substring(0, 200)}
                          </pre>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{row.user_email ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAudit;
