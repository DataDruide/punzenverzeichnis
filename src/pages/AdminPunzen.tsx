import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAllPunzen, useUpdatePunze, useKategorien } from '@/hooks/useData';
import { getImagePublicUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Stamp, Search, Eye, CheckCircle, Clock, Send, XCircle, Undo2, MessageSquare, Unlock } from 'lucide-react';

const AdminPunzen = () => {
  const { isAdminOrAbove } = useAuth();
  const { data: punzen, isLoading } = useAllPunzen();
  const { data: kategorien } = useKategorien();
  const updateMutation = useUpdatePunze();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [selectedPunze, setSelectedPunze] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({ kategorie_id: '', bemerkungen_admin: '' });

  const filtered = useMemo(() => {
    if (!punzen) return [];
    return punzen.filter(p => {
      const profile = p.profiles as any;
      const searchStr = `${p.beschreibung} ${profile?.firmenname} ${profile?.ansprechpartner}`.toLowerCase();
      const matchesSearch = searchStr.includes(search.toLowerCase());
      let matchesStatus = true;
      if (statusFilter === 'eingereicht') matchesStatus = !!p.zur_publikation_eingereicht && !p.veroeffentlicht;
      else if (statusFilter === 'publiziert') matchesStatus = !!p.veroeffentlicht;
      else if (statusFilter === 'entwurf') matchesStatus = !p.zur_publikation_eingereicht && !p.veroeffentlicht;
      return matchesSearch && matchesStatus;
    });
  }, [punzen, search, statusFilter]);

  const handlePublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { veroeffentlicht: true, zur_publikation_eingereicht: false } });
      toast({ title: 'Publiziert', description: 'Punze wurde veröffentlicht.' });
      setPublishConfirmId(null);
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleDepublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { veroeffentlicht: false } });
      toast({ title: 'Depubliziert', description: 'Punze wurde aus der Publikation zurückgezogen.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  // Unlock a punze for editing (approve edit request)
  const handleUnlock = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { veroeffentlicht: false, gesperrt: false, bearbeitung_beantragt: false } });
      toast({ title: 'Entsperrt', description: 'Punze wurde zur Bearbeitung freigegeben.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleSaveAdminFields = async () => {
    if (!selectedPunze) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedPunze.id,
        data: {
          kategorie_id: adminForm.kategorie_id || null,
          bemerkungen_admin: adminForm.bemerkungen_admin,
        },
      });
      toast({ title: 'Gespeichert', description: 'Admin-Felder wurden aktualisiert.' });
      setDetailOpen(false);
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const openDetail = (p: any) => {
    setSelectedPunze(p);
    setAdminForm({ kategorie_id: p.kategorie_id || '', bemerkungen_admin: p.bemerkungen_admin || '' });
    setDetailOpen(true);
  };

  if (!isAdminOrAbove) return <Navigate to="/" replace />;

  const getStatus = (p: any) => {
    if (p.veroeffentlicht) return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Publiziert</Badge>;
    if (p.zur_publikation_eingereicht) return <Badge className="bg-accent/20 text-accent border-accent/30"><Clock className="h-3 w-3 mr-1" />Eingereicht</Badge>;
    return <Badge variant="secondary">Entwurf</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Stamp className="h-6 w-6 text-accent" />Punzenverwaltung</h1>
        <p className="text-sm text-muted-foreground mt-1">{punzen?.length ?? 0} Punzen gesamt</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="eingereicht">Eingereicht</SelectItem>
            <SelectItem value="publiziert">Publiziert</SelectItem>
            <SelectItem value="entwurf">Entwurf</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vorschau</TableHead>
                  <TableHead>Nutzer / Firma</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const profile = p.profiles as any;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.bild_abdruck_path && <img src={getImagePublicUrl(p.bild_abdruck_path)} alt="" className="w-10 h-10 object-cover rounded" />}
                          {p.bild_vorlage_path && <img src={getImagePublicUrl(p.bild_vorlage_path)} alt="" className="w-10 h-10 object-cover rounded" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{profile?.firmenname || '—'}<br /><span className="text-xs text-muted-foreground">{profile?.ansprechpartner}</span></TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{p.beschreibung || '—'}</TableCell>
                      <TableCell className="text-sm">{(p.kategorien as any)?.name || '—'}</TableCell>
                      <TableCell>{getStatus(p)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString('de-DE')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(p)}><Eye className="h-3.5 w-3.5" /></Button>
                          {p.zur_publikation_eingereicht && !p.veroeffentlicht && (
                            <Button size="sm" variant="default" onClick={() => setPublishConfirmId(p.id)}>
                              <Send className="h-3.5 w-3.5 mr-1" />Publizieren
                            </Button>
                          )}
                          {p.veroeffentlicht && (
                            <Button size="sm" variant="outline" onClick={() => handleDepublish(p.id)}>
                              <Undo2 className="h-3.5 w-3.5 mr-1" />Depublizieren
                            </Button>
                          )}
                          {p.bearbeitung_beantragt && (
                            <Button size="sm" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleUnlock(p.id)}>
                              <Unlock className="h-3.5 w-3.5 mr-1" />Bearbeitung freigeben
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Keine Punzen gefunden.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Punze Details</DialogTitle></DialogHeader>
          {selectedPunze && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {selectedPunze.bild_vorlage_path && <img src={getImagePublicUrl(selectedPunze.bild_vorlage_path)} alt="Vorlage" className="w-32 h-32 object-contain rounded border" />}
                {selectedPunze.bild_abdruck_path && <img src={getImagePublicUrl(selectedPunze.bild_abdruck_path)} alt="Abdruck" className="w-32 h-32 object-contain rounded border" />}
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Beschreibung:</strong> {selectedPunze.beschreibung || '—'}</p>
                <p><strong>Nutzer:</strong> {(selectedPunze.profiles as any)?.firmenname}</p>
                <p><strong>Zeitraum:</strong> {selectedPunze.verwendung_beginn || '—'} bis {selectedPunze.verwendung_ende || '—'}</p>
              </div>
              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Admin-Felder</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Kategorisierung</Label>
                  <Select value={adminForm.kategorie_id} onValueChange={v => setAdminForm(p => ({ ...p, kategorie_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                    <SelectContent>
                      {kategorien?.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bemerkungen (intern)</Label>
                  <Textarea value={adminForm.bemerkungen_admin} onChange={e => setAdminForm(p => ({ ...p, bemerkungen_admin: e.target.value }))} rows={3} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Schließen</Button>
                <Button onClick={handleSaveAdminFields} disabled={updateMutation.isPending}>Speichern</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Confirm */}
      <AlertDialog open={!!publishConfirmId} onOpenChange={() => setPublishConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wirklich publizieren?</AlertDialogTitle>
            <AlertDialogDescription>Die Punze wird für alle berechtigten Nutzer sichtbar und der Datensatz wird zur Bearbeitung gesperrt.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => publishConfirmId && handlePublish(publishConfirmId)}>Publizieren</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPunzen;
