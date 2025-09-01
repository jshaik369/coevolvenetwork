-- Create automation jobs table for managing AI tasks
CREATE TABLE public.automation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('perplexity_insights', 'gmail_processor', 'business_intelligence', 'weekly_report', 'market_analysis', 'lead_scoring')),
  schedule_cron TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  dry_run_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation logs table for immutable audit trail
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.automation_jobs(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'debug')) DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  execution_time_ms INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI insights table for Perplexity analysis storage
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('market_analysis', 'competitor_research', 'trend_analysis', 'business_intelligence', 'lead_analysis')),
  query_text TEXT NOT NULL,
  response_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  source_urls TEXT[],
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create business intelligence table for competitive analysis
CREATE TABLE public.business_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('competitor_analysis', 'market_trends', 'industry_insights', 'opportunity_analysis', 'risk_assessment')),
  target_entity TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  key_findings TEXT[],
  recommendations TEXT[],
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  is_confidential BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Gmail metadata table (no content, headers only)
CREATE TABLE public.gmail_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  thread_id TEXT,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  subject TEXT,
  snippet TEXT,
  labels TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  has_attachments BOOLEAN DEFAULT false,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  classification TEXT CHECK (classification IN ('lead', 'customer', 'vendor', 'internal', 'spam', 'unclassified')) DEFAULT 'unclassified',
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy consents table for GDPR compliance
CREATE TABLE public.privacy_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('analytics', 'marketing', 'processing', 'automation', 'ai_analysis')),
  consent_given BOOLEAN NOT NULL,
  consent_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automation_jobs (admin only)
CREATE POLICY "Admins can manage automation jobs" 
ON public.automation_jobs 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for automation_logs (admin only, immutable)
CREATE POLICY "Admins can view automation logs" 
ON public.automation_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert automation logs" 
ON public.automation_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for ai_insights (admin only)
CREATE POLICY "Admins can manage AI insights" 
ON public.ai_insights 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for business_intelligence (admin only)
CREATE POLICY "Admins can manage business intelligence" 
ON public.business_intelligence 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for gmail_metadata (admin only)
CREATE POLICY "Admins can manage Gmail metadata" 
ON public.gmail_metadata 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create RLS policies for privacy_consents (admin only)
CREATE POLICY "Admins can manage privacy consents" 
ON public.privacy_consents 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create indexes for performance
CREATE INDEX idx_automation_jobs_type_enabled ON public.automation_jobs(job_type, is_enabled);
CREATE INDEX idx_automation_jobs_next_run ON public.automation_jobs(next_run_at) WHERE is_enabled = true;
CREATE INDEX idx_automation_logs_job_execution ON public.automation_logs(job_id, execution_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at);
CREATE INDEX idx_ai_insights_type_created ON public.ai_insights(insight_type, created_at);
CREATE INDEX idx_business_intelligence_type_priority ON public.business_intelligence(analysis_type, priority_level);
CREATE INDEX idx_gmail_metadata_sender_timestamp ON public.gmail_metadata(sender_email, timestamp);
CREATE INDEX idx_gmail_metadata_classification_score ON public.gmail_metadata(classification, lead_score);
CREATE INDEX idx_privacy_consents_user_type ON public.privacy_consents(user_identifier, consent_type);

-- Create trigger for updating updated_at timestamps
CREATE TRIGGER update_automation_jobs_updated_at
BEFORE UPDATE ON public.automation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_intelligence_updated_at
BEFORE UPDATE ON public.business_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();