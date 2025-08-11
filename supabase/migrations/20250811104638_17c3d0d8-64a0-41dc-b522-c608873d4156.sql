-- Make shiloysapir@gmail.com the exclusive admin
-- First, reset all users to 'user' role
UPDATE public.users SET role = 'user';

-- Then set the specific email as admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'shiloysapir@gmail.com';