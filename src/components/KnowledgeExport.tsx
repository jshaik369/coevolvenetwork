import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database, Shield, Bot, Settings, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const KnowledgeExport = () => {
  const [exporting, setExporting] = useState(false);

  const generateCompleteKnowledgeBase = () => {
    const knowledgeBase = `# C.E.Network Complete Knowledge Base
*Swiss-Grade Business Intelligence & Automation Platform*
*Generated: ${new Date().toISOString()}*

---

## 🛡️ SYSTEM OVERVIEW

### Architecture Classification
- **Security Level**: CIA-Grade
- **Compliance**: Swiss FINMA Ready
- **Architecture**: Forensic-Ready Infrastructure
- **Deployment**: Supabase Edge Functions + React Frontend
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with Admin Roles

### Core Capabilities
1. **Real-time Analytics Collection**: User behavior, performance metrics, cultural data
2. **AI-Powered Insights**: Perplexity API integration for business intelligence
3. **Gmail Processing**: Automated email classification and lead scoring
4. **Google Drive Backup**: Encrypted, checksummed data archival
5. **Audit Ledger**: Immutable blockchain-style transaction logging
6. **Natural Language Assistant**: Voice/text command interface
7. **Automation Orchestrator**: Scheduled job management system

---

## 🔧 TECHNICAL INFRASTRUCTURE

### Supabase Project Configuration
- **Project ID**: joovupvjegfnjgkyxekf
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb3Z1cHZqZWdmbmpna3l4ZWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjk0MTYsImV4cCI6MjA3MDcwNTQxNn0.nTvkfT4wJOuSm0LUyrrFGR2xXM6A0-5ManYo31mg9Q8

### Database Schema

#### Core Tables:

**user_roles**
- Purpose: Role-based access control
- Columns: id, user_id, role (enum: admin, moderator, user), created_at, created_by
- RLS Policies: Admin management, self-view capabilities

**analytics** 
- Purpose: User behavior and interaction tracking
- Columns: id, session_id, user_id, timestamp, location, interactions, collaboration, cultural_data, viewport, user_agent, is_before_unload
- RLS Policies: Public insert, admin/owner read access

**performance_metrics**
- Purpose: Application performance monitoring  
- Columns: id, session_id, timestamp, page_load, navigation, resources, errors, vitals, is_before_unload
- RLS Policies: Public insert, admin read access

**automation_jobs**
- Purpose: Scheduled task configuration
- Columns: id, name, description, job_type, schedule_cron, is_enabled, dry_run_enabled, config, last_run_at, next_run_at, created_by
- RLS Policies: Admin-only access

**automation_logs**
- Purpose: Job execution tracking
- Columns: id, job_id, execution_id, status, log_level, message, metadata, execution_time_ms, created_by
- RLS Policies: Admin view, system insert

**ai_insights**
- Purpose: AI-generated business intelligence
- Columns: id, insight_type, query_text, response_data, source_urls, tags, confidence_score, expires_at, is_archived, created_by
- RLS Policies: Admin-only access

**business_intelligence**
- Purpose: Strategic analysis data
- Columns: id, analysis_type, target_entity, analysis_data, key_findings, recommendations, priority_level, is_confidential, created_by
- RLS Policies: Admin-only access

**gmail_metadata**
- Purpose: Email processing and classification
- Columns: id, message_id, thread_id, sender_email, sender_name, subject, snippet, labels, classification, has_attachments, lead_score, metadata, processed_at, created_by
- RLS Policies: Admin-only access

**privacy_consents**
- Purpose: GDPR compliance tracking
- Columns: id, user_identifier, consent_type, consent_given, consent_details, ip_address, user_agent, expires_at, withdrawn_at
- RLS Policies: Admin-only access

**email_signups**
- Purpose: Marketing lead collection
- Columns: id, email, source, created_at, updated_at
- RLS Policies: Public insert, admin view

**audit_ledger**
- Purpose: Immutable transaction log
- Columns: id, sequence_number, timestamp, table_name, operation, record_id, old_values, new_values, user_id, metadata, hash, previous_hash, merkle_root
- RLS Policies: Admin view only, immutable

#### Database Functions:

**Security Functions**:
- \`is_admin()\`: Check if current user has admin role
- \`has_role(_user_id, _role)\`: Security definer role checking
- \`has_any_role(_roles[])\`: Multi-role validation
- \`initialize_first_admin(_user_id)\`: Bootstrap first admin
- \`auto_initialize_first_admin()\`: Trigger-based admin creation

**Audit Functions**:
- \`audit_trigger()\`: Automatic audit logging trigger
- \`generate_audit_hash(...)\`: SHA-256 hash generation for audit chain
- \`insert_audit_log(...)\`: Secure audit entry creation

**Utility Functions**:
- \`update_updated_at_column()\`: Automatic timestamp updates

---

## 🚀 EDGE FUNCTIONS

### analytics
- **Purpose**: Collect and store user analytics data
- **JWT Required**: No (public endpoint)
- **Functionality**: Session tracking, user behavior, performance metrics

### performance-metrics  
- **Purpose**: Application performance monitoring
- **JWT Required**: No (public endpoint)
- **Functionality**: Page load times, resource usage, error tracking

### perplexity-insights
- **Purpose**: AI-powered business intelligence generation
- **JWT Required**: Yes (admin only)
- **API Integration**: Perplexity AI for real-time analysis
- **Models**: llama-3.1-sonar-small-128k-online, llama-3.1-sonar-large-128k-online

### gmail-processor
- **Purpose**: Automated email processing and classification
- **JWT Required**: Yes (admin only)
- **Functionality**: Email parsing, lead scoring, metadata extraction

### drive-backup
- **Purpose**: Secure data backup to Google Drive
- **JWT Required**: Yes (admin only)
- **Features**: 
  - Data pseudonymization for privacy
  - SHA-256 checksums for integrity
  - Dated folder organization
  - Retention policy enforcement

### automation-orchestrator
- **Purpose**: Manage and execute automation jobs
- **JWT Required**: Yes (admin only)
- **Capabilities**:
  - Job scheduling and execution
  - Status monitoring
  - Error handling and logging
  - Dry-run mode support

### system-self-test
- **Purpose**: Comprehensive system diagnostics
- **JWT Required**: Yes (admin only)
- **Tests**:
  - Database connectivity
  - RLS policy validation  
  - Edge function responsiveness
  - Google Workspace integration
  - Audit ledger integrity
  - Privilege escalation detection

### send-email
- **Purpose**: Email notification system
- **JWT Required**: No (internal use)
- **Integration**: EmailJS for transactional emails

### setup-initial-jobs
- **Purpose**: Bootstrap automation infrastructure
- **JWT Required**: Yes (admin only)
- **Functionality**: Create default automation jobs

---

## 🔒 SECURITY ARCHITECTURE

### Authentication & Authorization
- **Provider**: Supabase Auth
- **Role System**: Enum-based (admin, moderator, user)
- **Access Control**: Row Level Security (RLS) policies
- **Admin Bootstrap**: Automatic first-user promotion
- **Session Management**: JWT-based with expiration

### Data Protection
- **Encryption**: TLS 1.3 for all communications
- **Pseudonymization**: Automatic for sensitive analytics data
- **Audit Trail**: Immutable blockchain-style logging
- **Backup Security**: Encrypted Google Drive storage
- **Privacy Compliance**: GDPR-ready consent tracking

### Security Monitoring
- **Audit Ledger**: Every data change logged with cryptographic hashing
- **Access Logging**: Authentication and authorization events
- **System Self-Test**: Automated security posture validation
- **Privilege Escalation Detection**: Continuous monitoring for unauthorized admin access
- **Data Integrity**: SHA-256 checksums for all backups

---

## 🤖 ASSISTANT INTERFACE

### Supported Commands

**System Operations**:
- "Run full system diagnostics" → Executes system-self-test
- "Backup all data to Google Drive" → Triggers drive-backup with all data types
- "Show me today's automation status" → Lists job execution status
- "Check system security posture" → Security validation report

**Analytics & Intelligence**:
- "Analyze website performance trends" → Performance metrics analysis
- "Generate business intelligence summary" → AI insights generation
- "Show user engagement patterns" → Analytics data interpretation
- "Create competitive analysis report" → Market research via Perplexity
- "Identify security anomalies" → Audit log analysis

**Automation Management**:
- "Enable all automation jobs" → Bulk job activation
- "Disable Gmail processing temporarily" → Specific job control
- "Schedule backup for tonight" → Timed job scheduling
- "Run perplexity analysis on recent data" → On-demand AI processing
- "Check automation job health" → System status overview

### Voice Interface
- **Speech Recognition**: Web Speech API integration
- **Audio Feedback**: Text-to-speech responses
- **Command Parsing**: Natural language understanding
- **Multi-language**: Extensible language support

---

## ⚙️ AUTOMATION JOBS

### Default Job Types

**perplexity_insights**
- **Schedule**: Daily at 02:00 UTC
- **Purpose**: Generate AI-powered business intelligence
- **Config**: Trend analysis, market research, competitive intelligence
- **Output**: Structured insights with confidence scores

**gmail_processing**  
- **Schedule**: Every 15 minutes
- **Purpose**: Process incoming emails for lead classification
- **Config**: IMAP integration, classification rules, lead scoring
- **Output**: Structured email metadata with lead scores

**drive_backup**
- **Schedule**: Weekly on Sundays at 03:00 UTC
- **Purpose**: Comprehensive data backup to Google Drive
- **Config**: All data types, 7-year retention, encryption enabled
- **Output**: Checksummed backup files with integrity verification

**system_health_check**
- **Schedule**: Every 6 hours
- **Purpose**: Automated system diagnostics
- **Config**: All components, detailed reporting
- **Output**: System health reports with anomaly detection

**analytics_processing**
- **Schedule**: Hourly
- **Purpose**: Process and aggregate analytics data
- **Config**: Session aggregation, performance trending
- **Output**: Processed analytics summaries

### Job Configuration Schema
\`\`\`json
{
  "schedule_cron": "0 2 * * *",
  "is_enabled": true,
  "dry_run_enabled": false,
  "config": {
    "data_types": ["analytics", "automation_logs"],
    "retention_years": 7,
    "include_ai_insights": true,
    "notification_email": "admin@domain.com"
  }
}
\`\`\`

---

## 📊 OPERATIONS PROCEDURES

### Daily Operations Checklist
1. ✅ Check automation dashboard for failed jobs
2. ✅ Review overnight analytics collection
3. ✅ Verify backup completion status  
4. ✅ Check AI insights for actionable items
5. ✅ Review privacy compliance metrics

### Weekly Maintenance  
1. 🔧 Run full system self-test
2. 🔧 Review and archive old AI insights
3. 🔧 Check Google Drive backup integrity
4. 🔧 Analyze performance trends
5. 🔧 Update automation job configurations

### Monthly Security Review
1. 🛡️ Audit user roles and permissions
2. 🛡️ Review authentication logs
3. 🛡️ Validate RLS policy effectiveness
4. 🛡️ Check audit ledger integrity
5. 🛡️ Security posture assessment

### Incident Response Procedures

**Security Incident**:
1. Immediately check audit ledger for anomalies
2. Review recent authentication logs
3. Verify admin access patterns
4. Check automation job execution logs
5. Generate security incident report
6. Implement containment measures
7. Document lessons learned

**System Outage**:
1. Run system self-test diagnostics
2. Check Edge Function logs
3. Verify database connectivity
4. Review recent deployments
5. Implement recovery procedures
6. Communicate status to stakeholders

**Data Integrity Issue**:
1. Check audit ledger hash chain
2. Verify backup checksums
3. Compare data across environments
4. Identify corruption source
5. Restore from verified backup
6. Implement preventive measures

---

## 🔧 CONFIGURATION REFERENCE

### Environment Variables (Supabase Secrets)
- \`GOOGLE_WORKSPACE_ADMIN_EMAIL\`: Admin email for Google API
- \`GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY\`: Google service account JSON
- \`PERPLEXITY_API_KEY\`: Perplexity AI API access key
- \`EMAILJS_SERVICE_ID\`: EmailJS service identifier
- \`EMAILJS_TEMPLATE_ID\`: EmailJS template identifier  
- \`EMAILJS_PUBLIC_KEY\`: EmailJS public key
- \`SUPABASE_URL\`: Supabase project URL
- \`SUPABASE_ANON_KEY\`: Supabase anonymous key
- \`SUPABASE_SERVICE_ROLE_KEY\`: Supabase service role key
- \`SUPABASE_DB_URL\`: Database connection string

### Frontend Routes
- \`/\`: Homepage with analytics collection
- \`/auth\`: Authentication interface
- \`/careers\`: Career opportunities page
- \`/privacy-policy\`: Privacy policy and terms
- \`/analytics\`: Admin analytics dashboard
- \`/automation\`: Automation control center
- \`/assistant\`: AI assistant interface
- \`/operator-guide\`: Comprehensive operations manual

### API Endpoints
- \`/functions/v1/analytics\`: Analytics data collection
- \`/functions/v1/performance-metrics\`: Performance monitoring
- \`/functions/v1/perplexity-insights\`: AI intelligence generation
- \`/functions/v1/gmail-processor\`: Email processing
- \`/functions/v1/drive-backup\`: Data backup operations
- \`/functions/v1/automation-orchestrator\`: Job management
- \`/functions/v1/system-self-test\`: System diagnostics
- \`/functions/v1/send-email\`: Email notifications

---

## 📈 ANALYTICS & MONITORING

### Key Metrics Tracked
1. **User Engagement**: Session duration, page views, interaction patterns
2. **Performance**: Load times, error rates, resource usage
3. **Business Intelligence**: Trend analysis, market insights, competitive data
4. **System Health**: Function performance, database connectivity, error rates
5. **Security**: Authentication events, access patterns, anomaly detection

### Data Collection Methods
- **Frontend Tracking**: Real-time user behavior capture
- **Performance Monitoring**: Core Web Vitals and custom metrics
- **Server Monitoring**: Edge Function execution logs
- **Database Monitoring**: Query performance and connection health
- **External APIs**: Third-party service integration status

### Reporting Capabilities
- **Real-time Dashboards**: Live system status and user activity
- **Scheduled Reports**: Daily, weekly, monthly intelligence summaries
- **Alert System**: Automated notifications for anomalies
- **Export Functions**: CSV, JSON, and formatted report generation
- **Historical Analysis**: Trend identification and forecasting

---

## 🌐 INTEGRATION REFERENCE

### Google Workspace Integration
- **Gmail API**: Email processing and classification
- **Drive API**: Secure backup storage with folder organization
- **Service Account**: Automated authentication for batch operations
- **OAuth Scopes**: Minimal required permissions for security

### Perplexity AI Integration  
- **Models Available**:
  - \`llama-3.1-sonar-small-128k-online\` (8B parameters)
  - \`llama-3.1-sonar-large-128k-online\` (70B parameters)
  - \`llama-3.1-sonar-huge-128k-online\` (405B parameters)
- **Use Cases**: Market research, competitive analysis, trend identification
- **Response Processing**: Structured data extraction with confidence scoring

### EmailJS Integration
- **Purpose**: Transactional email notifications
- **Templates**: System alerts, user notifications, reports
- **Delivery**: Reliable SMTP with tracking capabilities

---

## 🔄 BACKUP & RECOVERY

### Backup Strategy
- **Frequency**: 
  - Critical data: Real-time replication
  - User data: Daily incremental backups
  - System configs: Weekly full backups
  - Analytics: Monthly archives
- **Storage**: Google Drive with encryption and checksums
- **Retention**: 7-year policy with automatic cleanup
- **Testing**: Monthly restore verification

### Disaster Recovery Plan
1. **Assessment**: Determine scope and impact
2. **Communication**: Notify stakeholders and users
3. **Isolation**: Contain the issue to prevent spread
4. **Recovery**: Restore from verified backups
5. **Validation**: Test system functionality
6. **Documentation**: Record incident and lessons learned

### Data Recovery Procedures
- **Point-in-time Recovery**: Database restoration to specific moments
- **Selective Restore**: Individual table or record recovery
- **Cross-region Failover**: Geographic redundancy activation
- **Audit Trail Verification**: Ensure data integrity post-recovery

---

## 📋 COMPLIANCE & GOVERNANCE

### Privacy Compliance (GDPR)
- **Consent Management**: Granular consent tracking and withdrawal
- **Data Subject Rights**: Automated access, rectification, and deletion
- **Data Processing Records**: Comprehensive audit trails
- **Privacy by Design**: Built-in data protection measures
- **Data Protection Officer**: Designated responsible party

### Financial Compliance (Swiss FINMA)
- **Audit Requirements**: Immutable transaction logging
- **Data Residency**: Swiss/EU data center requirements
- **Access Controls**: Multi-factor authentication and role separation
- **Reporting**: Automated compliance report generation
- **Risk Management**: Continuous monitoring and assessment

### Operational Governance
- **Change Management**: Controlled deployment procedures
- **Access Review**: Quarterly permission audits
- **Incident Management**: Structured response protocols
- **Documentation**: Comprehensive operational procedures
- **Training**: Regular security and compliance education

---

## 🚨 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

**Authentication Problems**:
- Issue: Users cannot log in
- Check: Supabase Auth service status
- Solution: Verify email/password, check for service outages
- Prevention: Implement backup authentication methods

**Edge Function Timeouts**:
- Issue: Functions exceeding execution limits
- Check: Function logs for bottlenecks
- Solution: Optimize database queries, implement caching
- Prevention: Performance monitoring and alerting

**Database Connection Issues**:
- Issue: Connection pool exhaustion
- Check: Active connection count and query performance
- Solution: Restart connections, optimize long-running queries
- Prevention: Connection pooling configuration

**Backup Failures**:
- Issue: Google Drive backup not completing
- Check: API quotas and authentication status
- Solution: Retry with exponential backoff, verify credentials
- Prevention: Monitor API usage and credential expiration

**AI Integration Errors**:
- Issue: Perplexity API returning errors
- Check: API key validity and quota limits
- Solution: Implement retry logic, fallback to cached data
- Prevention: Monitor API usage and implement circuit breakers

### Diagnostic Commands
\`\`\`bash
# Check system health
"Run full system diagnostics"

# Verify backup integrity  
"Check Google Drive backup status"

# Analyze performance
"Show performance metrics summary"

# Review security
"Generate security audit report"

# Test AI integration
"Test Perplexity API connection"
\`\`\`

---

## 📚 ADDITIONAL RESOURCES

### Documentation Links
- [Supabase Dashboard](https://supabase.com/dashboard/project/joovupvjegfnjgkyxekf)
- [Edge Functions](https://supabase.com/dashboard/project/joovupvjegfnjgkyxekf/functions)
- [Database Editor](https://supabase.com/dashboard/project/joovupvjegfnjgkyxekf/editor)
- [Authentication](https://supabase.com/dashboard/project/joovupvjegfnjgkyxekf/auth/users)
- [Function Logs](https://supabase.com/dashboard/project/joovupvjegfnjgkyxekf/functions)

### Support Contacts
- **Technical Issues**: Check Edge Function logs and system diagnostics
- **Security Incidents**: Follow incident response procedures
- **Data Recovery**: Use backup restoration procedures
- **Compliance Questions**: Review governance documentation

### Emergency Procedures
1. **System Down**: Execute disaster recovery plan
2. **Security Breach**: Implement incident response protocol
3. **Data Loss**: Activate backup recovery procedures
4. **Compliance Issue**: Engage legal and compliance teams

---

## 🔮 FUTURE ENHANCEMENTS

### Planned Features
1. **Advanced AI Models**: Integration with GPT-5 and O3 reasoning models
2. **Multi-tenant Architecture**: Support for multiple organizations
3. **Real-time Collaboration**: Live document editing and sharing
4. **Mobile Applications**: Native iOS and Android apps
5. **Advanced Analytics**: Predictive modeling and forecasting

### Technology Roadmap
- **Q1**: Enhanced security features and compliance automation
- **Q2**: Advanced AI integration and natural language processing
- **Q3**: Mobile application development and deployment
- **Q4**: Multi-tenant architecture and enterprise features

### Performance Optimization
- **Caching Strategy**: Redis implementation for frequently accessed data
- **CDN Integration**: Global content delivery optimization
- **Database Optimization**: Query performance and indexing improvements
- **Edge Computing**: Geographic distribution of compute resources

---

## ⚡ QUICK REFERENCE

### Emergency Commands
- \`Run full system diagnostics\` - Complete health check
- \`Backup all data to Google Drive\` - Emergency backup
- \`Check system security posture\` - Security validation
- \`Generate incident report\` - Document issues

### Key Shortcuts
- **Ctrl+Shift+D**: Open diagnostics
- **Ctrl+Shift+B**: Trigger backup
- **Ctrl+Shift+S**: Security check
- **Ctrl+Shift+L**: View logs

### Critical Thresholds
- **Function Timeout**: 30 seconds
- **Database Connections**: 100 max
- **Storage Usage**: 80% warning, 90% critical
- **API Rate Limits**: Monitor quotas continuously

---

*This knowledge base represents the complete operational documentation for the C.E.Network Swiss-grade business intelligence platform. It should be treated as confidential and used only by authorized personnel with appropriate security clearance.*

**Document Version**: 1.0  
**Last Updated**: ${new Date().toISOString()}  
**Classification**: CONFIDENTIAL - UHNW CLIENT DATA  
**Approval**: C.E.Network Technical Architecture Board
`;

    return knowledgeBase;
  };

  const downloadKnowledgeBase = () => {
    setExporting(true);
    try {
      const content = generateCompleteKnowledgeBase();
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CE-Network-Knowledge-Base-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Knowledge Base Exported",
        description: "Complete system documentation downloaded for NotebookLM import."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Unable to generate knowledge base.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Complete Knowledge Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 border rounded-lg">
            <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Database Schema</p>
            <p className="text-xs text-muted-foreground">Complete structure</p>
          </div>
          <div className="p-3 border rounded-lg">
            <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Security Protocols</p>
            <p className="text-xs text-muted-foreground">All procedures</p>
          </div>
          <div className="p-3 border rounded-lg">
            <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Edge Functions</p>
            <p className="text-xs text-muted-foreground">Full documentation</p>
          </div>
          <div className="p-3 border rounded-lg">
            <Bot className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Assistant Commands</p>
            <p className="text-xs text-muted-foreground">Complete library</p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Export Includes:</h3>
          <ul className="text-sm space-y-1">
            <li>• Complete database schema with RLS policies</li>
            <li>• All Edge Function documentation and configurations</li>
            <li>• Security architecture and compliance procedures</li>
            <li>• Automation job definitions and schedules</li>
            <li>• Assistant command library and voice interface</li>
            <li>• Operations procedures and troubleshooting guides</li>
            <li>• Integration references (Google, Perplexity, EmailJS)</li>
            <li>• Backup/recovery procedures and disaster planning</li>
            <li>• Analytics tracking and monitoring capabilities</li>
            <li>• Compliance frameworks (GDPR, Swiss FINMA)</li>
          </ul>
        </div>

        <Button 
          onClick={downloadKnowledgeBase}
          disabled={exporting}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Generating...' : 'Download Complete Knowledge Base'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Generates comprehensive Markdown file for Google NotebookLM import
        </p>
      </CardContent>
    </Card>
  );
};

export default KnowledgeExport;