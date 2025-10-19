-- Create backup history table for tracking Google Drive backups
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_timestamp TIMESTAMPTZ NOT NULL,
  drive_file_id TEXT NOT NULL,
  drive_folder_id TEXT,
  table_name TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_history_timestamp ON backup_history(backup_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_backup_history_table ON backup_history(table_name);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);

-- Add RLS policies
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backup history"
  ON backup_history FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert backup history"
  ON backup_history FOR INSERT
  WITH CHECK (true);

-- Add performance indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_job_id ON automation_logs(job_id);

CREATE INDEX IF NOT EXISTS idx_gmail_metadata_timestamp ON gmail_metadata(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gmail_metadata_classification ON gmail_metadata(classification);
CREATE INDEX IF NOT EXISTS idx_gmail_metadata_lead_score ON gmail_metadata(lead_score DESC) WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON performance_metrics(session_id);