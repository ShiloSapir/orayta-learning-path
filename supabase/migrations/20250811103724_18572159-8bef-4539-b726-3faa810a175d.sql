-- Fix the search_path security warning
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_resource text,
  p_details jsonb DEFAULT '{}',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action,
    resource,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;