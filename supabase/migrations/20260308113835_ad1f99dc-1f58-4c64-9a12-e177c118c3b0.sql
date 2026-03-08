
-- Add foreign key from punzen.user_id to profiles.user_id for join queries
ALTER TABLE public.punzen ADD CONSTRAINT punzen_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
