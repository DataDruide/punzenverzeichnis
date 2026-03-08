import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Download, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/StatusBadge';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useData';
import type { ContactInsert, ContactUpdate } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type ContactStatus = 'aktiv' | 'inaktiv' | 'ausstehend';

const emptyForm: { vorname: string; nachname: string; email: string; telefon: string; firma: string; position: string; strasse: string; plz: string; ort: string; bundesland: string; mitgliedsnummer: string; status: ContactStatus } = {
  vorname: '', nachname: '', email: '', telefon: '', firma: '', position: '',
  strasse: '', plz: '', ort: '', bundesland: '', mitgliedsnummer: '', status: 'ausstehend',
};

const Kontakte = () => {
  const { isAdminOrAbove: isAdmin } = useAuth();
  const { data: contacts, isLoading } = useContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(c => {
      const matchesSearch = `${c.vorname} ${c.nachname} ${c.email} ${c.firma} ${c.ort}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'alle' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  const handleSave = async () => {
    if (!form.vorname || !form.nachname || !form.email) {
      toast({ title: 'Fehler', description: 'Bitte füllen Sie mindestens Vorname, Nachname und E-Mail aus.', variant: 'destructive' });
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form as ContactUpdate });
        toast({ title: 'Gespeichert', description: 'Kontakt wurde aktualisiert.' });
      } else {
        await createMutation.mutateAsync(form as ContactInsert);
        toast({ title: 'Erstellt', description: 'Neuer Kontakt wurde hinzugefügt.' });
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleEdit = (c: typeof filtered[0]) => {
    setForm({
      vorname: c.vorname, nachname: c.nachname, email: c.email,
      telefon: c.telefon || '', firma: c.firma || '', position: c.position || '',
      strasse: c.strasse || '', plz: c.plz || '', ort: c.ort || '',
      bundesland: c.bundesland || '', mitgliedsnummer: c.mitgliedsnummer || '',
      status: c.status as 'aktiv' | 'inaktiv' | 'ausstehend',
    });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Gelöscht', description: 'Kontakt wurde entfernt.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const headers = ['Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Firma', 'Position', 'Straße', 'PLZ', 'Ort', 'Bundesland', 'Mitgliedsnr.', 'Status'];
    const rows = filtered.map(c => [c.vorname, c.nachname, c.email, c.telefon, c.firma, c.position, c.strasse, c.plz, c.ort, c.bundesland, c.mitgliedsnummer, c.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kontakte_export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportiert', description: `${filtered.length} Kontakte als CSV exportiert.` });
  };

  const Field = ({ label, field, type = 'text' }: { label: string; field: keyof typeof form; type?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field] as string} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kontakte</h1>
          <p className="text-sm text-muted-foreground mt-1">{contacts?.length ?? 0} Mitglieder verwalten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
          {isAdmin && (
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neuer Kontakt</Button>
            </DialogTrigger>
          )}
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingId ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Field label="Vorname" field="vorname" />
                <Field label="Nachname" field="nachname" />
                <Field label="E-Mail" field="email" type="email" />
                <Field label="Telefon" field="telefon" type="tel" />
                <Field label="Firma" field="firma" />
                <Field label="Position" field="position" />
                <div className="col-span-2"><Field label="Straße" field="strasse" /></div>
                <Field label="PLZ" field="plz" />
                <Field label="Ort" field="ort" />
                <Field label="Bundesland" field="bundesland" />
                <Field label="Mitgliedsnummer" field="mitgliedsnummer" />
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as typeof form.status }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktiv">Aktiv</SelectItem>
                      <SelectItem value="inaktiv">Inaktiv</SelectItem>
                      <SelectItem value="ausstehend">Ausstehend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="aktiv">Aktiv</SelectItem>
                <SelectItem value="inaktiv">Inaktiv</SelectItem>
                <SelectItem value="ausstehend">Ausstehend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Mitgliedsnr.</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-20"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.vorname} {c.nachname}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{c.firma}</TableCell>
                    <TableCell className="text-sm">{c.ort}</TableCell>
                    <TableCell className="text-sm font-mono">{c.mitgliedsnummer}</TableCell>
                    <TableCell><StatusBadge status={c.status as 'aktiv' | 'inaktiv' | 'ausstehend'} /></TableCell>
                    {isAdmin && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)} disabled={deleteMutation.isPending}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Keine Kontakte gefunden.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Kontakte;
