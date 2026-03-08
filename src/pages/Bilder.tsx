import { useState, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Grid, List, Trash2, Tag, Upload, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useImages, useUploadAndCreateImage, useDeleteImage } from '@/hooks/useData';
import { validateFileClient, getImagePublicUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const kategorien = ['Veranstaltungen', 'Sitzungen', 'Messen', 'Schulungen', 'Sonstiges'];

const Bilder = () => {
  const { isAdmin } = useAuth();
  const { data: images, isLoading } = useImages();
  const uploadMutation = useUploadAndCreateImage();
  const deleteMutation = useDeleteImage();
  
  const [search, setSearch] = useState('');
  const [kategorie, setKategorie] = useState('alle');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ titel: '', beschreibung: '', kategorie: 'Veranstaltungen', tags: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!images) return [];
    return images.filter(img => {
      const matchesSearch = `${img.titel} ${img.beschreibung} ${(img.tags || []).join(' ')}`.toLowerCase().includes(search.toLowerCase());
      const matchesKat = kategorie === 'alle' || img.kategorie === kategorie;
      return matchesSearch && matchesKat;
    });
  }, [images, search, kategorie]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const errors = validateFileClient(file);
    setFileErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      if (!form.titel) {
        setForm(p => ({ ...p, titel: file.name.replace(/\.[^.]+$/, '') }));
      }
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !form.titel) {
      toast({ title: 'Fehler', description: 'Bitte wählen Sie eine Datei und geben Sie einen Titel ein.', variant: 'destructive' });
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        metadata: {
          titel: form.titel,
          beschreibung: form.beschreibung,
          kategorie: form.kategorie,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        },
      });
      toast({ title: 'Hochgeladen', description: 'Bild wurde sicher hochgeladen und gespeichert.' });
      setDialogOpen(false);
      setForm({ titel: '', beschreibung: '', kategorie: 'Veranstaltungen', tags: '' });
      setSelectedFile(null);
      setFilePreview(null);
      setFileErrors([]);
    } catch (err) {
      toast({ title: 'Upload fehlgeschlagen', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    try {
      await deleteMutation.mutateAsync({ id, storagePath });
      toast({ title: 'Gelöscht', description: 'Bild wurde entfernt.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildverwaltung</h1>
          <p className="text-sm text-muted-foreground mt-1">{images?.length ?? 0} Bilder verwalten</p>
        </div>
        {isAdmin && (
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setForm({ titel: '', beschreibung: '', kategorie: 'Veranstaltungen', tags: '' }); setSelectedFile(null); setFilePreview(null); setFileErrors([]); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Bild hochladen</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Bild hochladen</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              {/* File upload area */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                {filePreview ? (
                  <div className="space-y-2">
                    <img src={filePreview} alt="Vorschau" className="max-h-32 mx-auto rounded" />
                    <p className="text-xs text-muted-foreground">{selectedFile?.name} — {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Klicken zum Auswählen oder Datei hierher ziehen</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP, SVG — Max. 10 MB</p>
                  </div>
                )}
              </div>

              {/* Security info */}
              <div className="flex items-start gap-2 p-3 bg-secondary rounded-md">
                <Shield className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Dateien werden auf Dateityp, Größe, versteckte Skripte und verdächtige Signaturen geprüft.
                </p>
              </div>

              {/* Validation errors */}
              {fileErrors.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md space-y-1">
                  {fileErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      <p className="text-xs text-destructive">{err}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Titel</Label>
                <Input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Beschreibung</Label>
                <Input value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategorie</Label>
                <Select value={form.kategorie} onValueChange={v => setForm(p => ({ ...p, kategorie: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {kategorien.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (kommagetrennt)</Label>
                <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Tag1, Tag2, Tag3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleUpload} disabled={uploadMutation.isPending || !selectedFile}>
                {uploadMutation.isPending ? 'Wird geprüft & hochgeladen...' : 'Sicher hochladen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Bilder suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={kategorie} onValueChange={setKategorie}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Kategorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Kategorien</SelectItem>
                {kategorien.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-md">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-video w-full" />)}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(img => (
                <Card key={img.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                    <img src={getImagePublicUrl(img.storage_path)} alt={img.titel} className="w-full h-full object-cover" />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive bg-card/80" onClick={() => handleDelete(img.id, img.storage_path)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{img.titel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{img.kategorie} — {img.groesse}</p>
                    {img.tags && img.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {img.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded">
                            <Tag className="h-2.5 w-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(img => (
                  <TableRow key={img.id}>
                    <TableCell className="font-medium">{img.titel}</TableCell>
                    <TableCell className="text-sm">{img.kategorie}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{(img.tags || []).join(', ')}</TableCell>
                    <TableCell className="text-sm">{img.groesse}</TableCell>
                    <TableCell className="text-sm font-mono">{img.mime_type}</TableCell>
                    <TableCell className="text-sm">{new Date(img.created_at).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(img.id, img.storage_path)} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Keine Bilder gefunden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bilder;
