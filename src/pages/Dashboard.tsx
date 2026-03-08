import { Users, Image, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContacts, useImages } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data: contacts, isLoading: loadingContacts } = useContacts();
  const { data: images, isLoading: loadingImages } = useImages();

  const stats = [
    { label: 'Kontakte gesamt', value: contacts?.length ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Aktive Mitglieder', value: contacts?.filter(c => c.status === 'aktiv').length ?? 0, icon: UserCheck, color: 'text-success' },
    { label: 'Inaktiv', value: contacts?.filter(c => c.status === 'inaktiv').length ?? 0, icon: UserX, color: 'text-destructive' },
    { label: 'Bilder erfasst', value: images?.length ?? 0, icon: Image, color: 'text-accent' },
  ];

  const isLoading = loadingContacts || loadingImages;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Übersicht über Ihren Verband</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neueste Kontakte</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : contacts && contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{c.vorname} {c.nachname}</p>
                      <p className="text-xs text-muted-foreground">{c.firma}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Kontakte vorhanden.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neueste Bilder</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : images && images.length > 0 ? (
              <div className="space-y-3">
                {images.slice(0, 5).map(img => (
                  <div key={img.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{img.titel}</p>
                      <p className="text-xs text-muted-foreground">{img.kategorie} — {img.groesse}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(img.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Bilder vorhanden.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
