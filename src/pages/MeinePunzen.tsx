import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPunzen, useCreatePunze, useUpdatePunze, useDeletePunze, useUploadPunzeImage, useKategorien, useSettings } from '@/hooks/useData';
import { getImagePublicUrl } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Upload, Stamp, Send, Edit, Trash2, Info, CheckCircle, Clock, Lock, MessageSquare } from 'lucide-react';

const MeinePunzen = () => {
  const { user } = useAuth();
  const { data: punzen, isLoading } = useMyPunzen();
  const { data: kategorien } = useKategorien();
  const { data: settings } = useSettings();
  const createMutation = useCreatePunze();
  const updateMutation = useUpdatePunze();
  const deleteMutation = useDeletePunze();
  const uploadMutation = useUploadPunzeImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ beschreibung: '', verwendung_beginn: '', verwendung_ende: '', kategorie_id: '' });
  const [vorlageFile, setVorlageFile] = useState<File | null>(null);
  const [abdruckFile, setAbdruckFile] = useState<File | null>(null);
  const vorlageRef = useRef<HTMLInputElement>(null);
  const abdruckRef = useRef<HTMLInputElement>(null);

  const datenschutzHinweis = settings?.find(s => s.key === 'datenschutz_hinweis')?.value || '';

  const resetForm = () => {
    setForm({ beschreibung: '', verwendung_beginn: '', verwendung_ende: '', kategorie_id: '' });
    setVorlageFile(null);
    setAbdruckFile(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      let bild_vorlage_path: string | undefined;
      let bild_abdruck_path: string | undefined;
      if (vorlageFile) bild_vorlage_path = await uploadMutation.mutateAsync({ file: vorlageFile, prefix: 'vorlage' });
      if (abdruckFile) bild_abdruck_path = await uploadMutation.mutateAsync({ file: abdruckFile, prefix: 'abdruck' });

      const punzeData = {
        beschreibung: form.beschreibung,
        verwendung_beginn: form.verwendung_beginn || null,
        verwendung_ende: form.verwendung_ende || null,
        kategorie_id: form.kategorie_id || null,
        ...(bild_vorlage_path && { bild_vorlage_path }),
        ...(bild_abdruck_path && { bild_abdruck_path }),
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: punzeData });
        toast({ title: 'Gespeichert', description: 'Punze wurde aktualisiert.' });
      } else {
        await createMutation.mutateAsync({ ...punzeData, user_id: user.id, einwilligung_akzeptiert_am: new Date().toISOString() });
        toast({ title: 'Erstellt', description: 'Neue Punze wurde angelegt.' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { zur_publikation_eingereicht: true } });
      toast({ title: 'Eingereicht', description: 'Punze wurde zur Publikation weitergeleitet.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  // (D) Bearbeitung beantragen for published/locked punzen
  const handleRequestEdit = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { bearbeitung_beantragt: true } });
      toast({ title: 'Anfrage gesendet', description: 'Ein Administrator wird Ihre Anfrage prüfen.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleEdit = (p: NonNullable<typeof punzen>[0]) => {
    setForm({
      beschreibung: p.beschreibung || '',
      verwendung_beginn: p.verwendung_beginn || '',
      verwendung_ende: p.verwendung_ende || '',
      kategorie_id: p.kategorie_id || '',
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Gelöscht', description: 'Punze wurde entfernt.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (p: any) => {
    if (p.veroeffentlicht) return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Publiziert</Badge>;
    if (p.gesperrt) return <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Gesperrt</Badge>;
    if (p.zur_publikation_eingereicht) return <Badge className="bg-accent/20 text-accent border-accent/30"><Clock className="h-3 w-3 mr-1" />Eingereicht</Badge>;
    return <Badge variant="secondary">Entwurf</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Stamp className="h-6 w-6 text-accent" />Meine Punzen</h1>
          <p className="text-sm text-muted-foreground mt-1">{punzen?.length ?? 0} Punzen erfasst</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Neue Punze</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Punze bearbeiten' : 'Neue Punze anlegen'}</DialogTitle></DialogHeader>
            {!editingId && datenschutzHinweis && (
              <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-md">
                <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{datenschutzHinweis}</p>
              </div>
            )}
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Reprofähige Vorlage (Bild)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => vorlageRef.current?.click()}>
                  <input ref={vorlageRef} type="file" className="hidden" accept="image/*" onChange={e => setVorlageFile(e.target.files?.[0] || null)} />
                  {vorlageFile ? <p className="text-sm">{vorlageFile.name}</p> : <div className="flex flex-col items-center gap-1"><Upload className="h-5 w-5 text-muted-foreground" /><p className="text-xs text-muted-foreground">Vorlage hochladen</p></div>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stempelabdruck (Pflichtfeld)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => abdruckRef.current?.click()}>
                  <input ref={abdruckRef} type="file" className="hidden" accept="image/*" onChange={e => setAbdruckFile(e.target.files?.[0] || null)} />
                  {abdruckFile ? <p className="text-sm">{abdruckFile.name}</p> : <div className="flex flex-col items-center gap-1"><Upload className="h-5 w-5 text-muted-foreground" /><p className="text-xs text-muted-foreground">Abdruck hochladen</p></div>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Beschreibung der Punze</Label>
                <Textarea value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Verwendung seit</Label>
                  <Input type="date" value={form.verwendung_beginn} onChange={e => setForm(p => ({ ...p, verwendung_beginn: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Verwendung bis</Label>
                  <Input type="date" value={form.verwendung_ende} onChange={e => setForm(p => ({ ...p, verwendung_ende: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategorie</Label>
                <Select value={form.kategorie_id} onValueChange={v => setForm(p => ({ ...p, kategorie_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                  <SelectContent>
                    {kategorien?.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending || uploadMutation.isPending) ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : punzen && punzen.length > 0 ? (
        <div className="grid gap-4">
          {punzen.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex gap-2 shrink-0">
                    {p.bild_vorlage_path && <img src={getImagePublicUrl(p.bild_vorlage_path)} alt="Vorlage" className="w-20 h-20 object-cover rounded border" />}
                    {p.bild_abdruck_path && <img src={getImagePublicUrl(p.bild_abdruck_path)} alt="Abdruck" className="w-20 h-20 object-cover rounded border" />}
                    {!p.bild_vorlage_path && !p.bild_abdruck_path && (
                      <div className="w-20 h-20 bg-muted rounded flex items-center justify-center"><Stamp className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{p.beschreibung || 'Keine Beschreibung'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.verwendung_beginn && `Seit ${p.verwendung_beginn}`}
                          {p.verwendung_ende && ` bis ${p.verwendung_ende}`}
                          {p.kategorien && ` · Kategorie: ${(p.kategorien as any).name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">Erstellt: {new Date(p.created_at).toLocaleDateString('de-DE')}</p>
                      </div>
                      {getStatusBadge(p)}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {!p.veroeffentlicht && !p.gesperrt && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(p)}><Edit className="h-3.5 w-3.5 mr-1" />Bearbeiten</Button>
                          {!p.zur_publikation_eingereicht && (
                            <Button size="sm" variant="default" onClick={() => handleSubmitForReview(p.id)}><Send className="h-3.5 w-3.5 mr-1" />Zur Publikation einreichen</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {/* (D) Bearbeitung beantragen Button */}
                      {(p.veroeffentlicht || p.gesperrt) && (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <Lock className="h-3 w-3" />Dieser Datensatz ist gesperrt.
                          </p>
                          {!p.bearbeitung_beantragt ? (
                            <Button variant="outline" size="sm" onClick={() => handleRequestEdit(p.id)}>
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />Bearbeitung beantragen
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-accent border-accent/30 text-[10px]">
                              <Clock className="h-2.5 w-2.5 mr-0.5" />Anfrage gesendet
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Stamp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Sie haben noch keine Punzen angelegt.</p>
            <p className="text-sm text-muted-foreground mt-1">Klicken Sie auf „Neue Punze", um Ihre erste Punze zu erfassen.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeinePunzen;
