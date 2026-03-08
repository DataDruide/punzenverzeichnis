
-- Add bearbeitung_beantragt column to punzen for edit requests (D)
ALTER TABLE public.punzen ADD COLUMN IF NOT EXISTS bearbeitung_beantragt boolean DEFAULT false;

-- Insert default settings for email texts, privacy, and help if not exist
INSERT INTO public.settings (key, value) VALUES 
  ('email_registrierung', 'Willkommen beim Zentralen Punzenverzeichnis! Ihr Account wurde erstellt.'),
  ('email_publikation', 'Ihre Punze wurde erfolgreich publiziert.'),
  ('email_bearbeitung_angefragt', 'Ein Nutzer hat die Bearbeitung einer Punze beantragt.'),
  ('hilfe_inhalt', '<h2>Willkommen im ZVP</h2><p>Hier finden Sie Hilfe zur Nutzung des Zentralen Punzenverzeichnisses.</p><h3>Punzen anlegen</h3><p>Navigieren Sie zu "Meine Punzen" und klicken Sie auf "Neue Punze".</p><h3>Recherche</h3><p>Unter "Recherche" können Sie publizierte Punzen durchsuchen.</p>'),
  ('datenschutz_text', 'Mit der Nutzung des Zentralen Punzenverzeichnisses stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer Datenschutzerklärung zu. Ihre Daten werden ausschließlich im Rahmen des Verzeichnisses verwendet und nicht an Dritte weitergegeben.')
ON CONFLICT DO NOTHING;
