# GRO Early Learning Applicant Tracking System

## Overview

The GRO Early Learning Applicant Tracking System (ATS) is a comprehensive recruitment platform designed specifically for childcare centers. This system streamlines the entire hiring process, from creating job postings to onboarding new employees, with specialized features for early childhood education recruitment.

This document provides a complete map of the application structure, navigation pathways, and user flows to help all stakeholders understand how the system works and how to navigate it effectively.

## Page Structure and URLs

### Public Pages
| Page | URL | Description |
|------|-----|-------------|
| Landing Page | `/` | Public-facing entry point showcasing the ATS features and benefits |
| Job Board | `/careers` | Public listing of all active job postings across centers |
| Job Details | `/careers/job/:id` | Detailed view of a specific job posting |
| Application Form | `/careers/job/:id/apply` | Job application form for candidates |
| Application Submitted | `/careers/application-submitted` | Confirmation page after successful application |
| Data Privacy | `/data-privacy` | Information about data handling and privacy policies |

### Authentication Pages
| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Authentication page for staff users |
| Forgot Password | `/forgot-password` | Password recovery request form |
| Reset Password | `/reset-password/:token` | Password reset form with validation token |

### Dashboard & Core Features
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Main landing page after login with key metrics and recent activities |
| Job Postings | `/job-postings` | List of all job postings with management options |
| Job Posting Details | `/job-postings/:id` | View and edit details for a specific job posting |
| Create Job Posting | `/job-postings/create` | Form to create a new job posting |
| Applications | `/applications` | List of all applications with filtering options |
| Application Details | `/applications/:id` | Detailed view of a candidate's application |
| Candidates | `/candidates` | Database of all candidates who have applied |
| Candidate Profile | `/candidates/:id` | Detailed candidate information and history |

### Interview Management
| Page | URL | Description |
|------|-----|-------------|
| Interviews | `/interviews` | Calendar view of scheduled interviews |
| Interview Details | `/interviews/:id` | Specific interview information and feedback forms |
| Schedule Interview | `/applications/:id/schedule-interview` | Interface to schedule a new interview for a candidate |

### Communication Tools
| Page | URL | Description |
|------|-----|-------------|
| Email Templates | `/email-templates` | List of email templates for candidate communications |
| Edit Template | `/email-templates/:id` | Form to edit an email template |
| Communication Log | `/candidates/:id/communications` | History of all communications with a candidate |

### Settings & Administration
| Page | URL | Description |
|------|-----|-------------|
| User Management | `/admin/users` | Add, edit, and manage system users |
| Center Management | `/admin/centers` | Manage location information for all centers |
| System Settings | `/admin/settings` | Configure system-wide preferences |
| Reports | `/admin/reports` | Generate and view recruitment analytics reports |

### Help & Resources
| Page | URL | Description |
|------|-----|-------------|
| How-to Guides | `/how-to-guides` | Documentation and tutorials for using the system |
| FAQ | `/faq` | Frequently asked questions about the system |

## User Flows

### Candidate Application Flow
1. **Entry Point**: Candidate accesses the job board (`/careers`)
2. **Job Selection**: Browses and selects a relevant position (`/careers/job/:id`)
3. **Application**: Completes and submits the application form (`/careers/job/:id/apply`)
4. **Confirmation**: Receives application confirmation (`/careers/application-submitted`)
5. **Follow-up**: Receives email communications as application progresses through stages

### Recruiter Job Posting Flow
1. **Dashboard**: Recruiter logs in and accesses dashboard (`/dashboard`)
2. **Job Creation**: Navigates to create a new job posting (`/job-postings/create`)
3. **Configuration**: Fills out job details, requirements, and location information
4. **Review**: Previews the job posting before publishing
5. **Publication**: Makes the job posting active and accessible on the public job board
6. **Sharing**: Creates application links to share on social media or job boards

