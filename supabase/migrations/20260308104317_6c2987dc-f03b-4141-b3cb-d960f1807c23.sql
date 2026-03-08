
-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT DEFAULT '',
  firma TEXT DEFAULT '',
  position TEXT DEFAULT '',
  strasse TEXT DEFAULT '',
  plz TEXT DEFAULT '',
  ort TEXT DEFAULT '',
  bundesland TEXT DEFAULT '',
  mitgliedsnummer TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'ausstehend' CHECK (status IN ('aktiv', 'inaktiv', 'ausstehend')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create images metadata table
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titel TEXT NOT NULL,
  beschreibung TEXT DEFAULT '',
  dateiname TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  kategorie TEXT DEFAULT 'Sonstiges',
  tags TEXT[] DEFAULT '{}',
  kontakt_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  groesse TEXT DEFAULT '',
  mime_type TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for internal verband tool)
CREATE POLICY "Allow full access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to images" ON public.images FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('verband-bilder', 'verband-bilder', true);

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'verband-bilder');
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verband-bilder');
CREATE POLICY "Allow deletes" ON storage.objects FOR DELETE USING (bucket_id = 'verband-bilder');

-- Indexes
CREATE INDEX idx_contacts_status ON public.contacts (status);
CREATE INDEX idx_contacts_nachname ON public.contacts (nachname);
CREATE INDEX idx_images_kategorie ON public.images (kategorie);
CREATE INDEX idx_images_kontakt_id ON public.images (kontakt_id);
