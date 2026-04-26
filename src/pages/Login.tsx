import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/audit';
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

  const doLogin = async (mail: string, pw: string) => {
    setLoading(true);
    // Sicherheit: vorhandene Session löschen, damit kein Zwischenstand stört
    await supabase.auth.signOut().catch(() => {});
    const cleanMail = mail.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanMail, password: pw });
    setLoading(false);
    if (error) {
      toast({ title: 'Anmeldung fehlgeschlagen', description: error.message, variant: 'destructive' });
      logAudit({
        event_type: 'auth.login_failed',
        severity: 'warning',
        message: `Login fehlgeschlagen für ${cleanMail}`,
        context: { email: cleanMail, error: error.message },
      });
    } else {
      logAudit({ event_type: 'auth.login_success', message: `Login erfolgreich: ${cleanMail}` });
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await doLogin(email, password);
  };

  const demoLogin = (mail: string, pw: string) => {
    setEmail(mail);
    setPassword(pw);
    doLogin(mail, pw);
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
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) {
      toast({ title: 'Registrierung fehlgeschlagen', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    // Manually create profile + role since the auth trigger may not be attached
    if (data.user) {
      const userId = data.user.id;
      // Upsert profile (insert if missing, update if trigger ran)
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert(
          { user_id: userId, firmenname, ansprechpartner, telefon, email_kontakt: email },
          { onConflict: 'user_id' }
        );
      if (profErr) console.warn('Profile upsert failed:', profErr.message);

      // Ensure user has a default role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (!existingRole) {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'user' });
      }
    }
    setLoading(false);
    toast({
      title: 'Bitte E-Mail bestätigen',
      description: 'Wir haben Ihnen einen Bestätigungslink an ' + email + ' gesendet. Bitte prüfen Sie Ihr Postfach (auch den Spam-Ordner). Nach der Bestätigung wird Ihr Account von einem Administrator freigeschaltet.',
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

          {mode === 'login' && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 text-center">Demo-Zugänge (Präsentation)</p>
              <div className="grid grid-cols-1 gap-2">
                <Button type="button" variant="outline" size="sm" disabled={loading}
                  onClick={() => demoLogin('demo-admin@zvp-demo.de', 'DemoAdmin2026!')}>
                  Als Admin anmelden
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={loading}
                  onClick={() => demoLogin('demo-firma@zvp-demo.de', 'DemoFirma2026!')}>
                  Als Firma anmelden
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={loading}
                  onClick={() => demoLogin('demo-forscher@zvp-demo.de', 'DemoForscher2026!')}>
                  Als Forscher anmelden
                </Button>
              </div>
            </div>
          )}

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