### Application Review Flow
1. **Applications List**: HR admin or center director navigates to applications (`/applications`)
2. **Filtering**: Filters applications by center, position, or status
3. **Review**: Selects an application to review details (`/applications/:id`)
4. **AI Analysis**: Reviews AI-generated match score and qualification assessment
5. **Decision**: Updates application status based on qualifications
6. **Communication**: Sends email notification to candidate about status change
7. **Next Steps**: Schedules an interview or archives the application

### Interview Management Flow
1. **Scheduling**: User selects a candidate for interview (`/applications/:id`)
2. **Calendar**: Views available time slots (`/applications/:id/schedule-interview`)
3. **Confirmation**: Sets interview time and sends invitation to candidate and interviewer
4. **Preparation**: Reviews candidate profile before interview (`/candidates/:id`)
5. **Feedback**: Records interview notes and evaluation (`/interviews/:id`)
6. **Decision**: Updates application status based on interview outcome
7. **Follow-up**: Sends appropriate follow-up communication to candidate

### Administrator Setup Flow
1. **User Management**: Admin creates accounts for center directors and recruiters (`/admin/users`)
2. **Center Configuration**: Sets up center locations and details (`/admin/centers`)
3. **Template Creation**: Creates job posting templates and email templates (`/email-templates`)
4. **Permission Setting**: Assigns appropriate access levels to each user
5. **Workflow Configuration**: Customizes application review workflow and statuses
6. **Reporting**: Sets up automated reports for recruitment metrics (`/admin/reports`)

## User Role Navigation Considerations

### HR Administrators
- Full access to all system features and pages
- Primary focus on dashboard, reports, and system configuration
- Can manage all users, centers, and system-wide settings
- Typically navigate between administrative functions and oversight of all recruitment activities

### Center Directors
- Access limited to their specific center's job postings and applications
- Focus on reviewing applications, conducting interviews, and making hiring decisions
- Frequent navigation between applications, candidate profiles, and interview scheduling
- Cannot access certain administrative functions or other centers' data

### Recruiters
- Focus on creating job postings, screening applications, and coordinating interviews
- Frequent navigation between job postings, applications, and candidate communications
- Cannot access administrative functions or sensitive HR data
- Typically work across multiple centers and positions

### Candidates (External Users)
- Limited to public pages and their own application process
- No access to internal system features
- Simple linear flow from job browsing to application submission
- May return to check application status via unique URL or login

## UX Considerations

### Responsive Design
- All pages are optimized for access from desktop, tablet, and mobile devices
- Mobile-first approach ensures field staff can access the system on-the-go
- Critical functions like application review and status updates are accessible on all devices

### Accessibility
- WCAG 2.1 AA compliance throughout the application
- Screen reader compatibility with proper ARIA attributes
- Keyboard navigation supported for all interactive elements
- Color contrast ratios meet accessibility standards

### Performance
- Initial page load optimized for low-bandwidth environments
- Progressive loading for application lists and candidate databases
- Caching strategies for frequently accessed data
- Asynchronous loading for AI-powered features to prevent interface blocking

### Security & Privacy
- Role-based access control strictly enforced for all pages
- Personal candidate data protected with appropriate encryption
- Audit logs for all sensitive operations
- GDPR and local privacy law compliance with data access and deletion capabilities

### AI Integration Touchpoints
- Resume parsing streamlines candidate data entry
- Job matching provides objective qualification assessment
- Email generation assists with personalized communications
- Sentiment analysis helps gauge candidate engagement
- Interview question suggestion based on role requirements

## Notes

This README provides a comprehensive overview of the application structure and navigation. As the system evolves, this document should be updated to reflect any significant changes to the page structure, URLs, or user flows.

Key areas for future expansion may include:
- Onboarding workflow for newly hired candidates
- Integration with background check services
- Enhanced analytical capabilities for recruitment metrics
- Mobile application companion for field staff
- Integration with learning management systems for training new hires

Last updated: May 17, 2025