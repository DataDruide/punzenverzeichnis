import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile, useUpdateProfile, useSettings } from '@/hooks/useData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';

const DatenschutzDialog = () => {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { data: settings } = useSettings();
  const updateMutation = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const datenschutzText = settings?.find(s => s.key === 'datenschutz_text')?.value || '';

  useEffect(() => {
    if (profile && !profile.datenschutz_akzeptiert_am) {
      setOpen(true);
    }
  }, [profile]);

  const handleAccept = async () => {
    if (!profile || !accepted) return;
    await updateMutation.mutateAsync({
      id: profile.id,
      data: { datenschutz_akzeptiert_am: new Date().toISOString() },
    });
    setOpen(false);
  };

  if (!user || !profile) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Datenschutzhinweis
          </DialogTitle>
          <DialogDescription>
            Bitte lesen und bestätigen Sie die folgenden Datenschutzhinweise, um fortzufahren.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-y-auto p-4 bg-muted/50 rounded-md text-sm text-foreground leading-relaxed">
          {datenschutzText || 'Datenschutzhinweis wird geladen...'}
        </div>
        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="datenschutz" checked={accepted} onCheckedChange={v => setAccepted(v === true)} />
          <label htmlFor="datenschutz" className="text-sm text-muted-foreground cursor-pointer leading-tight">
            Ich habe die Datenschutzhinweise gelesen und stimme der Verarbeitung meiner Daten zu.
          </label>
        </div>
        <DialogFooter>
          <Button onClick={handleAccept} disabled={!accepted || updateMutation.isPending}>
            {updateMutation.isPending ? 'Wird gespeichert...' : 'Bestätigen und fortfahren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatenschutzDialog;
