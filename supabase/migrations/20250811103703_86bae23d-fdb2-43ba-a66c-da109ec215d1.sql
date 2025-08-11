-- Create events table for analytics tracking
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}',
  session_id text,
  request_id text,
  scope text,
  error_code text,
  error_message text,
  latency_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create test_runs table for storing test execution results
CREATE TABLE public.test_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suite_name text NOT NULL,
  test_case text NOT NULL,
  test_config jsonb NOT NULL DEFAULT '{}',
  passed boolean NOT NULL,
  execution_time_ms integer NOT NULL,
  logs jsonb NOT NULL DEFAULT '[]',
  payload_snippet jsonb,
  error_details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create admin_audit_logs table for tracking admin actions
CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
CREATE POLICY "Admins can view all events" 
ON public.events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "System can insert events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

-- Create policies for test_runs table
CREATE POLICY "Admins can manage test runs" 
ON public.test_runs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- Create policies for admin_audit_logs table
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_events_created_at ON public.events(created_at);
CREATE INDEX idx_events_event_type_created_at ON public.events(event_type, created_at);
CREATE INDEX idx_events_user_id_created_at ON public.events(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_scope_error_code ON public.events(scope, error_code) WHERE scope IS NOT NULL;

CREATE INDEX idx_test_runs_created_at ON public.test_runs(created_at);
CREATE INDEX idx_test_runs_suite_case ON public.test_runs(suite_name, test_case);

CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs(created_at);
CREATE INDEX idx_audit_logs_admin_user_id ON public.admin_audit_logs(admin_user_id);

-- Create function to log admin actions
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