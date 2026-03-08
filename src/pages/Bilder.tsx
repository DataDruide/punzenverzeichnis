import { useState, useMemo } from 'react';
import { Search, Plus, Grid, List, Trash2, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockImages } from '@/data/mockData';
import { ImageRecord } from '@/types';
import { toast } from '@/hooks/use-toast';

const kategorien = ['Veranstaltungen', 'Sitzungen', 'Messen', 'Schulungen', 'Sonstiges'];

const Bilder = () => {
  const [images, setImages] = useState<ImageRecord[]>(mockImages);
  const [search, setSearch] = useState('');
  const [kategorie, setKategorie] = useState('alle');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState({ titel: '', beschreibung: '', kategorie: 'Veranstaltungen', tags: '' });

  const filtered = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = `${img.titel} ${img.beschreibung} ${img.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase());
      const matchesKat = kategorie === 'alle' || img.kategorie === kategorie;
      return matchesSearch && matchesKat;
    });
  }, [images, search, kategorie]);

  const handleAdd = () => {
    if (!newImage.titel) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie einen Titel ein.', variant: 'destructive' });
      return;
    }
    const record: ImageRecord = {
      id: crypto.randomUUID(), titel: newImage.titel, beschreibung: newImage.beschreibung,
      dateiname: `${newImage.titel.toLowerCase().replace(/\s+/g, '_')}.jpg`, url: '/placeholder.svg',
      kategorie: newImage.kategorie, tags: newImage.tags.split(',').map(t => t.trim()).filter(Boolean),
      erstelltAm: new Date().toISOString().split('T')[0], groesse: '0 KB',
    };
    setImages(prev => [...prev, record]);
    setDialogOpen(false);
    setNewImage({ titel: '', beschreibung: '', kategorie: 'Veranstaltungen', tags: '' });
    toast({ title: 'Hinzugefügt', description: 'Bilddatensatz wurde erstellt.' });
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Gelöscht', description: 'Bilddatensatz wurde entfernt.' });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildverwaltung</h1>
          <p className="text-sm text-muted-foreground mt-1">{images.length} Bilder verwalten</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neues Bild</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neuen Bilddatensatz anlegen</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Titel</Label>
                <Input value={newImage.titel} onChange={e => setNewImage(p => ({ ...p, titel: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Beschreibung</Label>
                <Input value={newImage.beschreibung} onChange={e => setNewImage(p => ({ ...p, beschreibung: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategorie</Label>
                <Select value={newImage.kategorie} onValueChange={v => setNewImage(p => ({ ...p, kategorie: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {kategorien.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (kommagetrennt)</Label>
                <Input value={newImage.tags} onChange={e => setNewImage(p => ({ ...p, tags: e.target.value }))} placeholder="Tag1, Tag2, Tag3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAdd}>Speichern</Button>
            </div>
          </DialogContent>
        </Dialog>
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
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(img => (
                <Card key={img.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <img src={img.url} alt={img.titel} className="w-16 h-16 opacity-30" />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => handleDelete(img.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{img.titel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{img.kategorie} — {img.groesse}</p>
                    {img.tags.length > 0 && (
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
                  <TableHead>Datum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(img => (
                  <TableRow key={img.id}>
                    <TableCell className="font-medium">{img.titel}</TableCell>
                    <TableCell className="text-sm">{img.kategorie}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{img.tags.join(', ')}</TableCell>
                    <TableCell className="text-sm">{img.groesse}</TableCell>
                    <TableCell className="text-sm">{img.erstelltAm}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(img.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Keine Bilder gefunden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bilder;
