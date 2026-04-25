import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useSettings, useUpdateSetting, useKategorien } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Settings, Mail, Shield, Tag, Plus, Edit, Trash2, Save, Sparkles, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const AdminEinstellungen = () => {
  const { isAdminOrAbove, isSuperAdmin } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);

  const handleBootstrapDemo = async () => {
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('bootstrap-demo', { method: 'POST' });
      if (error) throw error;
      setDemoResult(data);
      toast({ title: 'Demo-Daten erstellt', description: 'Demo-Accounts und Beispiel-Punzen wurden eingerichtet.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setDemoLoading(false);
    }
  };
  const { data: settings, isLoading } = useSettings();
  const { data: kategorien } = useKategorien();
  const updateSetting = useUpdateSetting();
  const qc = useQueryClient();

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [katDialog, setKatDialog] = useState(false);
  const [editKatId, setEditKatId] = useState<string | null>(null);
  const [katForm, setKatForm] = useState({ name: '', beschreibung: '', sort_order: 0 });

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach(s => { vals[s.key] = s.value; });
      setEditValues(vals);
    }
  }, [settings]);

  const saveSetting = async (key: string) => {
    const setting = settings?.find(s => s.key === key);
    if (!setting) return;
    try {
      await updateSetting.mutateAsync({ id: setting.id, value: editValues[key] || '' });
      toast({ title: 'Gespeichert', description: `"${key}" wurde aktualisiert.` });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleSaveKategorie = async () => {
    try {
      if (editKatId) {
        const { error } = await supabase.from('kategorien').update(katForm).eq('id', editKatId);
        if (error) throw error;
        toast({ title: 'Gespeichert', description: 'Kategorie wurde aktualisiert.' });
      } else {
        const { error } = await supabase.from('kategorien').insert(katForm);
        if (error) throw error;
        toast({ title: 'Erstellt', description: 'Neue Kategorie wurde angelegt.' });
      }
      setKatDialog(false);
      setEditKatId(null);
      setKatForm({ name: '', beschreibung: '', sort_order: 0 });
      qc.invalidateQueries({ queryKey: ['kategorien'] });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteKategorie = async (id: string) => {
    try {
      const { error } = await supabase.from('kategorien').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Gelöscht' });
      qc.invalidateQueries({ queryKey: ['kategorien'] });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (!isAdminOrAbove) return <Navigate to="/" replace />;

  const settingField = (key: string, label: string, multiline = false) => {
    const val = editValues[key] ?? '';
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {multiline ? (
          <Textarea value={val} onChange={e => setEditValues(p => ({ ...p, [key]: e.target.value }))} rows={5} />
        ) : (
          <Input value={val} onChange={e => setEditValues(p => ({ ...p, [key]: e.target.value }))} />
        )}
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => saveSetting(key)} disabled={updateSetting.isPending}>
            <Save className="h-3.5 w-3.5 mr-1" />Speichern
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>

      <Tabs defaultValue="mail">
        <TabsList>
          <TabsTrigger value="mail"><Mail className="h-3.5 w-3.5 mr-1" />E-Mail-Texte</TabsTrigger>
          <TabsTrigger value="datenschutz"><Shield className="h-3.5 w-3.5 mr-1" />Datenschutz</TabsTrigger>
          <TabsTrigger value="kategorien"><Tag className="h-3.5 w-3.5 mr-1" />Kategorien</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="demo"><Sparkles className="h-3.5 w-3.5 mr-1" />Demo-Daten</TabsTrigger>}
        </TabsList>

        <TabsContent value="mail" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">E-Mail-Vorlagen</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {settingField('email_registrierung', 'E-Mail bei Registrierung', true)}
              {settingField('email_publikation', 'E-Mail bei Publikation', true)}
              {settingField('email_bearbeitung_angefragt', 'E-Mail bei Bearbeitungsanfrage', true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datenschutz" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Datenschutzhinweis</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {settingField('datenschutz_text', 'Datenschutztext (wird beim ersten Login angezeigt)', true)}
              {settingField('datenschutz_hinweis', 'Hinweis bei Punze-Erstellung', true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kategorien" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Kategorien ({kategorien?.length ?? 0})</CardTitle>
                <Dialog open={katDialog} onOpenChange={o => { setKatDialog(o); if (!o) { setEditKatId(null); setKatForm({ name: '', beschreibung: '', sort_order: 0 }); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Neue Kategorie</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editKatId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Name</Label>
                        <Input value={katForm.name} onChange={e => setKatForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Beschreibung</Label>
                        <Textarea value={katForm.beschreibung} onChange={e => setKatForm(p => ({ ...p, beschreibung: e.target.value }))} rows={2} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Sortierung</Label>
                        <Input type="number" value={katForm.sort_order} onChange={e => setKatForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setKatDialog(false)}>Abbrechen</Button>
                      <Button onClick={handleSaveKategorie}>Speichern</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Sortierung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kategorien?.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{k.beschreibung || '—'}</TableCell>
                      <TableCell>{k.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setKatForm({ name: k.name, beschreibung: k.beschreibung || '', sort_order: k.sort_order ?? 0 });
                            setEditKatId(k.id);
                            setKatDialog(true);
                          }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteKategorie(k.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="demo" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />Demo-Daten für Präsentation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Erstellt drei Demo-Accounts (Admin, Firma, Forscher) und vier Beispiel-Punzen für die Präsentation der Software.
                  Bei wiederholtem Aufruf werden bestehende Accounts aktualisiert (Passwort bleibt gleich).
                </p>
                <div className="rounded-md border p-3 text-xs space-y-1 bg-muted/30">
                  <p><strong>demo-admin@zvp-demo.de</strong> / DemoAdmin2026! — Admin</p>
                  <p><strong>demo-firma@zvp-demo.de</strong> / DemoFirma2026! — Firma mit Punzen</p>
                  <p><strong>demo-forscher@zvp-demo.de</strong> / DemoForscher2026! — Recherche-Berechtigung</p>
                </div>
                <Button onClick={handleBootstrapDemo} disabled={demoLoading}>
                  {demoLoading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Erstelle...</> : <><Sparkles className="h-4 w-4 mr-1" />Demo-Daten jetzt erstellen</>}
                </Button>
                {demoResult && (
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-60">{JSON.stringify(demoResult, null, 2)}</pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminEinstellungen;
