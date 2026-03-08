
-- Attach handle_new_user trigger to auth.users (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Ensure settings are seeded with defaults
INSERT INTO public.settings (key, value) VALUES
  ('datenschutz_text', 'Ihre Daten werden gemäß der DSGVO verarbeitet und ausschließlich im Rahmen des Zentralen Punzenverzeichnisses verwendet. Mit der Nutzung stimmen Sie der Speicherung und Verarbeitung Ihrer personenbezogenen Daten zu.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('datenschutz_hinweis', 'Mit dem Einreichen Ihrer Punze erklären Sie sich mit der Veröffentlichung im Verzeichnis einverstanden.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('email_registrierung', 'Vielen Dank für Ihre Registrierung. Ihr Account wird nun geprüft und freigeschaltet.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('email_publikation', 'Ihre Punze wurde erfolgreich publiziert und ist nun im Verzeichnis sichtbar.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('email_bearbeitung_angefragt', 'Eine Bearbeitungsanfrage für eine publizierte Punze wurde eingereicht.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('hilfe_inhalt', '<h2>Willkommen im Zentralen Punzenverzeichnis</h2><p>Hier finden Sie Anleitungen zur Nutzung des Systems.</p><h3>Punze anlegen</h3><p>Navigieren Sie zu "Meine Punzen" und klicken Sie auf "Neue Punze".</p><h3>Zur Publikation einreichen</h3><p>Nach dem Anlegen können Sie die Punze zur Prüfung und Veröffentlichung einreichen.</p>')
ON CONFLICT (key) DO NOTHING;

-- Add unique constraint on settings.key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settings_key_unique'
  ) THEN
    ALTER TABLE public.settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
  END IF;
END $$;
