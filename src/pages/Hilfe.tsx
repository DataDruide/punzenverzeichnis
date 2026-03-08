import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, useUpdateSetting } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { HelpCircle, Edit, Save, X } from 'lucide-react';

const Hilfe = () => {
  const { isAdminOrAbove } = useAuth();
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();
  const [editing, setEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const hilfeSetting = settings?.find(s => s.key === 'hilfe_inhalt');
  const hilfeContent = hilfeSetting?.value || '<p>Hilfe-Inhalt wird geladen...</p>';

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.innerHTML = hilfeContent;
    }
  }, [editing]);

  const handleSave = async () => {
    if (!editorRef.current || !hilfeSetting) return;
    try {
      await updateSetting.mutateAsync({ id: hilfeSetting.id, value: editorRef.current.innerHTML });
      toast({ title: 'Gespeichert', description: 'Hilfe-Inhalt wurde aktualisiert.' });
      setEditing(false);
    } catch (err) {
      toast({ title: 'Fehler', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Hilfe</h1>
        </div>
        {isAdminOrAbove && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />Bearbeiten
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hilfe-Inhalt bearbeiten (WYSIWYG)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-md">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('bold')}><strong>B</strong></Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('italic')}><em>I</em></Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('underline')}><u>U</u></Button>
              <span className="w-px bg-border mx-1" />
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('formatBlock', 'h2')}>H2</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('formatBlock', 'h3')}>H3</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('formatBlock', 'p')}>P</Button>
              <span className="w-px bg-border mx-1" />
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('insertUnorderedList')}>• Liste</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => execCommand('insertOrderedList')}>1. Liste</Button>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[300px] p-4 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm max-w-none"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" />Abbrechen</Button>
              <Button onClick={handleSave} disabled={updateSetting.isPending}><Save className="h-4 w-4 mr-1" />Speichern</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div
              className="prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: hilfeContent }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hilfe;
