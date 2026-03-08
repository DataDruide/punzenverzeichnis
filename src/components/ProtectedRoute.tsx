import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile } from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Clock } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  if (isLoading || (user && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is gesperrt (blocked)
  if (profile?.gesperrt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldX className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Account gesperrt</h2>
            <p className="text-sm text-muted-foreground">
              Ihr Account wurde von einem Administrator gesperrt. Bitte wenden Sie sich an den Verband für weitere Informationen.
            </p>
            <Button variant="outline" onClick={signOut}>Abmelden</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is not yet freigeschaltet (approved)
  if (profile && !profile.freigeschaltet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Clock className="h-12 w-12 mx-auto text-accent" />
            <h2 className="text-xl font-bold text-foreground">Freischaltung ausstehend</h2>
            <p className="text-sm text-muted-foreground">
              Ihr Account wurde erfolgreich registriert und wird derzeit von einem Administrator geprüft. Sie erhalten Zugang, sobald Ihr Account freigeschaltet wurde.
            </p>
            <Button variant="outline" onClick={signOut}>Abmelden</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
