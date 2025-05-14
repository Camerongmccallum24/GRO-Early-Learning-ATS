import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  UsersIcon, 
  ShieldIcon, 
  KeyIcon, 
  ServerIcon, 
  DatabaseIcon, 
  SettingsIcon, 
  RefreshCwIcon, 
  MailIcon, 
  FileTextIcon, 
  SparklesIcon,
  LineChartIcon 
} from "lucide-react";

interface AdminGuideProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const AdminGuideItem = ({ title, icon: Icon, children }: AdminGuideProps) => {
  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span>{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export function AdminGuides() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle>Administrator Guides</CardTitle>
            <CardDescription>Advanced features and system management for admin users</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          <AdminGuideItem title="User Management" icon={UsersIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Adding and Managing Users</h4>
              <p>As an administrator, you can create and manage user accounts for HR staff and hiring managers.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Creating a new user:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; User Management</li>
                    <li>Click "Add New User" button</li>
                    <li>Fill in user details: name, email, and role assignment</li>
                    <li>The system will send an invitation email to the new user with instructions to set up their password</li>
                  </ul>
                </li>
                <li>
                  <strong>Editing user permissions:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Select a user from the list</li>
                    <li>Click "Edit" to modify their details or role</li>
                    <li>Save changes when complete</li>
                  </ul>
                </li>
                <li>
                  <strong>Deactivating users:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Select the user you wish to deactivate</li>
                    <li>Click "Deactivate Account"</li>
                    <li>Confirm the action when prompted</li>
                    <li>Deactivated users cannot log in but their account history is preserved</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <strong>Best Practice:</strong> Review user activity logs periodically to ensure appropriate system usage and security compliance.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="System Configuration" icon={SettingsIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Configuring System Settings</h4>
              <p>The system has several configuration options that can be customized to match your organization's workflow.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Email Templates:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Email Templates</li>
                    <li>Select the template you wish to edit (application confirmation, interview invitation, etc.)</li>
                    <li>Use the rich text editor to modify the content</li>
                    <li>Available variables are shown on the right sidebar (candidate name, job title, etc.)</li>
                    <li>Save changes or click "Reset to Default" to revert to the system default</li>
                  </ul>
                </li>
                <li>
                  <strong>Workflow Stages:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Application Workflow</li>
                    <li>You can add, remove, or reorder the stages in your hiring process</li>
                    <li>For each stage, you can configure:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Stage name and description</li>
                        <li>Required actions before moving to next stage</li>
                        <li>Automatic notifications</li>
                        <li>Form fields specific to this stage</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Custom Fields:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Custom Fields</li>
                    <li>You can create custom fields for:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Job Postings</li>
                        <li>Candidate profiles</li>
                        <li>Application forms</li>
                        <li>Interview evaluations</li>
                      </ul>
                    </li>
                    <li>For each field, configure type (text, dropdown, checkbox, date, etc.)</li>
                    <li>Set validations if required (minimum/maximum values, required fields, etc.)</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                <strong>Important:</strong> After making significant workflow changes, test the system by creating a test job and application to ensure everything flows correctly.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Data Management" icon={DatabaseIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Managing and Protecting Candidate Data</h4>
              <p>As an administrator, you are responsible for ensuring proper data management in compliance with privacy regulations.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Data Retention Policies:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Data Management &gt; Retention Policies</li>
                    <li>Configure how long candidate data is kept based on application status:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Rejected candidates (recommended: 6-12 months)</li>
                        <li>Hired candidates (recommended: according to employment regulations)</li>
                        <li>Withdrawn applications (recommended: 3-6 months)</li>
                      </ul>
                    </li>
                    <li>Set up automated notifications for data deletion</li>
                    <li>Configure exceptions for specific candidates or talent pool members</li>
                  </ul>
                </li>
                <li>
                  <strong>Data Export:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Data Management &gt; Export</li>
                    <li>Select the data types to export (candidates, applications, job postings)</li>
                    <li>Choose date range and status filters</li>
                    <li>Select export format (CSV, Excel, PDF)</li>
                    <li>Exports are encrypted and password protected</li>
                    <li>All exports are logged for compliance purposes</li>
                  </ul>
                </li>
                <li>
                  <strong>Handling Data Access Requests:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>When a candidate requests access to their data:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Navigate to the candidate's profile</li>
                        <li>Click "Generate GDPR Report"</li>
                        <li>The system will compile all data associated with the candidate</li>
                        <li>Review the report before sending to ensure accuracy</li>
                        <li>Use the "Send Secure Link" option to deliver the report</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Data Deletion:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>For individual candidate deletion:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Find the candidate profile</li>
                        <li>Click "Delete Data" from the actions menu</li>
                        <li>Confirm permanent deletion or select "Anonymize" to keep statistical data</li>
                      </ul>
                    </li>
                    <li>For bulk deletion based on retention policies:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Go to Settings &gt; Data Management &gt; Cleanup</li>
                        <li>Review the list of candidates flagged for deletion</li>
                        <li>Select all or specific records to proceed with deletion</li>
                        <li>The system keeps a compliance log of all deletions</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                <strong>Critical:</strong> Data deletion is permanent and cannot be reversed. Always verify data before proceeding with deletion operations.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="API Integration" icon={ServerIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Integrating with External Systems</h4>
              <p>The ATS provides API endpoints for integration with other HR systems, job boards, and internal tools.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>API Key Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Integrations &gt; API Keys</li>
                    <li>Click "Generate New API Key"</li>
                    <li>Label the key with a descriptive name (e.g., "HRIS Integration")</li>
                    <li>Set appropriate permission scopes:
                      <ul className="list-disc pl-5 mt-1">
                        <li>read:candidates - View candidate data</li>
                        <li>write:candidates - Create or update candidates</li>
                        <li>read:jobs - View job postings</li>
                        <li>write:jobs - Create or update job postings</li>
                        <li>read:applications - View application data</li>
                        <li>write:applications - Update application status</li>
                      </ul>
                    </li>
                    <li>Set expiration date for the key (recommended: 1 year maximum)</li>
                    <li>Copy the key immediately as it will not be displayed again</li>
                  </ul>
                </li>
                <li>
                  <strong>Webhook Configuration:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Integrations &gt; Webhooks</li>
                    <li>Click "Add Webhook"</li>
                    <li>Enter the destination URL that will receive the webhook data</li>
                    <li>Select events to trigger the webhook:
                      <ul className="list-disc pl-5 mt-1">
                        <li>application.created</li>
                        <li>application.status_changed</li>
                        <li>candidate.created</li>
                        <li>job.published</li>
                        <li>interview.scheduled</li>
                      </ul>
                    </li>
                    <li>Set up a secret key for webhook validation</li>
                    <li>Test the webhook from the interface to verify connectivity</li>
                  </ul>
                </li>
                <li>
                  <strong>Job Board Integration:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Integrations &gt; Job Boards</li>
                    <li>Select from available job board connectors:
                      <ul className="list-disc pl-5 mt-1">
                        <li>SEEK</li>
                        <li>Indeed</li>
                        <li>LinkedIn</li>
                        <li>Custom RSS feed</li>
                      </ul>
                    </li>
                    <li>Follow the authentication flow for each service</li>
                    <li>Configure auto-publish settings if desired</li>
                    <li>Set up job mapping fields to ensure proper data transfer</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-purple-50 text-purple-800 rounded-md">
                <strong>Developer Resources:</strong> Comprehensive API documentation is available at <code>https://api-docs.groearlylearning-ats.com</code> including sample code and integration examples.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Advanced AI Configuration" icon={SparklesIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Configuring AI Features for Optimal Results</h4>
              <p>The system's AI capabilities can be fine-tuned to meet your specific recruitment needs.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Resume Parser Training:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; AI Configuration &gt; Resume Parser</li>
                    <li>Review extraction accuracy statistics for different fields</li>
                    <li>For fields with lower accuracy:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Click "Add Training Examples"</li>
                        <li>Upload example resumes where the field appears</li>
                        <li>Manually highlight where the information appears</li>
                        <li>Save to improve future extraction accuracy</li>
                      </ul>
                    </li>
                    <li>Add industry-specific terminology to the recognition dictionary:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Under "Industry Terms," add early childhood education certifications</li>
                        <li>Add common abbreviations used in the field</li>
                        <li>Map these terms to standardized skills in your database</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Email Assistant Customization:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; AI Configuration &gt; Email Assistant</li>
                    <li>Modify tone and style preferences:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Formality level (1-5)</li>
                        <li>Brevity preference (concise vs. detailed)</li>
                        <li>Brand voice characteristics</li>
                      </ul>
                    </li>
                    <li>Add organization-specific phrases or terminology</li>
                    <li>Configure situation-specific guidance:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Rejection emails (tone, alternative opportunities to mention)</li>
                        <li>Interview invitations (information to include)</li>
                        <li>Offer communications (confidentiality reminders)</li>
                      </ul>
                    </li>
                    <li>Test generated emails for different scenarios</li>
                  </ul>
                </li>
                <li>
                  <strong>Job-Candidate Matching Weights:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; AI Configuration &gt; Matching Algorithm</li>
                    <li>Adjust relative importance weights for different factors:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Required vs. preferred qualifications</li>
                        <li>Years of experience vs. specific skills</li>
                        <li>Education level vs. certifications</li>
                        <li>Recent vs. older experience</li>
                      </ul>
                    </li>
                    <li>Configure minimum thresholds for match percentages</li>
                    <li>Set up role-specific matching templates (different weights for different position types)</li>
                  </ul>
                </li>
                <li>
                  <strong>AI Usage Analytics:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Review AI feature usage and effectiveness:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Parse success rates for different resume formats</li>
                        <li>Email generation usage statistics</li>
                        <li>Match score correlation with hiring decisions</li>
                      </ul>
                    </li>
                    <li>Identify areas for improvement based on these metrics</li>
                    <li>Configure monthly AI performance reports to be emailed to administrators</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
                <strong>Optimization Tip:</strong> The AI system improves over time with usage. Regularly review its performance and provide corrective feedback to continuously enhance accuracy.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Advanced Reporting" icon={LineChartIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Creating Custom Reports and Analytics</h4>
              <p>The reporting system allows administrators to create custom reports for tracking recruitment metrics and process efficiency.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Creating Custom Reports:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Reports &gt; Custom Reports</li>
                    <li>Click "Create New Report"</li>
                    <li>Select report type:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Recruitment Funnel Analysis</li>
                        <li>Time-to-Hire Metrics</li>
                        <li>Source Effectiveness</li>
                        <li>Diversity Analysis</li>
                        <li>Recruiter Performance</li>
                        <li>Custom Query Builder</li>
                      </ul>
                    </li>
                    <li>Configure filters:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Date range</li>
                        <li>Job categories</li>
                        <li>Locations</li>
                        <li>Application statuses</li>
                      </ul>
                    </li>
                    <li>Select visualization type (table, bar chart, line chart, etc.)</li>
                    <li>Save and name your report</li>
                  </ul>
                </li>
                <li>
                  <strong>Scheduled Reports:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>For any saved report, click "Schedule"</li>
                    <li>Configure delivery frequency:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Daily, weekly, monthly options</li>
                        <li>Select specific day and time</li>
                      </ul>
                    </li>
                    <li>Add email recipients</li>
                    <li>Select delivery format (PDF, Excel, HTML email)</li>
                    <li>Set automatic filters (e.g., always showing last 30 days)</li>
                  </ul>
                </li>
                <li>
                  <strong>Analytics Dashboard Configuration:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Reports &gt; Analytics Dashboard</li>
                    <li>Click "Edit Dashboard"</li>
                    <li>Add, remove, or arrange dashboard widgets</li>
                    <li>For each widget:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Select data source (saved report or metric)</li>
                        <li>Choose visualization type</li>
                        <li>Set refresh frequency</li>
                        <li>Configure drill-down options</li>
                      </ul>
                    </li>
                    <li>Create role-specific dashboards for different user types</li>
                  </ul>
                </li>
                <li>
                  <strong>Data Export API:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>For integration with external BI tools:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Navigate to Reports &gt; API Access</li>
                        <li>Generate a read-only API key with reporting scope</li>
                        <li>Configure allowed IP addresses for security</li>
                        <li>Access detailed API documentation for report endpoints</li>
                        <li>Set up data refresh schedules for cache management</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <strong>Best Practice:</strong> Create a standard set of reports for regular review with your recruitment team to identify bottlenecks and improvement opportunities in your hiring process.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="System Backup & Recovery" icon={RefreshCwIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Data Backup and System Recovery Procedures</h4>
              <p>Ensuring data safety and system availability is a critical administrative responsibility.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Manual Data Export:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; System &gt; Data Management</li>
                    <li>Click "Export All Data"</li>
                    <li>Select data categories to include:
                      <ul className="list-disc pl-5 mt-1">
                        <li>User accounts</li>
                        <li>Job postings</li>
                        <li>Candidates</li>
                        <li>Applications</li>
                        <li>Communications</li>
                        <li>System settings</li>
                      </ul>
                    </li>
                    <li>Choose export format (encrypted ZIP recommended)</li>
                    <li>Set password protection for the export file</li>
                    <li>The system will process the export and provide a download link</li>
                    <li>Store this backup in a secure, off-system location</li>
                  </ul>
                </li>
                <li>
                  <strong>Scheduled Backups:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; System &gt; Scheduled Backups</li>
                    <li>Configure backup frequency:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Daily (recommended for active recruitment periods)</li>
                        <li>Weekly (minimum recommendation)</li>
                      </ul>
                    </li>
                    <li>Set retention policy (how many backups to keep)</li>
                    <li>Configure secure storage location:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Encrypted cloud storage (recommended)</li>
                        <li>SFTP server</li>
                        <li>Secure email delivery</li>
                      </ul>
                    </li>
                    <li>Enable backup notifications to administrators</li>
                  </ul>
                </li>
                <li>
                  <strong>System Restore:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>In case of data corruption or critical issues:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Contact support through the emergency channel provided</li>
                        <li>Request system restore with your specific backup file or date</li>
                        <li>Approve the restore plan presented by support</li>
                        <li>System administrators will coordinate the restore process</li>
                        <li>Verify data integrity after restore completion</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Disaster Recovery Testing:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Quarterly recommended actions:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Download a current backup</li>
                        <li>Request a test restore in a sandbox environment</li>
                        <li>Verify data completeness and system functionality</li>
                        <li>Document the results and any issues encountered</li>
                        <li>Update recovery procedures based on findings</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                <strong>Critical:</strong> Never attempt a system restore on the production environment without consulting support. Improper restore procedures can result in permanent data loss.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Security Best Practices" icon={KeyIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Maintaining System Security</h4>
              <p>Protecting sensitive candidate and organizational data requires following security best practices.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>User Access Reviews:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Schedule quarterly access reviews:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Navigate to Settings &gt; Security &gt; User Access</li>
                        <li>Generate the "Access Review" report</li>
                        <li>Review all active users and their permission levels</li>
                        <li>Verify each user still requires their current access level</li>
                        <li>Revoke or modify access for users who have changed roles</li>
                        <li>Deactivate accounts for users who have left the organization</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Password Policy Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Security &gt; Password Policy</li>
                    <li>Configure security requirements:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Minimum password length (recommended: 12+ characters)</li>
                        <li>Complexity requirements</li>
                        <li>Password expiration period (90 days recommended)</li>
                        <li>Password history (prevent reuse of recent passwords)</li>
                        <li>Account lockout after failed attempts</li>
                      </ul>
                    </li>
                    <li>Enable two-factor authentication requirements</li>
                    <li>Configure single sign-on options if applicable</li>
                  </ul>
                </li>
                <li>
                  <strong>Security Logs and Monitoring:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Security &gt; Audit Logs</li>
                    <li>Review security-related events:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Failed login attempts</li>
                        <li>Password changes</li>
                        <li>Permission changes</li>
                        <li>Data exports</li>
                        <li>Configuration changes</li>
                      </ul>
                    </li>
                    <li>Configure automated alerts for suspicious activities</li>
                    <li>Set up log retention periods in compliance with your policies</li>
                  </ul>
                </li>
                <li>
                  <strong>Session Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Security &gt; Session Controls</li>
                    <li>Configure session timeout (recommended: 30-60 minutes of inactivity)</li>
                    <li>Enable "Force logout" option for immediate termination of user sessions</li>
                    <li>Set concurrent session limits (1-2 recommended)</li>
                    <li>Configure IP range restrictions if applicable</li>
                  </ul>
                </li>
                <li>
                  <strong>Data Protection Settings:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Security &gt; Data Protection</li>
                    <li>Configure document access controls:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Resume download permissions</li>
                        <li>Document watermarking options</li>
                        <li>Secure document viewer settings</li>
                      </ul>
                    </li>
                    <li>Set up data masking for sensitive information</li>
                    <li>Configure email security options</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md">
                <strong>Security Advisory:</strong> Review the security settings after each system update as new features may introduce additional configuration options that should be properly secured.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Email Integration Management" icon={MailIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Managing Email Service Integration</h4>
              <p>The system uses email services for candidate communications. Proper configuration ensures reliable delivery and maintains your organization's professional image.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Email Provider Configuration:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Integrations &gt; Email Service</li>
                    <li>Select your email provider:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Gmail (OAuth2)</li>
                        <li>Office 365</li>
                        <li>SMTP Server</li>
                        <li>SendGrid</li>
                      </ul>
                    </li>
                    <li>Follow the authentication flow for your selected provider</li>
                    <li>Configure sending limits to prevent triggering spam filters</li>
                    <li>Set up email tracking options</li>
                  </ul>
                </li>
                <li>
                  <strong>Email Authentication:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Ensure proper SPF, DKIM, and DMARC configuration:
                      <ul className="list-disc pl-5 mt-1">
                        <li>The system will provide the necessary DNS records</li>
                        <li>These records must be added to your domain's DNS settings</li>
                        <li>Verification tools are provided to check configuration</li>
                      </ul>
                    </li>
                    <li>Configure custom email domains for sending</li>
                    <li>Set up email aliases for different departments or roles</li>
                  </ul>
                </li>
                <li>
                  <strong>Email Delivery Monitoring:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Integrations &gt; Email Logs</li>
                    <li>Monitor email delivery status:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Sent emails</li>
                        <li>Delivery confirmations</li>
                        <li>Bounces and rejections</li>
                        <li>Opens and clicks (if tracking enabled)</li>
                      </ul>
                    </li>
                    <li>Configure failure notifications</li>
                    <li>Set up automatic retry attempts for failed deliveries</li>
                  </ul>
                </li>
                <li>
                  <strong>Email Quota Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Review email usage statistics:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Daily/monthly email volume</li>
                        <li>Distribution by email type</li>
                        <li>Peak usage times</li>
                      </ul>
                    </li>
                    <li>Configure rate limiting to prevent overwhelming services</li>
                    <li>Set up alerts for approaching quota limits</li>
                    <li>Configure fallback email providers if primary provider limits are reached</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <strong>Best Practice:</strong> Periodically send test emails to verify deliverability, especially after making changes to your email provider configuration or DNS settings.
              </div>
            </div>
          </AdminGuideItem>
          
          <AdminGuideItem title="Compliance Configuration" icon={FileTextIcon}>
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Managing Compliance Requirements</h4>
              <p>Configure the system to ensure compliance with employment laws and data protection regulations.</p>
              
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <strong>Privacy Policy Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Compliance &gt; Privacy Policies</li>
                    <li>Update the candidate privacy policy:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Use the rich text editor to customize the privacy policy</li>
                        <li>Include required legal disclosures for your jurisdiction</li>
                        <li>Specify data retention periods</li>
                        <li>Detail candidate rights regarding their data</li>
                      </ul>
                    </li>
                    <li>Configure version tracking for policy changes</li>
                    <li>Set up re-consent requirements for significant policy updates</li>
                  </ul>
                </li>
                <li>
                  <strong>EEO and Diversity Reporting:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Compliance &gt; EEO Configuration</li>
                    <li>Configure EEO data collection:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Enable/disable diversity questions</li>
                        <li>Customize questions based on jurisdiction requirements</li>
                        <li>Set up anonymization options for reporting</li>
                      </ul>
                    </li>
                    <li>Configure regular compliance reports</li>
                    <li>Set up data segregation to protect sensitive information</li>
                  </ul>
                </li>
                <li>
                  <strong>Candidate Consent Management:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Navigate to Settings &gt; Compliance &gt; Consent Forms</li>
                    <li>Configure consent requirements:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Application data processing consent</li>
                        <li>Background check authorization</li>
                        <li>Reference check permission</li>
                        <li>Talent pool inclusion consent</li>
                      </ul>
                    </li>
                    <li>Set up consent expiration periods</li>
                    <li>Configure re-consent notification workflows</li>
                  </ul>
                </li>
                <li>
                  <strong>Audit Trail Configuration:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Go to Settings &gt; Compliance &gt; Audit Settings</li>
                    <li>Configure comprehensive activity logging:
                      <ul className="list-disc pl-5 mt-1">
                        <li>User actions on candidate data</li>
                        <li>Application status changes</li>
                        <li>Document access events</li>
                        <li>Communication logs</li>
                      </ul>
                    </li>
                    <li>Set up audit log retention periods</li>
                    <li>Configure audit report templates for compliance reviews</li>
                  </ul>
                </li>
              </ol>
              
              <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md">
                <strong>Compliance Note:</strong> Consult with your legal team when configuring compliance settings to ensure they meet the specific requirements of your jurisdiction and industry.
              </div>
            </div>
          </AdminGuideItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}