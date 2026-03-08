import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile, useUpdateProfile, useCreateProfile } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { User, Building2, Save } from 'lucide-react';

const Profil = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const createMutation = useCreateProfile();

  const [form, setForm] = useState({
    firmenname: '', strasse: '', plz: '', ort: '', telefon: '',
    email_kontakt: '', webseite: '', ansprechpartner: '', firma_aktiv: true,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firmenname: profile.firmenname || '',
        strasse: profile.strasse || '',
        plz: profile.plz || '',
        ort: profile.ort || '',
        telefon: profile.telefon || '',
        email_kontakt: profile.email_kontakt || '',
        webseite: profile.webseite || '',
        ansprechpartner: profile.ansprechpartner || '',
        firma_aktiv: profile.firma_aktiv ?? true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      if (profile) {
        await updateMutation.mutateAsync({ id: profile.id, data: form });
      } else if (user) {
        await createMutation.mutateAsync({ user_id: user.id, ...form });
      }
      toast({ title: 'Gespeichert', description: 'Profil wurde aktualisiert.' });
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const Field = ({ label, field, type = 'text' }: { label: string; field: keyof typeof form; type?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={form[field] as string} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
    </div>
  );

  if (isLoading) {
    return <div className="p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Mein Profil</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Firmendaten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Firmenname (Pflichtfeld)" field="firmenname" /></div>
            <Field label="Ansprechpartner" field="ansprechpartner" />
            <Field label="Telefon" field="telefon" type="tel" />
            <Field label="E-Mail (Kontakt)" field="email_kontakt" type="email" />
            <Field label="Webseite" field="webseite" type="url" />
            <div className="col-span-2"><Field label="Straße" field="strasse" /></div>
            <Field label="PLZ" field="plz" />
            <Field label="Ort" field="ort" />
            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch
                checked={form.firma_aktiv}
                onCheckedChange={v => setForm(p => ({ ...p, firma_aktiv: v }))}
              />
              <Label className="text-sm">Firma aktiv</Label>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={updateMutation.isPending || createMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {(updateMutation.isPending || createMutation.isPending) ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profil;
