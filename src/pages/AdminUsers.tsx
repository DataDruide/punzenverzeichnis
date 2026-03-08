import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAllProfiles, useUpdateProfile } from '@/hooks/useData';
import { Shield, Trash2, Users, Eye, UserCheck, UserX, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
}

const AdminUsers = () => {
  const { isAdminOrAbove, isSuperAdmin, user } = useAuth();
  const { data: profiles, refetch: refetchProfiles } = useAllProfiles();
  const updateProfileMutation = useUpdateProfile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await supabase.functions.invoke('list-users');
    if (res.error) {
      toast({ title: 'Fehler', description: 'Benutzer konnten nicht geladen werden.', variant: 'destructive' });
    } else {
      setUsers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await supabase.functions.invoke('list-users', {
      body: { action: 'update_role', userId, role: newRole },
    });
    if (res.error) {
      toast({ title: 'Fehler', description: 'Rolle konnte nicht geändert werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Erfolg', description: 'Rolle wurde aktualisiert.' });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await supabase.functions.invoke('list-users', {
      body: { action: 'delete_user', userId },
    });
    if (res.error) {
      toast({ title: 'Fehler', description: 'Benutzer konnte nicht gelöscht werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Erfolg', description: 'Benutzer wurde gelöscht.' });
      fetchUsers();
    }
  };

  // (A) Freischalten
  const handleFreischalten = async (userId: string) => {
    const profile = profiles?.find(p => p.user_id === userId);
    if (!profile) return;
    try {
      await updateProfileMutation.mutateAsync({ id: profile.id, data: { freigeschaltet: true } });
      toast({ title: 'Freigeschaltet', description: 'Benutzer wurde freigeschaltet.' });
      refetchProfiles();
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  // (B) Sperren / Entsperren
  const handleToggleSperren = async (userId: string, gesperrt: boolean) => {
    const profile = profiles?.find(p => p.user_id === userId);
    if (!profile) return;
    try {
      await updateProfileMutation.mutateAsync({ id: profile.id, data: { gesperrt } });
      toast({ title: gesperrt ? 'Gesperrt' : 'Entsperrt', description: `Benutzer wurde ${gesperrt ? 'gesperrt' : 'entsperrt'}.` });
      refetchProfiles();
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  // (K) Detail dialog for profile + research permissions
  const selectedProfile = profiles?.find(p => p.user_id === selectedUserId);
  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleUpdateResearch = async (field: string, value: any) => {
    if (!selectedProfile) return;
    try {
      await updateProfileMutation.mutateAsync({ id: selectedProfile.id, data: { [field]: value } });
      toast({ title: 'Gespeichert' });
      refetchProfiles();
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdminOrAbove) return <Navigate to="/" replace />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="E-Mail suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Alle Benutzer ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const profile = profiles?.find(p => p.user_id === u.id);
                  const isFreigeschaltet = profile?.freigeschaltet ?? false;
                  const isGesperrt = profile?.gesperrt ?? false;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email}
                        {profile?.firmenname && <span className="block text-xs text-muted-foreground">{profile.firmenname}</span>}
                      </TableCell>
                      <TableCell>
                        {isGesperrt ? (
                          <Badge variant="destructive" className="text-[10px]">Gesperrt</Badge>
                        ) : isFreigeschaltet ? (
                          <Badge className="bg-success/20 text-success border-success/30 text-[10px]">Aktiv</Badge>
                        ) : (
                          <Badge variant="outline" className="text-accent border-accent/30 text-[10px]">Wartend</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)} disabled={u.id === user?.id}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Benutzer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {isSuperAdmin && <SelectItem value="superadmin">SuperAdmin</SelectItem>}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUserId(u.id); setDetailOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {!isFreigeschaltet && !isGesperrt && u.id !== user?.id && (
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleFreischalten(u.id)}>
                              <UserCheck className="h-3.5 w-3.5 mr-1" />Freischalten
                            </Button>
                          )}
                          {isFreigeschaltet && !isGesperrt && u.id !== user?.id && (
                            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive" onClick={() => handleToggleSperren(u.id, true)}>
                              <UserX className="h-3.5 w-3.5 mr-1" />Sperren
                            </Button>
                          )}
                          {isGesperrt && u.id !== user?.id && (
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleToggleSperren(u.id, false)}>
                              <UserCheck className="h-3.5 w-3.5 mr-1" />Entsperren
                            </Button>
                          )}
                          {u.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
                                  <AlertDialogDescription>{u.email} wird unwiderruflich gelöscht.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Löschen</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* (K) User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nutzerdetails</DialogTitle></DialogHeader>
          {selectedProfile && selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">E-Mail:</span> <span className="font-medium">{selectedUser.email}</span></div>
                <div><span className="text-muted-foreground">Rolle:</span> <span className="font-medium capitalize">{selectedUser.role}</span></div>
                <div><span className="text-muted-foreground">Firma:</span> <span className="font-medium">{selectedProfile.firmenname || '—'}</span></div>
                <div><span className="text-muted-foreground">Ansprechpartner:</span> <span className="font-medium">{selectedProfile.ansprechpartner || '—'}</span></div>
                <div><span className="text-muted-foreground">Telefon:</span> <span className="font-medium">{selectedProfile.telefon || '—'}</span></div>
                <div><span className="text-muted-foreground">Ort:</span> <span className="font-medium">{selectedProfile.plz} {selectedProfile.ort || '—'}</span></div>
                <div><span className="text-muted-foreground">Registriert:</span> <span className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('de-DE')}</span></div>
                <div><span className="text-muted-foreground">Datenschutz:</span> <span className="font-medium">{selectedProfile.datenschutz_akzeptiert_am ? new Date(selectedProfile.datenschutz_akzeptiert_am).toLocaleDateString('de-DE') : '—'}</span></div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Berechtigungen</p>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Freigeschaltet</Label>
                  <Switch checked={selectedProfile.freigeschaltet ?? false} onCheckedChange={v => handleUpdateResearch('freigeschaltet', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Gesperrt</Label>
                  <Switch checked={selectedProfile.gesperrt ?? false} onCheckedChange={v => handleUpdateResearch('gesperrt', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Darf recherchieren</Label>
                  <Switch checked={selectedProfile.darf_recherchieren ?? false} onCheckedChange={v => handleUpdateResearch('darf_recherchieren', v)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Recherche gültig bis</Label>
                  <Input
                    type="date"
                    value={selectedProfile.recherche_gueltig_bis || ''}
                    onChange={e => handleUpdateResearch('recherche_gueltig_bis', e.target.value || null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin-Bemerkungen</Label>
                  <Input
                    value={selectedProfile.bemerkungen || ''}
                    onChange={e => handleUpdateResearch('bemerkungen', e.target.value)}
                    placeholder="Interne Notizen..."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Schließen</Button>
              </div>
            </div>
          )}
          {!selectedProfile && <p className="text-sm text-muted-foreground">Kein Profil für diesen Nutzer gefunden.</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
