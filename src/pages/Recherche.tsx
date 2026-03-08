import { useState, useMemo } from 'react';
import { usePublishedPunzen, useKategorien } from '@/hooks/useData';
import { getImagePublicUrl } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Stamp, Building2, MapPin, Phone, Mail, Globe, CheckCircle, XCircle } from 'lucide-react';

const Recherche = () => {
  const { data: punzen, isLoading } = usePublishedPunzen();
  const { data: kategorien } = useKategorien();
  const [search, setSearch] = useState('');
  const [kategorieFilter, setKategorieFilter] = useState('alle');

  const filtered = useMemo(() => {
    if (!punzen) return [];
    return punzen.filter(p => {
      const profile = p.profiles as any;
      const searchStr = `${p.beschreibung} ${profile?.firmenname} ${profile?.ansprechpartner} ${profile?.ort} ${(p.kategorien as any)?.name}`.toLowerCase();
      const matchesSearch = searchStr.includes(search.toLowerCase());
      const matchesKat = kategorieFilter === 'alle' || p.kategorie_id === kategorieFilter;
      return matchesSearch && matchesKat;
    });
  }, [punzen, search, kategorieFilter]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-accent" />Recherche</h1>
        <p className="text-sm text-muted-foreground mt-1">Publizierte Punzen durchsuchen</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Volltextsuche..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={kategorieFilter} onValueChange={setKategorieFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Kategorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Kategorien</SelectItem>
            {kategorien?.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map(p => {
            const profile = p.profiles as any;
            return (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Punze images - prominent display */}
                    <div className="flex gap-1 p-4 bg-muted/50 shrink-0">
                      {p.bild_vorlage_path && (
                        <img src={getImagePublicUrl(p.bild_vorlage_path)} alt="Vorlage" className="w-32 h-32 object-contain rounded" />
                      )}
                      {p.bild_abdruck_path && (
                        <img src={getImagePublicUrl(p.bild_abdruck_path)} alt="Abdruck" className="w-32 h-32 object-contain rounded" />
                      )}
                      {!p.bild_vorlage_path && !p.bild_abdruck_path && (
                        <div className="w-32 h-32 flex items-center justify-center"><Stamp className="h-12 w-12 text-muted-foreground" /></div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />{profile?.firmenname || 'Unbekannt'}
                            {profile?.firma_aktiv ? (
                              <Badge variant="outline" className="text-success border-success/30 text-[10px]"><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Aktiv</Badge>
                            ) : (
                              <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px]"><XCircle className="h-2.5 w-2.5 mr-0.5" />Erloschen</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{profile?.ansprechpartner}</p>
                        </div>
                        {(p.kategorien as any)?.name && (
                          <Badge variant="secondary">{(p.kategorien as any).name}</Badge>
                        )}
                      </div>

                      {p.beschreibung && <p className="text-sm">{p.beschreibung}</p>}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {profile?.ort && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.strasse && `${profile.strasse}, `}{profile.plz} {profile.ort}</span>}
                        {profile?.telefon && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.telefon}</span>}
                        {profile?.email_kontakt && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{profile.email_kontakt}</span>}
                        {profile?.webseite && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{profile.webseite}</span>}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {p.verwendung_beginn && `Seit ${p.verwendung_beginn}`}
                        {p.verwendung_ende && ` bis ${p.verwendung_ende}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Keine publizierten Punzen gefunden.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recherche;
