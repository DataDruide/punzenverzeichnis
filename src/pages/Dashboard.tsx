import { Users, Stamp, UserCheck, Clock, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyPunzen, useAllPunzen, useMyProfile } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { isAdminOrAbove } = useAuth();
  const { data: myPunzen, isLoading: loadingMyPunzen } = useMyPunzen();
  const { data: allPunzen, isLoading: loadingAllPunzen } = useAllPunzen();
  const { data: profile } = useMyProfile();

  const isLoading = loadingMyPunzen || (isAdminOrAbove && loadingAllPunzen);

  const myStats = [
    { label: 'Meine Punzen', value: myPunzen?.length ?? 0, icon: Stamp, color: 'text-primary' },
    { label: 'Publiziert', value: myPunzen?.filter(p => p.veroeffentlicht).length ?? 0, icon: UserCheck, color: 'text-success' },
    { label: 'Eingereicht', value: myPunzen?.filter(p => p.zur_publikation_eingereicht && !p.veroeffentlicht).length ?? 0, icon: Clock, color: 'text-accent' },
  ];

  const adminStats = isAdminOrAbove ? [
    { label: 'Alle Punzen', value: allPunzen?.length ?? 0, icon: Stamp, color: 'text-primary' },
    { label: 'Zur Prüfung', value: allPunzen?.filter(p => p.zur_publikation_eingereicht && !p.veroeffentlicht).length ?? 0, icon: Clock, color: 'text-accent' },
    { label: 'Publiziert', value: allPunzen?.filter(p => p.veroeffentlicht).length ?? 0, icon: UserCheck, color: 'text-success' },
  ] : [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Willkommen{profile?.firmenname ? `, ${profile.firmenname}` : ''} — Zentrales Verzeichnis der Punzen
        </p>
      </div>

      {/* Profil-Hinweis */}
      {profile && !profile.firmenname && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium">Profil vervollständigen</p>
              <p className="text-xs text-muted-foreground">Bitte ergänzen Sie Ihre Firmendaten unter „Mein Profil".</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meine Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Meine Übersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myStats.map(({ label, value, icon: Icon, color }) => (
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
      </div>

      {/* Admin Stats */}
      {isAdminOrAbove && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminStats.map(({ label, value, icon: Icon, color }) => (
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
        </div>
      )}

      {/* Recent punzen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neueste Punzen</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : myPunzen && myPunzen.length > 0 ? (
            <div className="space-y-3">
              {myPunzen.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.beschreibung || 'Ohne Beschreibung'}</p>
                    <p className="text-xs text-muted-foreground">
                      {(p.kategorien as any)?.name && `Kategorie: ${(p.kategorien as any).name} · `}
                      {new Date(p.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {p.veroeffentlicht ? (
                    <Badge className="bg-success/20 text-success text-[10px]">Publiziert</Badge>
                  ) : p.zur_publikation_eingereicht ? (
                    <Badge className="bg-accent/20 text-accent text-[10px]">Eingereicht</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Entwurf</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Punzen vorhanden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
