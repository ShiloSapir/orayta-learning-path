-- Fix Supabase security settings: Enable OTP expiry and password protection
UPDATE auth.config 
SET 
  OTP_EXP = 3600,  -- OTP expires in 1 hour
  MIN_PASSWORD_LENGTH = 8,
  DISABLE_SIGNUP = false,
  ENABLE_SIGNUP = true;