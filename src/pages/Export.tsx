import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText, Image, Users, Stamp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContacts, useImages, useAllPunzen } from '@/hooks/useData';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) { toast({ title: 'Keine Daten', description: 'Keine Datensätze zum Exportieren.' }); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    return `"${Array.isArray(val) ? val.join(', ') : String(val ?? '')}"`;
  }).join(';'));
  const csv = [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exportiert', description: `${data.length} Datensätze exportiert.` });
};

const exportJSON = (data: unknown[], filename: string) => {
  if (data.length === 0) { toast({ title: 'Keine Daten', description: 'Keine Datensätze zum Exportieren.' }); return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`; a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exportiert', description: `${data.length} Datensätze als JSON exportiert.` });
};

// (F) PDF Export
const exportPunzenPDF = (punzen: any[]) => {
  if (punzen.length === 0) { toast({ title: 'Keine Daten' }); return; }
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Zentrales Punzenverzeichnis — Punzenliste', 14, 20);
  doc.setFontSize(8);
  doc.text(`Exportiert am ${new Date().toLocaleDateString('de-DE')}`, 14, 27);

  const tableData = punzen.map(p => {
    const profile = (p as any).profiles;
    return [
      profile?.firmenname || '—',
      p.beschreibung?.substring(0, 50) || '—',
      (p.kategorien as any)?.name || '—',
      p.verwendung_beginn || '—',
      p.veroeffentlicht ? 'Publiziert' : p.zur_publikation_eingereicht ? 'Eingereicht' : 'Entwurf',
    ];
  });

  (doc as any).autoTable({
    startY: 32,
    head: [['Firma', 'Beschreibung', 'Kategorie', 'Seit', 'Status']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [43, 60, 82] },
  });

  doc.save(`punzenliste_${new Date().toISOString().split('T')[0]}.pdf`);
  toast({ title: 'PDF exportiert', description: `${punzen.length} Punzen als PDF exportiert.` });
};

const exportSinglePunzePDF = (punze: any) => {
  const doc = new jsPDF();
  const profile = (punze as any).profiles;
  
  doc.setFontSize(16);
  doc.text('Zentrales Punzenverzeichnis', 14, 20);
  doc.setFontSize(12);
  doc.text('Punze — Einzelansicht', 14, 28);
  doc.setFontSize(8);
  doc.text(`Exportiert am ${new Date().toLocaleDateString('de-DE')}`, 14, 34);

  let y = 44;
  const addLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 7;
  };

  addLine('Firma:', profile?.firmenname || '—');
  addLine('Ansprechpartner:', profile?.ansprechpartner || '—');
  addLine('Beschreibung:', punze.beschreibung?.substring(0, 80) || '—');
  addLine('Kategorie:', (punze.kategorien as any)?.name || '—');
  addLine('Verwendung seit:', punze.verwendung_beginn || '—');
  addLine('Verwendung bis:', punze.verwendung_ende || '—');
  addLine('Status:', punze.veroeffentlicht ? 'Publiziert' : punze.zur_publikation_eingereicht ? 'Eingereicht' : 'Entwurf');
  addLine('Erstellt:', new Date(punze.created_at).toLocaleDateString('de-DE'));

  doc.save(`punze_${punze.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`);
  toast({ title: 'PDF exportiert', description: 'Einzelpunze als PDF exportiert.' });
};

const Export = () => {
  const { isAdminOrAbove } = useAuth();
  const { data: contacts } = useContacts();
  const { data: images } = useImages();
  const { data: punzen } = useAllPunzen();

  if (!isAdminOrAbove) return <Navigate to="/" replace />;

  const exports = [
    { title: 'Punzenliste als PDF', desc: 'Alle Punzen als PDF-Dokument', icon: Stamp,
      action: () => exportPunzenPDF(punzen || []), count: punzen?.length ?? 0 },
    { title: 'Kontakte als CSV', desc: 'Excel-kompatibel, Semikolon-getrennt', icon: Users,
      action: () => exportCSV((contacts || []) as unknown as Record<string, unknown>[], 'kontakte'), count: contacts?.length ?? 0 },
    { title: 'Kontakte als JSON', desc: 'Für technische Weiterverarbeitung', icon: FileText,
      action: () => exportJSON(contacts || [], 'kontakte'), count: contacts?.length ?? 0 },
    { title: 'Bilddaten als CSV', desc: 'Bild-Metadaten im CSV-Format', icon: Image,
      action: () => exportCSV((images || []) as unknown as Record<string, unknown>[], 'bilder'), count: images?.length ?? 0 },
  ];

  // PDF export for individual punzen
  const recentPunzen = punzen?.slice(0, 5) || [];

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

      {/* Individual punze PDF export */}
      {recentPunzen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Einzelpunze als PDF exportieren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPunzen.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.beschreibung || 'Ohne Beschreibung'}</p>
                    <p className="text-xs text-muted-foreground">{(p as any).profiles?.firmenname}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => exportSinglePunzePDF(p)}>
                    <Download className="h-3.5 w-3.5 mr-1" />PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Export;
