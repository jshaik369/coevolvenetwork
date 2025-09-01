-- Enable pg_cron extension for scheduling automation jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for making HTTP requests from cron jobs
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create immutable audit ledger table
CREATE TABLE public.audit_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_number BIGSERIAL UNIQUE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  hash TEXT NOT NULL,
  previous_hash TEXT,
  merkle_root TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit ledger (read-only for admins)
ALTER TABLE public.audit_ledger ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read audit logs
CREATE POLICY "Admins can view audit ledger" 
ON public.audit_ledger 
FOR SELECT 
USING (is_admin());

-- Policy to prevent any modifications to audit ledger
CREATE POLICY "Audit ledger is immutable" 
ON public.audit_ledger 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Function to generate hash for audit entries
CREATE OR REPLACE FUNCTION public.generate_audit_hash(
  _sequence_number BIGINT,
  _timestamp TIMESTAMP WITH TIME ZONE,
  _table_name TEXT,
  _operation TEXT,
  _record_id UUID,
  _old_values JSONB,
  _new_values JSONB,
  _user_id UUID,
  _previous_hash TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hash_input TEXT;
  hash_result TEXT;
BEGIN
  -- Create deterministic hash input
  hash_input := CONCAT(
    _sequence_number,
    _timestamp::TEXT,
    _table_name,
    _operation,
    COALESCE(_record_id::TEXT, ''),
    COALESCE(_old_values::TEXT, ''),
    COALESCE(_new_values::TEXT, ''),
    COALESCE(_user_id::TEXT, ''),
    COALESCE(_previous_hash, '')
  );
  
  -- Generate SHA-256 hash
  SELECT encode(digest(hash_input, 'sha256'), 'hex') INTO hash_result;
  
  RETURN hash_result;
END;
$$;

-- Function to insert audit log entry
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  _table_name TEXT,
  _operation TEXT,
  _record_id UUID,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _sequence_number BIGINT;
  _timestamp TIMESTAMP WITH TIME ZONE;
  _user_id UUID;
  _previous_hash TEXT;
  _hash TEXT;
BEGIN
  -- Get current timestamp and user
  _timestamp := now();
  _user_id := auth.uid();
  
  -- Get next sequence number
  SELECT COALESCE(MAX(sequence_number), 0) + 1 INTO _sequence_number FROM public.audit_ledger;
  
  -- Get previous hash for chaining
  SELECT hash INTO _previous_hash FROM public.audit_ledger ORDER BY sequence_number DESC LIMIT 1;
  
  -- Generate hash for this entry
  _hash := public.generate_audit_hash(
    _sequence_number,
    _timestamp,
    _table_name,
    _operation,
    _record_id,
    _old_values,
    _new_values,
    _user_id,
    _previous_hash
  );
  
  -- Insert with bypassing RLS using SECURITY DEFINER
  INSERT INTO public.audit_ledger (
    sequence_number,
    timestamp,
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    user_id,
    metadata,
    hash,
    previous_hash
  ) VALUES (
    _sequence_number,
    _timestamp,
    _table_name,
    _operation,
    _record_id,
    _old_values,
    _new_values,
    _user_id,
    _metadata,
    _hash,
    _previous_hash
  );
END;
$$;

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Handle different operations
  IF TG_OP = 'INSERT' THEN
    PERFORM public.insert_audit_log(
      TG_TABLE_NAME,
      'INSERT',
      NEW.id,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('trigger_time', now())
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.insert_audit_log(
      TG_TABLE_NAME,
      'UPDATE',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger_time', now())
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.insert_audit_log(
      TG_TABLE_NAME,
      'DELETE',
      OLD.id,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('trigger_time', now())
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_automation_jobs
  AFTER INSERT OR UPDATE OR DELETE ON public.automation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_ai_insights
  AFTER INSERT OR UPDATE OR DELETE ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_business_intelligence
  AFTER INSERT OR UPDATE OR DELETE ON public.business_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Schedule a daily job to run weekly reports at 6 AM UTC
SELECT cron.schedule(
  'weekly-ai-insights-report',
  '0 6 * * 1', -- Every Monday at 6 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://joovupvjegfnjgkyxekf.supabase.co/functions/v1/automation-orchestrator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb3Z1cHZqZWdmbmpna3l4ZWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyOTQxNiwiZXhwIjoyMDcwNzA1NDE2fQ.qJzqLPvD3R6Fx-r5DwVxC3Ml0A_o8hRSM1vSHT6ZTrw"}'::jsonb,
    body := '{"action": "run_job", "jobId": "weekly-report-job-id"}'::jsonb
  );
  $$
);

-- Schedule daily backup job at 2 AM UTC
SELECT cron.schedule(
  'daily-drive-backup',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://joovupvjegfnjgkyxekf.supabase.co/functions/v1/drive-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb3Z1cHZqZWdmbmpna3l4ZWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEyOTQxNiwiZXhwIjoyMDcwNzA1NDE2fQ.qJzqLPvD3R6Fx-r5DwVxC3Ml0A_o8hRSM1vSHT6ZTrw"}'::jsonb,
    body := '{"data_types": ["all"], "include_ai_insights": true, "retention_years": 7}'::jsonb
  );
  $$
);