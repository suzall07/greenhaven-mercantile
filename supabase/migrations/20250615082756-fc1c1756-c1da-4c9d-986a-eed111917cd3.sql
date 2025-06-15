
-- Insert missing profiles for users who don't have them
INSERT INTO public.profiles (id, email)
SELECT 
  au.id, 
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
