import { Users, Image, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockContacts, mockImages } from '@/data/mockData';

const stats = [
  { label: 'Kontakte gesamt', value: mockContacts.length, icon: Users, color: 'text-primary' },
  { label: 'Aktive Mitglieder', value: mockContacts.filter(c => c.status === 'aktiv').length, icon: UserCheck, color: 'text-success' },
  { label: 'Inaktiv', value: mockContacts.filter(c => c.status === 'inaktiv').length, icon: UserX, color: 'text-destructive' },
  { label: 'Bilder erfasst', value: mockImages.length, icon: Image, color: 'text-accent' },
];

const Dashboard = () => {
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
              <div className="text-3xl font-bold">{value}</div>
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
            <div className="space-y-3">
              {mockContacts.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.vorname} {c.nachname}</p>
                    <p className="text-xs text-muted-foreground">{c.firma}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.erstelltAm}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neueste Bilder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockImages.slice(0, 3).map(img => (
                <div key={img.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{img.titel}</p>
                    <p className="text-xs text-muted-foreground">{img.kategorie} — {img.groesse}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{img.erstelltAm}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
