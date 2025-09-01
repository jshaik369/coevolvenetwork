
-- ============================
-- Phase 0: Security Foundation
-- Idempotent migration: safe to run multiple times
-- ============================

-- 0) Align ai_command_queue schema + constraints, indexes, RLS, auditing
ALTER TABLE public.ai_command_queue
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS source_ai text;

DO $$
BEGIN
  ALTER TABLE public.ai_command_queue
    ALTER COLUMN source DROP NOT NULL,
    ALTER COLUMN action DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN
  NULL;
END $$;

-- Allow only known lifecycle statuses
DO $$
BEGIN
  ALTER TABLE public.ai_command_queue
    ADD CONSTRAINT ai_command_queue_status_chk
      CHECK (status IN ('queued','processing','completed','failed','blocked'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Prevent oversized command payloads
DO $$
BEGIN
  ALTER TABLE public.ai_command_queue
    ADD CONSTRAINT ai_command_queue_command_text_len
      CHECK (command_text IS NULL OR length(command_text) <= 8192);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ai_command_queue_status
  ON public.ai_command_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_command_queue_created_at
  ON public.ai_command_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_command_queue_processed_at
  ON public.ai_command_queue(processed_at);
CREATE INDEX IF NOT EXISTS idx_ai_command_queue_priority
  ON public.ai_command_queue(priority);

-- Enable RLS and admin-only visibility
ALTER TABLE public.ai_command_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admins can view ai command queue"
    ON public.ai_command_queue FOR SELECT
    USING (is_admin());

  CREATE POLICY "Admins can update ai command queue"
    ON public.ai_command_queue FOR UPDATE
    USING (is_admin());

  CREATE POLICY "Admins can delete ai command queue"
    ON public.ai_command_queue FOR DELETE
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Immutable audit trail for inserts/updates/deletes
DO $$
BEGIN
  CREATE TRIGGER ai_command_queue_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.ai_command_queue
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 1) Replay protection: Nonce table
CREATE TABLE IF NOT EXISTS public.ai_request_nonces (
  nonce text PRIMARY KEY,
  signature text,
  request_timestamp bigint NOT NULL,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
ALTER TABLE public.ai_request_nonces ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admins can view nonces"
    ON public.ai_request_nonces FOR SELECT
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER ai_request_nonces_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.ai_request_nonces
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_request_nonces_created_at
  ON public.ai_request_nonces(created_at);

-- 2) Per-IP rate limiting
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet NOT NULL,
  window_start timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  last_request_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT api_rate_limits_unique_ip_window UNIQUE (ip, window_start)
);
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admins can view rate limits"
    ON public.api_rate_limits FOR SELECT
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER api_rate_limits_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.api_rate_limits
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip_window
  ON public.api_rate_limits(ip, window_start);

-- 3) Structured security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info','warning','error','critical')),
  message text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admins can view security events"
    ON public.security_events FOR SELECT
    USING (is_admin());

  CREATE POLICY "System can insert security events"
    ON public.security_events FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER security_events_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.security_events
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_security_events_created_at
  ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity
  ON public.security_events(severity);

-- 4) AI interaction messages log
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text,
  session_id text,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('system','assistant','user','tool','gateway')),
  metadata jsonb DEFAULT '{}'::jsonb,
  security_status text,
  status text DEFAULT 'received'
);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Admins can view ai messages"
    ON public.ai_messages FOR SELECT
    USING (is_admin());

  CREATE POLICY "System can insert ai messages"
    ON public.ai_messages FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE TRIGGER ai_messages_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.ai_messages
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at
  ON public.ai_messages(created_at);
