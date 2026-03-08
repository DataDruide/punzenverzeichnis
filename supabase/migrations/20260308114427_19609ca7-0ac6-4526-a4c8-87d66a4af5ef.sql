
-- 1. Add UNIQUE constraint on profiles.user_id for FK reference
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 2. Drop existing FK and recreate pointing to profiles
ALTER TABLE public.punzen DROP CONSTRAINT IF EXISTS punzen_user_id_fkey;
ALTER TABLE public.punzen 
  ADD CONSTRAINT punzen_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 3. Attach trigger for auto-creating profile + role on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create profile for existing user who is missing one
INSERT INTO public.profiles (user_id, email_kontakt)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;
