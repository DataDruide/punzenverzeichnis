import { Download, FileText, Image, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockContacts, mockImages } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const exportCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    return `"${Array.isArray(val) ? val.join(', ') : String(val ?? '')}"`;
  }).join(';'));
  const csv = [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exportiert', description: `${data.length} Datensätze exportiert.` });
};

const exportJSON = (data: unknown[], filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exportiert', description: `${data.length} Datensätze als JSON exportiert.` });
};

const exports = [
  {
    title: 'Kontakte als CSV',
    desc: 'Alle Kontaktdaten im CSV-Format (Excel-kompatibel, Semikolon-getrennt)',
    icon: Users,
    action: () => exportCSV(mockContacts as unknown as Record<string, unknown>[], 'kontakte'),
    count: mockContacts.length,
  },
  {
    title: 'Kontakte als JSON',
    desc: 'Kontaktdaten im JSON-Format für technische Weiterverarbeitung',
    icon: FileText,
    action: () => exportJSON(mockContacts, 'kontakte'),
    count: mockContacts.length,
  },
  {
    title: 'Bilddaten als CSV',
    desc: 'Alle Bilddatensätze im CSV-Format exportieren',
    icon: Image,
    action: () => exportCSV(mockImages as unknown as Record<string, unknown>[], 'bilder'),
    count: mockImages.length,
  },
  {
    title: 'Bilddaten als JSON',
    desc: 'Bilddatensätze als JSON exportieren',
    icon: FileText,
    action: () => exportJSON(mockImages, 'bilder'),
    count: mockImages.length,
  },
];

const Export = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Datenexport</h1>
        <p className="text-sm text-muted-foreground mt-1">Exportieren Sie Ihre Daten in verschiedenen Formaten</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exports.map(({ title, desc, icon: Icon, action, count }) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-xs">{count} Datensätze</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{desc}</p>
              <Button variant="outline" size="sm" onClick={action}>
                <Download className="h-4 w-4 mr-1" /> Exportieren
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Export;
