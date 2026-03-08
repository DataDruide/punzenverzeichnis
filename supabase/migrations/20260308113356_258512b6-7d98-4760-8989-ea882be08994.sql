
-- Helper function to check admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'superadmin')
  )
$$;

-- Profiles table (Nutzerstammdaten laut Pflichtenheft)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  firmenname text NOT NULL DEFAULT '',
  strasse text DEFAULT '',
  plz text DEFAULT '',
  ort text DEFAULT '',
  telefon text DEFAULT '',
  email_kontakt text DEFAULT '',
  webseite text DEFAULT '',
  ansprechpartner text DEFAULT '',
  firma_aktiv boolean DEFAULT true,
  gesperrt boolean DEFAULT false,
  darf_recherchieren boolean DEFAULT false,
  recherche_gueltig_bis date,
  datenschutz_akzeptiert_am timestamptz,
  bemerkungen text DEFAULT '',
  freigeschaltet boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin_or_above(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (is_admin_or_above(auth.uid()));
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kategorien table
CREATE TABLE public.kategorien (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  beschreibung text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kategorien ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view kategorien" ON public.kategorien FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage kategorien" ON public.kategorien FOR ALL TO authenticated USING (is_admin_or_above(auth.uid())) WITH CHECK (is_admin_or_above(auth.uid()));

-- Punzen table
CREATE TABLE public.punzen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  beschreibung text DEFAULT '',
  verwendung_beginn date,
  verwendung_ende date,
  bild_vorlage_path text,
  bild_abdruck_path text,
  kategorie_id uuid REFERENCES public.kategorien(id),
  bemerkungen_admin text DEFAULT '',
  veroeffentlicht boolean DEFAULT false,
  zur_publikation_eingereicht boolean DEFAULT false,
  gesperrt boolean DEFAULT false,
  einwilligung_akzeptiert_am timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.punzen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own punzen" ON public.punzen FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own punzen" ON public.punzen FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own unpublished punzen" ON public.punzen FOR UPDATE TO authenticated USING (user_id = auth.uid() AND veroeffentlicht = false AND gesperrt = false);
CREATE POLICY "Admins can view all punzen" ON public.punzen FOR SELECT TO authenticated USING (is_admin_or_above(auth.uid()));
CREATE POLICY "Admins can update all punzen" ON public.punzen FOR UPDATE TO authenticated USING (is_admin_or_above(auth.uid()));
CREATE POLICY "Admins can delete punzen" ON public.punzen FOR DELETE TO authenticated USING (is_admin_or_above(auth.uid()));
CREATE POLICY "Published punzen visible to researchers" ON public.punzen FOR SELECT TO authenticated USING (
  veroeffentlicht = true AND EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.darf_recherchieren = true
    AND (profiles.recherche_gueltig_bis IS NULL OR profiles.recherche_gueltig_bis >= CURRENT_DATE)
  )
);
CREATE TRIGGER update_punzen_updated_at BEFORE UPDATE ON public.punzen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Settings table (editierbare Texte)
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmins can manage settings" ON public.settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin')) WITH CHECK (has_role(auth.uid(), 'superadmin'));
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update handle_new_user to also create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.profiles (user_id, email_kontakt) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Enable realtime for punzen
ALTER PUBLICATION supabase_realtime ADD TABLE public.punzen;
