import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firmenname, setFirmenname] = useState('');
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [telefon, setTelefon] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Anmeldung fehlgeschlagen', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firmenname) {
      toast({ title: 'Fehler', description: 'Bitte füllen Sie alle Pflichtfelder aus.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Fehler', description: 'Passwort muss mindestens 6 Zeichen lang sein.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({ title: 'Registrierung fehlgeschlagen', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    // Wait briefly for the trigger to create the profile, then update with company data
    if (data.user) {
      // Small delay to let the database trigger create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ firmenname, ansprechpartner, telefon, email_kontakt: email })
        .eq('user_id', data.user.id);
      if (updateError) {
        console.warn('Profile update after registration failed, retrying...', updateError.message);
        // Retry once after another delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        await supabase
          .from('profiles')
          .update({ firmenname, ansprechpartner, telefon, email_kontakt: email })
          .eq('user_id', data.user.id);
      }
    }
    setLoading(false);
    toast({
      title: 'Erfolgreich registriert',
      description: 'Ihr Account wird nun von einem Administrator geprüft. Sie werden nach der Freischaltung benachrichtigt.',
    });
    setMode('login');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'E-Mail gesendet', description: 'Prüfen Sie Ihr Postfach für den Passwort-Reset-Link.' });
      setMode('login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Zentrales <span className="text-accent">Punzenverzeichnis</span>
          </CardTitle>
          <CardDescription>
            {mode === 'login' && 'Melden Sie sich an, um fortzufahren'}
            {mode === 'register' && 'Neuen Account erstellen'}
            {mode === 'reset' && 'Passwort zurücksetzen'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input id="email" type="email" placeholder="name@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}

            {/* Extended registration fields (I) */}
            {mode === 'register' && (
              <>
                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Firmendaten</p>
                  <div className="space-y-2">
                    <Label htmlFor="firmenname">Firmenname *</Label>
                    <Input id="firmenname" placeholder="Goldschmiede Müller GmbH" value={firmenname} onChange={e => setFirmenname(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ansprechpartner">Ansprechpartner</Label>
                    <Input id="ansprechpartner" placeholder="Max Müller" value={ansprechpartner} onChange={e => setAnsprechpartner(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input id="telefon" type="tel" placeholder="+49 123 456789" value={telefon} onChange={e => setTelefon(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nach der Registrierung wird Ihr Account von einem Administrator geprüft und freigeschaltet.
                </p>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Wird verarbeitet...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' && <><LogIn className="h-4 w-4" /> Anmelden</>}
                  {mode === 'register' && <><UserPlus className="h-4 w-4" /> Registrieren</>}
                  {mode === 'reset' && <><KeyRound className="h-4 w-4" /> Link senden</>}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('reset')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Passwort vergessen?
                </button>
                <div>
                  <button onClick={() => setMode('register')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Noch kein Account? <span className="text-primary font-medium">Registrieren</span>
                  </button>
                </div>
              </>
            )}
            {mode === 'register' && (
              <button onClick={() => setMode('login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bereits registriert? <span className="text-primary font-medium">Anmelden</span>
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Zurück zur <span className="text-primary font-medium">Anmeldung</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
