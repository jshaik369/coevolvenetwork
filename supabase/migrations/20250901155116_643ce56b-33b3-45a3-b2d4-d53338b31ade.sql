-- Fix security linter issues: Set search_path for all functions to prevent security vulnerabilities

-- Update generate_audit_hash function with proper search_path
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
SET search_path = public
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

-- Update insert_audit_log function with proper search_path  
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
SET search_path = public
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

-- Update audit_trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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