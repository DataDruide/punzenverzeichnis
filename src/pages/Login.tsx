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
    if (!email || !password) return;
    if (password.length < 6) {
      toast({ title: 'Fehler', description: 'Passwort muss mindestens 6 Zeichen lang sein.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Registrierung fehlgeschlagen', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Erfolgreich registriert', description: 'Sie können sich jetzt anmelden.' });
      navigate('/');
    }
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
            Verbands<span className="text-accent">portal</span>
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
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" placeholder="name@beispiel.de" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
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
