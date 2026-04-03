// Central localStorage-based store with all features

export interface User {
  id: string; name: string; email: string; password: string; role: 'admin' | 'user';
  status: 'active' | 'suspended'; createdAt: string; avatar?: string;
  department?: string; phone?: string; bio?: string; lastLogin?: string;
}

export interface Announcement {
  id: string; title: string; message: string; authorId: string; authorName: string;
  createdAt: string; priority: 'low' | 'medium' | 'high';
  scheduledFor?: string; category?: string;
}

export interface Meeting {
  id: string; title: string; date: string; duration: string; participants: string[];
  transcript: string; summary: string; userId: string; createdAt: string;
  tags?: string[]; favorite?: boolean; sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string; actionItems?: string[];
}

export interface Task {
  id: string; title: string; description: string; assignee: string;
  status: 'pending' | 'in-progress' | 'completed'; priority: 'low' | 'medium' | 'high';
  dueDate: string; meetingId?: string; userId: string; createdAt: string;
  completedAt?: string; tags?: string[]; comments?: TaskComment[];
  estimatedHours?: number; actualHours?: number; category?: string;
}

export interface TaskComment {
  id: string; userId: string; userName: string; text: string; createdAt: string;
}

export interface ActivityLog {
  id: string; userId: string; userName: string; action: string; details: string;
  timestamp: string; type: 'user' | 'admin' | 'system';
}

export interface Feedback {
  id: string; userId: string; userName: string; subject: string; message: string;
  rating: number; status: 'new' | 'reviewed' | 'resolved'; createdAt: string;
  adminResponse?: string; category?: string;
}

export interface Note {
  id: string; userId: string; title: string; content: string; color: string;
  pinned: boolean; createdAt: string; updatedAt: string; tags?: string[];
}

export interface MeetingTemplate {
  id: string; name: string; agenda: string; defaultDuration: string;
  defaultParticipants: string; userId: string; createdAt: string; isGlobal?: boolean;
}

export interface Goal {
  id: string; userId: string; title: string; description: string;
  targetDate: string; progress: number; status: 'active' | 'completed' | 'paused';
  milestones: GoalMilestone[]; createdAt: string; category?: string;
}

export interface GoalMilestone {
  id: string; title: string; completed: boolean; completedAt?: string;
}

export interface Notification {
  id: string; userId: string; title: string; message: string; type: 'info' | 'warning' | 'success' | 'error';
  read: boolean; createdAt: string; link?: string;
}

export interface EmailTemplate {
  id: string; name: string; subject: string; body: string; category: string; createdAt: string;
}

export interface Report {
  id: string; title: string; type: 'weekly' | 'monthly' | 'custom'; generatedBy: string;
  generatedAt: string; data: Record<string, any>; userId?: string;
}

export interface SystemSettings {
  siteName: string; maxMeetingsPerUser: number; enableNotifications: boolean;
  maintenanceMode: boolean; allowSignups: boolean;
  defaultTaskPriority: 'low' | 'medium' | 'high'; autoGenerateTasks: boolean;
  maxFileSize: number; sessionTimeout: number; enableAuditLog: boolean;
  enableFeedback: boolean; requireEmailVerification: boolean;
  maxTasksPerUser: number; enableGoals: boolean; enableTemplates: boolean;
  dataRetentionDays: number; enableExport: boolean;
}

const STORAGE_KEYS = {
  USERS: 'sma_users', ANNOUNCEMENTS: 'sma_announcements', MEETINGS: 'sma_meetings',
  TASKS: 'sma_tasks', CURRENT_USER: 'sma_current_user', ACTIVITY_LOGS: 'sma_activity_logs',
  FEEDBACK: 'sma_feedback', SETTINGS: 'sma_settings', NOTES: 'sma_notes',
  TEMPLATES: 'sma_templates', GOALS: 'sma_goals', NOTIFICATIONS: 'sma_notifications',
  EMAIL_TEMPLATES: 'sma_email_templates', REPORTS: 'sma_reports',
  INITIALIZED: 'sma_initialized_v5',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ─── Seed Data ──────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: 'admin-001', name: 'Sarah Chen', email: 'admin@meetingai.com', password: 'admin123', role: 'admin', status: 'active', createdAt: '2025-08-15T10:00:00Z', department: 'Engineering', phone: '+1-555-0100', bio: 'Platform administrator and lead engineer.', lastLogin: '2026-04-01T09:00:00Z' },
  { id: 'user-001', name: 'James Wilson', email: 'user@meetingai.com', password: 'user123', role: 'user', status: 'active', createdAt: '2025-09-01T14:00:00Z', department: 'Product', phone: '+1-555-0101', bio: 'Product manager focused on user experience.', lastLogin: '2026-04-01T11:00:00Z' },
  { id: 'user-002', name: 'Emily Rodriguez', email: 'emily@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2025-09-10T09:00:00Z', department: 'Design', bio: 'UI/UX designer passionate about accessibility.', lastLogin: '2026-03-31T16:00:00Z' },
  { id: 'user-003', name: 'Michael Thompson', email: 'michael@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2025-10-05T11:00:00Z', department: 'Engineering', lastLogin: '2026-03-30T14:00:00Z' },
  { id: 'user-004', name: 'Aisha Patel', email: 'aisha@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2025-10-20T08:00:00Z', department: 'Marketing', bio: 'Growth marketing specialist.', lastLogin: '2026-04-01T08:30:00Z' },
  { id: 'user-005', name: 'David Kim', email: 'david@meetingai.com', password: 'pass123', role: 'user', status: 'suspended', createdAt: '2025-11-01T13:00:00Z', department: 'Sales', lastLogin: '2026-02-15T10:00:00Z' },
  { id: 'user-006', name: 'Lisa Nakamura', email: 'lisa@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2025-11-15T15:00:00Z', department: 'Engineering', bio: 'Full-stack developer.', lastLogin: '2026-03-29T17:00:00Z' },
  { id: 'user-007', name: 'Carlos Mendez', email: 'carlos@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2025-12-01T10:00:00Z', department: 'HR', lastLogin: '2026-04-01T07:45:00Z' },
  { id: 'user-008', name: 'Rachel Foster', email: 'rachel@meetingai.com', password: 'pass123', role: 'admin', status: 'active', createdAt: '2025-12-10T12:00:00Z', department: 'Engineering', bio: 'DevOps lead and co-admin.', lastLogin: '2026-03-31T22:00:00Z' },
  { id: 'user-009', name: 'Omar Hassan', email: 'omar@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2026-01-05T09:00:00Z', department: 'Product', lastLogin: '2026-03-28T11:00:00Z' },
  { id: 'user-010', name: 'Sophie Laurent', email: 'sophie@meetingai.com', password: 'pass123', role: 'user', status: 'active', createdAt: '2026-01-20T14:00:00Z', department: 'Design', bio: 'Visual designer and illustrator.', lastLogin: '2026-04-01T10:15:00Z' },
];

function createSeedMeetings(): Meeting[] {
  return [
    { id: 'meet-001', title: 'Q1 Sprint Planning', date: '2026-03-15T10:00:00Z', duration: '60 min', participants: ['James Wilson', 'Emily Rodriguez', 'Michael Thompson', 'Lisa Nakamura'], transcript: 'We discussed the roadmap for Q1. We need to prioritize the new dashboard features. Michael should review the API documentation by Friday. Emily will create mockups for the new meeting view. We must complete the authentication module before moving to other features. Lisa will set up the CI/CD pipeline. Action item: schedule a follow-up next week.', summary: '**Key Points:**\n1. Q1 roadmap prioritization focused on dashboard features.\n2. API documentation review assigned to Michael.\n3. Emily to create mockups for new meeting view.\n4. Authentication module is top priority.\n5. CI/CD pipeline setup assigned to Lisa.', userId: 'user-001', createdAt: '2026-03-15T11:00:00Z', tags: ['planning', 'sprint'], favorite: true, sentiment: 'positive', category: 'Planning', actionItems: ['Review API docs', 'Create mockups', 'Set up CI/CD'] },
    { id: 'meet-002', title: 'Design Review - Dashboard', date: '2026-03-18T14:00:00Z', duration: '45 min', participants: ['Emily Rodriguez', 'Sophie Laurent', 'James Wilson'], transcript: 'Sophie presented three layout options. Option B was preferred. We should update the color scheme. Need prototype for user testing. Sidebar must be collapsible.', summary: '**Key Points:**\n1. Option B layout selected.\n2. Color scheme update needed.\n3. Prototype for user testing.\n4. Collapsible sidebar required.', userId: 'user-001', createdAt: '2026-03-18T15:00:00Z', tags: ['design', 'review'], sentiment: 'positive', category: 'Design', actionItems: ['Update color scheme', 'Build prototype'] },
    { id: 'meet-003', title: 'Backend Architecture', date: '2026-03-20T09:00:00Z', duration: '90 min', participants: ['Michael Thompson', 'Lisa Nakamura', 'Rachel Foster'], transcript: 'Reviewed database schema. Meetings table needs optimization. Should implement API pagination. Rachel will set up monitoring. Need migration plan. Must ensure backward compatibility.', summary: '**Key Points:**\n1. DB schema review done.\n2. Table optimization needed.\n3. API pagination required.\n4. Monitoring assigned to Rachel.', userId: 'user-003', createdAt: '2026-03-20T10:30:00Z', tags: ['backend', 'architecture'], sentiment: 'neutral', category: 'Engineering' },
    { id: 'meet-004', title: 'Marketing Campaign Kickoff', date: '2026-03-22T11:00:00Z', duration: '30 min', participants: ['Aisha Patel', 'James Wilson', 'Carlos Mendez'], transcript: 'Q2 marketing plan presented. Focus on content marketing and webinars. Carlos coordinates employer branding. James provides screenshots. Social media budget approved.', summary: '**Key Points:**\n1. Q2 marketing plan approved.\n2. Content marketing + webinars focus.\n3. Social media budget approved.', userId: 'user-004', createdAt: '2026-03-22T11:30:00Z', tags: ['marketing', 'campaign'], favorite: true, sentiment: 'positive', category: 'Marketing' },
    { id: 'meet-005', title: 'Engineering Standup', date: '2026-03-25T09:30:00Z', duration: '15 min', participants: ['Michael Thompson', 'Lisa Nakamura', 'Rachel Foster', 'Sarah Chen'], transcript: 'Michael completed API refactoring. Lisa working on test suite. Rachel deployed monitoring. No blockers.', summary: '**Key Points:**\n1. API refactoring done.\n2. Test suite in progress.\n3. Monitoring deployed.\n4. No blockers.', userId: 'user-003', createdAt: '2026-03-25T09:45:00Z', tags: ['standup'], sentiment: 'positive', category: 'Engineering' },
    { id: 'meet-006', title: 'Client Feedback Review', date: '2026-03-26T15:00:00Z', duration: '45 min', participants: ['James Wilson', 'Omar Hassan', 'Emily Rodriguez'], transcript: 'Reviewed enterprise client feedback. Requests: export options, analytics, API integrations. NPS improved 7.2 to 8.1.', summary: '**Key Points:**\n1. Export, analytics, API integrations requested.\n2. NPS improved to 8.1.', userId: 'user-001', createdAt: '2026-03-26T16:00:00Z', tags: ['client', 'feedback'], sentiment: 'positive', category: 'Product' },
    { id: 'meet-007', title: 'Incident Post-Mortem', date: '2026-03-27T10:00:00Z', duration: '60 min', participants: ['Rachel Foster', 'Michael Thompson', 'Sarah Chen'], transcript: 'Production outage lasted 45 min. Root cause: memory leak. Need refactoring and better alerting.', summary: '**Key Points:**\n1. 45-min outage due to memory leak.\n2. Temp fix applied.\n3. Refactoring + alerting needed.', userId: 'user-003', createdAt: '2026-03-27T11:00:00Z', tags: ['incident', 'urgent'], sentiment: 'negative', category: 'Engineering' },
    { id: 'meet-008', title: 'Product Roadmap Review', date: '2026-03-28T13:00:00Z', duration: '90 min', participants: ['James Wilson', 'Sarah Chen', 'Omar Hassan', 'Aisha Patel'], transcript: 'Q2-Q3 roadmap: AI, enterprise, mobile. 40% engineering to AI. Mobile MVP in Q3. Budget increase for ML.', summary: '**Key Points:**\n1. AI, enterprise, mobile themes.\n2. 40% to AI.\n3. Mobile MVP Q3.\n4. ML budget increase.', userId: 'user-001', createdAt: '2026-03-28T14:30:00Z', tags: ['roadmap', 'strategy'], favorite: true, sentiment: 'positive', category: 'Product' },
    { id: 'meet-009', title: 'HR Onboarding Review', date: '2026-03-29T14:00:00Z', duration: '30 min', participants: ['Carlos Mendez', 'Sarah Chen'], transcript: 'Onboarding updates. Day-one accounts. Training materials needed. Buddy system well received.', summary: '**Key Points:**\n1. Day-one provisioning.\n2. Training materials needed.\n3. Buddy system positive.', userId: 'user-007', createdAt: '2026-03-29T14:30:00Z', tags: ['HR', 'onboarding'], sentiment: 'positive', category: 'HR' },
    { id: 'meet-010', title: 'Security Audit Follow-up', date: '2026-03-31T10:00:00Z', duration: '45 min', participants: ['Sarah Chen', 'Rachel Foster', 'Michael Thompson'], transcript: 'Security audit findings reviewed. 3 medium issues patched. CSP headers needed. 2FA for admins.', summary: '**Key Points:**\n1. Issues patched.\n2. CSP headers needed.\n3. 2FA for admins.', userId: 'admin-001', createdAt: '2026-03-31T10:45:00Z', tags: ['security', 'audit'], sentiment: 'neutral', category: 'Security' },
    { id: 'meet-011', title: 'Sales Pipeline Review', date: '2026-03-31T16:00:00Z', duration: '30 min', participants: ['David Kim', 'James Wilson'], transcript: '12 enterprise leads. Demo conversion at 35%. Case study needed. Pricing update required.', summary: '**Key Points:**\n1. 12 leads.\n2. 35% conversion.\n3. Case study + pricing update.', userId: 'user-001', createdAt: '2026-03-31T16:30:00Z', tags: ['sales'], sentiment: 'positive', category: 'Sales' },
    { id: 'meet-012', title: 'Design System Workshop', date: '2026-04-01T09:00:00Z', duration: '120 min', participants: ['Emily Rodriguez', 'Sophie Laurent', 'Lisa Nakamura'], transcript: 'Component library in Figma. Document tokens. Dark mode. Lisa converts to React.', summary: '**Key Points:**\n1. Figma library created.\n2. Token docs needed.\n3. Dark mode planned.', userId: 'user-002', createdAt: '2026-04-01T11:00:00Z', tags: ['design', 'design-system'], sentiment: 'positive', category: 'Design' },
  ];
}

function createSeedTasks(): Task[] {
  return [
    { id: 'task-001', title: 'Review API documentation', description: 'Review and update API docs for v2 endpoints.', assignee: 'Michael Thompson', status: 'completed', priority: 'high', dueDate: '2026-03-20', userId: 'user-001', createdAt: '2026-03-15T11:00:00Z', completedAt: '2026-03-19T16:00:00Z', meetingId: 'meet-001', tags: ['api', 'docs'], estimatedHours: 4, actualHours: 3, category: 'Development', comments: [{ id: 'c1', userId: 'user-003', userName: 'Michael Thompson', text: 'Done! All endpoints documented.', createdAt: '2026-03-19T16:00:00Z' }] },
    { id: 'task-002', title: 'Create dashboard mockups', description: 'Design mockups for the new meeting dashboard.', assignee: 'Emily Rodriguez', status: 'completed', priority: 'high', dueDate: '2026-03-22', userId: 'user-001', createdAt: '2026-03-15T11:00:00Z', completedAt: '2026-03-21T14:00:00Z', meetingId: 'meet-001', tags: ['design'], estimatedHours: 8, actualHours: 6, category: 'Design' },
    { id: 'task-003', title: 'Set up CI/CD pipeline', description: 'Configure CI/CD for automated testing.', assignee: 'Lisa Nakamura', status: 'completed', priority: 'medium', dueDate: '2026-03-25', userId: 'user-001', createdAt: '2026-03-15T11:00:00Z', completedAt: '2026-03-24T17:00:00Z', meetingId: 'meet-001', tags: ['devops'], estimatedHours: 12, actualHours: 10, category: 'DevOps' },
    { id: 'task-004', title: 'Update color scheme', description: 'Align colors with new brand guidelines.', assignee: 'Sophie Laurent', status: 'in-progress', priority: 'medium', dueDate: '2026-04-05', userId: 'user-001', createdAt: '2026-03-18T15:00:00Z', tags: ['design'], estimatedHours: 6, category: 'Design' },
    { id: 'task-005', title: 'Implement API pagination', description: 'Add pagination to all API endpoints.', assignee: 'Michael Thompson', status: 'in-progress', priority: 'high', dueDate: '2026-04-03', userId: 'user-003', createdAt: '2026-03-20T10:30:00Z', tags: ['backend'], estimatedHours: 8, category: 'Development', comments: [{ id: 'c2', userId: 'user-003', userName: 'Michael Thompson', text: '50% done, finishing cursor-based pagination.', createdAt: '2026-03-28T10:00:00Z' }] },
    { id: 'task-006', title: 'Set up monitoring', description: 'Deploy monitoring and alerting.', assignee: 'Rachel Foster', status: 'completed', priority: 'high', dueDate: '2026-03-28', userId: 'user-003', createdAt: '2026-03-20T10:30:00Z', completedAt: '2026-03-25T09:00:00Z', tags: ['devops'], estimatedHours: 6, actualHours: 5, category: 'DevOps' },
    { id: 'task-007', title: 'Create Q2 marketing campaign', description: 'Content marketing and webinar campaign.', assignee: 'Aisha Patel', status: 'in-progress', priority: 'medium', dueDate: '2026-04-10', userId: 'user-004', createdAt: '2026-03-22T11:30:00Z', tags: ['marketing'], estimatedHours: 20, category: 'Marketing' },
    { id: 'task-008', title: 'Provide product screenshots', description: 'Screenshots and demo videos.', assignee: 'James Wilson', status: 'pending', priority: 'low', dueDate: '2026-04-07', userId: 'user-004', createdAt: '2026-03-22T11:30:00Z', tags: ['marketing'], estimatedHours: 3, category: 'Marketing' },
    { id: 'task-009', title: 'Refactor memory management', description: 'Fix memory leak in transcript processing.', assignee: 'Michael Thompson', status: 'pending', priority: 'high', dueDate: '2026-04-05', userId: 'user-003', createdAt: '2026-03-27T11:00:00Z', tags: ['backend', 'bug'], estimatedHours: 10, category: 'Development' },
    { id: 'task-010', title: 'Write post-mortem document', description: 'Document the March 25th outage.', assignee: 'Michael Thompson', status: 'completed', priority: 'medium', dueDate: '2026-03-30', userId: 'user-003', createdAt: '2026-03-27T11:00:00Z', completedAt: '2026-03-29T15:00:00Z', tags: ['docs'], estimatedHours: 3, actualHours: 2, category: 'Documentation' },
    { id: 'task-011', title: 'Go-to-market strategy', description: 'Create GTM plan for Q2 launches.', assignee: 'Aisha Patel', status: 'pending', priority: 'high', dueDate: '2026-04-15', userId: 'user-001', createdAt: '2026-03-28T14:30:00Z', tags: ['strategy'], estimatedHours: 15, category: 'Marketing' },
    { id: 'task-012', title: 'Create training materials', description: 'Onboarding guides and videos.', assignee: 'Carlos Mendez', status: 'in-progress', priority: 'medium', dueDate: '2026-04-12', userId: 'user-007', createdAt: '2026-03-29T14:30:00Z', tags: ['HR'], estimatedHours: 12, category: 'HR' },
    { id: 'task-013', title: 'Implement CSP headers', description: 'Add Content Security Policy.', assignee: 'Rachel Foster', status: 'pending', priority: 'high', dueDate: '2026-04-08', userId: 'admin-001', createdAt: '2026-03-31T10:45:00Z', tags: ['security'], estimatedHours: 4, category: 'Security' },
    { id: 'task-014', title: 'Enable 2FA for admins', description: 'Two-factor authentication for admin accounts.', assignee: 'Sarah Chen', status: 'pending', priority: 'high', dueDate: '2026-04-10', userId: 'admin-001', createdAt: '2026-03-31T10:45:00Z', tags: ['security'], estimatedHours: 8, category: 'Security' },
    { id: 'task-015', title: 'Create enterprise case study', description: 'Case study from largest client.', assignee: 'James Wilson', status: 'pending', priority: 'low', dueDate: '2026-04-20', userId: 'user-001', createdAt: '2026-03-31T16:30:00Z', tags: ['sales'], estimatedHours: 6, category: 'Sales' },
    { id: 'task-016', title: 'Document design tokens', description: 'Documentation for all design system tokens.', assignee: 'Emily Rodriguez', status: 'in-progress', priority: 'medium', dueDate: '2026-04-08', userId: 'user-002', createdAt: '2026-04-01T11:00:00Z', tags: ['design'], estimatedHours: 8, category: 'Design' },
    { id: 'task-017', title: 'Convert Figma to React', description: 'Implement design system in React.', assignee: 'Lisa Nakamura', status: 'pending', priority: 'medium', dueDate: '2026-04-15', userId: 'user-002', createdAt: '2026-04-01T11:00:00Z', tags: ['frontend'], estimatedHours: 20, category: 'Development' },
    { id: 'task-018', title: 'Update enterprise pricing', description: 'Revise pricing for enterprise.', assignee: 'James Wilson', status: 'pending', priority: 'medium', dueDate: '2026-04-12', userId: 'user-001', createdAt: '2026-03-31T16:30:00Z', tags: ['pricing'], estimatedHours: 4, category: 'Product' },
    { id: 'task-019', title: 'Schedule pen testing', description: 'Quarterly penetration testing.', assignee: 'Rachel Foster', status: 'completed', priority: 'medium', dueDate: '2026-04-05', userId: 'admin-001', createdAt: '2026-03-31T10:45:00Z', completedAt: '2026-04-01T09:00:00Z', tags: ['security'], estimatedHours: 2, actualHours: 1, category: 'Security' },
    { id: 'task-020', title: 'Q1 performance reviews', description: 'Compile performance review documents.', assignee: 'Carlos Mendez', status: 'in-progress', priority: 'high', dueDate: '2026-04-05', userId: 'user-007', createdAt: '2026-03-25T10:00:00Z', tags: ['HR'], estimatedHours: 16, category: 'HR' },
  ];
}

function createSeedAnnouncements(): Announcement[] {
  return [
    { id: 'ann-001', title: 'Welcome to MeetingAI 2.0!', message: 'Major updates including AI-powered task generation, improved dashboards, and real-time collaboration.', authorId: 'admin-001', authorName: 'Sarah Chen', createdAt: '2026-03-01T09:00:00Z', priority: 'high', category: 'Product' },
    { id: 'ann-002', title: 'Scheduled Maintenance - April 5th', message: 'Maintenance on April 5th from 2:00 AM to 4:00 AM UTC.', authorId: 'admin-001', authorName: 'Sarah Chen', createdAt: '2026-03-28T14:00:00Z', priority: 'medium', category: 'System' },
    { id: 'ann-003', title: 'New Feature: Meeting Templates', message: 'Create and use meeting templates to standardize agendas!', authorId: 'user-008', authorName: 'Rachel Foster', createdAt: '2026-03-30T11:00:00Z', priority: 'low', category: 'Feature' },
    { id: 'ann-004', title: 'Security Update Required', message: 'Please ensure you are using the latest version. Security vulnerabilities patched.', authorId: 'admin-001', authorName: 'Sarah Chen', createdAt: '2026-03-31T16:00:00Z', priority: 'high', category: 'Security' },
    { id: 'ann-005', title: 'Team Building - April 12th', message: 'Virtual team building at 3:00 PM. RSVP through HR portal!', authorId: 'user-007', authorName: 'Carlos Mendez', createdAt: '2026-04-01T08:00:00Z', priority: 'low', category: 'Social' },
  ];
}

function createSeedActivityLogs(): ActivityLog[] {
  return [
    { id: 'log-001', userId: 'admin-001', userName: 'Sarah Chen', action: 'User Login', details: 'Admin logged in', timestamp: '2026-04-01T09:00:00Z', type: 'admin' },
    { id: 'log-002', userId: 'user-001', userName: 'James Wilson', action: 'Meeting Created', details: 'Created "Q1 Sprint Planning"', timestamp: '2026-03-15T11:00:00Z', type: 'user' },
    { id: 'log-003', userId: 'admin-001', userName: 'Sarah Chen', action: 'User Suspended', details: 'Suspended David Kim', timestamp: '2026-03-01T10:00:00Z', type: 'admin' },
    { id: 'log-004', userId: 'user-003', userName: 'Michael Thompson', action: 'Task Completed', details: 'Completed "Review API documentation"', timestamp: '2026-03-19T16:00:00Z', type: 'user' },
    { id: 'log-005', userId: 'system', userName: 'System', action: 'Backup Completed', details: 'Daily database backup successful', timestamp: '2026-04-01T02:00:00Z', type: 'system' },
    { id: 'log-006', userId: 'user-008', userName: 'Rachel Foster', action: 'Announcement Sent', details: 'Sent "Meeting Templates"', timestamp: '2026-03-30T11:00:00Z', type: 'admin' },
    { id: 'log-007', userId: 'user-004', userName: 'Aisha Patel', action: 'Meeting Created', details: 'Created "Marketing Campaign Kickoff"', timestamp: '2026-03-22T11:30:00Z', type: 'user' },
    { id: 'log-008', userId: 'admin-001', userName: 'Sarah Chen', action: 'Settings Updated', details: 'Enabled auto task generation', timestamp: '2026-03-25T08:00:00Z', type: 'admin' },
    { id: 'log-009', userId: 'system', userName: 'System', action: 'Security Scan', details: 'Weekly scan. No critical issues.', timestamp: '2026-03-30T03:00:00Z', type: 'system' },
    { id: 'log-010', userId: 'user-002', userName: 'Emily Rodriguez', action: 'Task Created', details: 'Created 3 tasks from workshop', timestamp: '2026-04-01T11:00:00Z', type: 'user' },
    { id: 'log-011', userId: 'user-005', userName: 'David Kim', action: 'Login Blocked', details: 'Account suspended', timestamp: '2026-03-15T14:00:00Z', type: 'system' },
    { id: 'log-012', userId: 'admin-001', userName: 'Sarah Chen', action: 'Announcement Sent', details: 'Sent "Security Update Required"', timestamp: '2026-03-31T16:00:00Z', type: 'admin' },
  ];
}

function createSeedFeedback(): Feedback[] {
  return [
    { id: 'fb-001', userId: 'user-001', userName: 'James Wilson', subject: 'Great AI summarization!', message: 'The summarization saves me 30 minutes per meeting.', rating: 5, status: 'reviewed', createdAt: '2026-03-20T09:00:00Z', adminResponse: 'Thank you! Glad it helps.', category: 'Feature' },
    { id: 'fb-002', userId: 'user-002', userName: 'Emily Rodriguez', subject: 'Export feature request', message: 'Need PDF export for meeting summaries.', rating: 4, status: 'reviewed', createdAt: '2026-03-22T14:00:00Z', adminResponse: 'PDF export is on our Q2 roadmap!', category: 'Feature Request' },
    { id: 'fb-003', userId: 'user-004', userName: 'Aisha Patel', subject: 'Mobile responsiveness', message: 'Buttons hard to tap on smaller screens.', rating: 3, status: 'new', createdAt: '2026-03-28T11:00:00Z', category: 'Bug' },
    { id: 'fb-004', userId: 'user-009', userName: 'Omar Hassan', subject: 'Task auto-generation amazing', message: 'Priority detection is spot on.', rating: 5, status: 'new', createdAt: '2026-03-30T16:00:00Z', category: 'Feature' },
    { id: 'fb-005', userId: 'user-006', userName: 'Lisa Nakamura', subject: 'Integration suggestions', message: 'Slack and Teams integrations please!', rating: 4, status: 'resolved', createdAt: '2026-03-25T10:00:00Z', adminResponse: 'Slack in development! Teams planned Q3.', category: 'Feature Request' },
    { id: 'fb-006', userId: 'user-010', userName: 'Sophie Laurent', subject: 'UI is clean', message: 'Dashboard layout makes everything easy to find.', rating: 5, status: 'reviewed', createdAt: '2026-04-01T08:00:00Z', category: 'General' },
  ];
}

function createSeedNotes(): Note[] {
  return [
    { id: 'note-001', userId: 'user-001', title: 'Q2 Planning Ideas', content: 'Focus areas:\n- AI model improvements\n- Enterprise onboarding flow\n- Mobile app MVP\n- Analytics dashboard v2\n\nNeed to discuss with Sarah about resource allocation.', color: 'bg-primary/10', pinned: true, createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-03-28T14:00:00Z', tags: ['planning', 'Q2'] },
    { id: 'note-002', userId: 'user-001', title: 'Client Meeting Prep', content: 'Prepare for Acme Corp demo:\n- Show new summarization\n- Highlight task generation\n- Custom pricing discussion\n- Ask about integration needs', color: 'bg-warning/10', pinned: false, createdAt: '2026-03-25T11:00:00Z', updatedAt: '2026-03-25T11:00:00Z', tags: ['client', 'sales'] },
    { id: 'note-003', userId: 'user-001', title: 'Feature Priorities', content: '1. Export to PDF ★★★\n2. Calendar integration ★★★\n3. Slack notifications ★★\n4. Meeting recordings ★★\n5. Custom dashboards ★', color: 'bg-success/10', pinned: true, createdAt: '2026-03-30T16:00:00Z', updatedAt: '2026-04-01T10:00:00Z', tags: ['product'] },
    { id: 'note-004', userId: 'user-002', title: 'Design System Notes', content: 'Color tokens:\n- Primary: Blue 600\n- Success: Green 500\n- Warning: Amber 500\n- Error: Red 500\n\nTypography scale:\n- H1: 2.5rem\n- H2: 2rem\n- Body: 1rem', color: 'bg-accent/10', pinned: false, createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-01T11:00:00Z', tags: ['design'] },
    { id: 'note-005', userId: 'user-003', title: 'Tech Debt Tracker', content: '- Memory leak in transcript service (HIGH)\n- Deprecated API endpoints cleanup\n- Unit test coverage < 60%\n- Docker image optimization\n- DB query N+1 issues', color: 'bg-destructive/10', pinned: true, createdAt: '2026-03-27T11:00:00Z', updatedAt: '2026-03-31T10:00:00Z', tags: ['tech-debt'] },
  ];
}

function createSeedTemplates(): MeetingTemplate[] {
  return [
    { id: 'tmpl-001', name: 'Daily Standup', agenda: '1. What did you do yesterday?\n2. What are you doing today?\n3. Any blockers?', defaultDuration: '15', defaultParticipants: '', userId: 'admin-001', createdAt: '2026-03-01T09:00:00Z', isGlobal: true },
    { id: 'tmpl-002', name: 'Sprint Planning', agenda: '1. Review previous sprint\n2. Demo completed work\n3. Discuss upcoming sprint goals\n4. Estimate and assign stories\n5. Identify risks and dependencies', defaultDuration: '60', defaultParticipants: '', userId: 'admin-001', createdAt: '2026-03-01T09:00:00Z', isGlobal: true },
    { id: 'tmpl-003', name: 'One-on-One', agenda: '1. How are you doing?\n2. Progress on goals\n3. Challenges and support needed\n4. Career development\n5. Action items', defaultDuration: '30', defaultParticipants: '', userId: 'admin-001', createdAt: '2026-03-01T09:00:00Z', isGlobal: true },
    { id: 'tmpl-004', name: 'Client Demo', agenda: '1. Introduction\n2. Product overview\n3. Feature demonstration\n4. Q&A\n5. Next steps and pricing', defaultDuration: '45', defaultParticipants: '', userId: 'user-001', createdAt: '2026-03-15T10:00:00Z' },
    { id: 'tmpl-005', name: 'Retrospective', agenda: '1. What went well?\n2. What could be improved?\n3. Action items for next sprint\n4. Shout-outs and kudos', defaultDuration: '45', defaultParticipants: '', userId: 'admin-001', createdAt: '2026-03-01T09:00:00Z', isGlobal: true },
    { id: 'tmpl-006', name: 'Design Review', agenda: '1. Present designs\n2. Discuss feedback\n3. Alignment on direction\n4. Assign follow-up tasks', defaultDuration: '45', defaultParticipants: '', userId: 'user-002', createdAt: '2026-03-10T09:00:00Z' },
  ];
}

function createSeedGoals(): Goal[] {
  return [
    { id: 'goal-001', userId: 'user-001', title: 'Launch Q2 Features', description: 'Ship all planned Q2 features on time.', targetDate: '2026-06-30', progress: 35, status: 'active', category: 'Product', createdAt: '2026-03-01T09:00:00Z', milestones: [
      { id: 'm1', title: 'Complete design specs', completed: true, completedAt: '2026-03-21T14:00:00Z' },
      { id: 'm2', title: 'Backend API ready', completed: false },
      { id: 'm3', title: 'Frontend implementation', completed: false },
      { id: 'm4', title: 'QA and testing', completed: false },
      { id: 'm5', title: 'Production deployment', completed: false },
    ]},
    { id: 'goal-002', userId: 'user-001', title: 'Improve NPS to 8.5', description: 'Raise Net Promoter Score from 8.1 to 8.5.', targetDate: '2026-06-30', progress: 60, status: 'active', category: 'Customer Success', createdAt: '2026-03-15T09:00:00Z', milestones: [
      { id: 'm6', title: 'Identify top 5 pain points', completed: true, completedAt: '2026-03-26T16:00:00Z' },
      { id: 'm7', title: 'Address export feature', completed: false },
      { id: 'm8', title: 'Improve mobile experience', completed: false },
    ]},
    { id: 'goal-003', userId: 'user-003', title: 'Reduce API latency by 40%', description: 'Optimize API responses to under 200ms.', targetDate: '2026-05-31', progress: 25, status: 'active', category: 'Engineering', createdAt: '2026-03-20T09:00:00Z', milestones: [
      { id: 'm9', title: 'Profile current performance', completed: true, completedAt: '2026-03-25T10:00:00Z' },
      { id: 'm10', title: 'Implement caching layer', completed: false },
      { id: 'm11', title: 'Optimize DB queries', completed: false },
      { id: 'm12', title: 'Load testing', completed: false },
    ]},
    { id: 'goal-004', userId: 'user-004', title: '10K Monthly Active Users', description: 'Grow MAU from 5K to 10K.', targetDate: '2026-09-30', progress: 50, status: 'active', category: 'Growth', createdAt: '2026-01-15T09:00:00Z', milestones: [
      { id: 'm13', title: 'Content marketing launch', completed: true, completedAt: '2026-02-01T09:00:00Z' },
      { id: 'm14', title: 'Webinar series', completed: true, completedAt: '2026-03-01T09:00:00Z' },
      { id: 'm15', title: 'Referral program', completed: false },
      { id: 'm16', title: 'Enterprise outreach', completed: false },
    ]},
  ];
}

function createSeedNotifications(): Notification[] {
  return [
    { id: 'notif-001', userId: 'user-001', title: 'New Announcement', message: 'Sarah Chen posted "Security Update Required"', type: 'warning', read: false, createdAt: '2026-03-31T16:00:00Z', link: '/dashboard' },
    { id: 'notif-002', userId: 'user-001', title: 'Task Overdue', message: 'Task "Provide product screenshots" is overdue', type: 'error', read: false, createdAt: '2026-04-01T00:00:00Z', link: '/dashboard' },
    { id: 'notif-003', userId: 'user-001', title: 'Meeting Summary Ready', message: 'Summary for "Product Roadmap Review" is ready', type: 'success', read: true, createdAt: '2026-03-28T14:30:00Z', link: '/dashboard' },
    { id: 'notif-004', userId: 'user-001', title: 'Goal Progress', message: 'You\'re 35% through "Launch Q2 Features"', type: 'info', read: true, createdAt: '2026-03-30T09:00:00Z' },
    { id: 'notif-005', userId: 'user-001', title: 'Feedback Response', message: 'Admin responded to your feedback', type: 'success', read: false, createdAt: '2026-03-21T10:00:00Z' },
    { id: 'notif-006', userId: 'user-003', title: 'Task Assigned', message: 'You were assigned "Refactor memory management"', type: 'info', read: false, createdAt: '2026-03-27T11:00:00Z' },
    { id: 'notif-007', userId: 'user-004', title: 'New Announcement', message: 'Team Building Event - April 12th', type: 'info', read: false, createdAt: '2026-04-01T08:00:00Z' },
    { id: 'notif-008', userId: 'admin-001', title: 'New Feedback', message: 'Aisha Patel submitted feedback about mobile', type: 'info', read: false, createdAt: '2026-03-28T11:00:00Z' },
    { id: 'notif-009', userId: 'admin-001', title: 'User Registration', message: 'New user Omar Hassan registered', type: 'info', read: true, createdAt: '2026-01-05T09:00:00Z' },
  ];
}

function createSeedEmailTemplates(): EmailTemplate[] {
  return [
    { id: 'et-001', name: 'Welcome Email', subject: 'Welcome to MeetingAI!', body: 'Hi {{name}},\n\nWelcome to MeetingAI! Your account is ready.\n\nGet started by creating your first meeting and let our AI generate summaries and tasks.\n\nBest,\nThe MeetingAI Team', category: 'Onboarding', createdAt: '2026-03-01T09:00:00Z' },
    { id: 'et-002', name: 'Account Suspended', subject: 'Account Suspended - MeetingAI', body: 'Hi {{name}},\n\nYour account has been suspended. If you believe this is an error, please contact support.\n\nRegards,\nMeetingAI Admin', category: 'Account', createdAt: '2026-03-01T09:00:00Z' },
    { id: 'et-003', name: 'Weekly Digest', subject: 'Your Weekly MeetingAI Digest', body: 'Hi {{name}},\n\nHere\'s your weekly summary:\n- {{meetingCount}} meetings processed\n- {{taskCount}} tasks created\n- {{completedCount}} tasks completed\n\nKeep up the great work!\n\nMeetingAI Team', category: 'Engagement', createdAt: '2026-03-01T09:00:00Z' },
    { id: 'et-004', name: 'Password Reset', subject: 'Reset Your MeetingAI Password', body: 'Hi {{name}},\n\nClick the link below to reset your password:\n{{resetLink}}\n\nThis link expires in 24 hours.\n\nMeetingAI Security', category: 'Security', createdAt: '2026-03-01T09:00:00Z' },
    { id: 'et-005', name: 'Task Overdue Reminder', subject: 'Overdue Task Reminder', body: 'Hi {{name}},\n\nYou have {{overdueCount}} overdue task(s):\n{{taskList}}\n\nPlease update their status or contact your team lead.\n\nMeetingAI', category: 'Reminders', createdAt: '2026-03-01T09:00:00Z' },
  ];
}

function createSeedReports(): Report[] {
  return [
    { id: 'rpt-001', title: 'March 2026 Monthly Report', type: 'monthly', generatedBy: 'Sarah Chen', generatedAt: '2026-04-01T06:00:00Z', data: { totalMeetings: 12, totalTasks: 20, completedTasks: 7, activeUsers: 10, newUsers: 2, avgMeetingDuration: 52, topDepartment: 'Engineering', satisfaction: 4.3 } },
    { id: 'rpt-002', title: 'Week 13 Report', type: 'weekly', generatedBy: 'System', generatedAt: '2026-03-31T00:00:00Z', data: { meetings: 4, tasksCreated: 6, tasksCompleted: 3, activeUsers: 8, avgDuration: 45 } },
    { id: 'rpt-003', title: 'Week 12 Report', type: 'weekly', generatedBy: 'System', generatedAt: '2026-03-24T00:00:00Z', data: { meetings: 3, tasksCreated: 5, tasksCompleted: 4, activeUsers: 9, avgDuration: 55 } },
  ];
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'MeetingAI', maxMeetingsPerUser: 100, enableNotifications: true,
  maintenanceMode: false, allowSignups: true, defaultTaskPriority: 'medium',
  autoGenerateTasks: true, maxFileSize: 50, sessionTimeout: 60,
  enableAuditLog: true, enableFeedback: true, requireEmailVerification: false,
  maxTasksPerUser: 200, enableGoals: true, enableTemplates: true,
  dataRetentionDays: 365, enableExport: true,
};

// ─── Initialize ─────────────────────────────────────────────────────────────────

function initDefaults() {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(createSeedMeetings()));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(createSeedTasks()));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(createSeedAnnouncements()));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(createSeedActivityLogs()));
  localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(createSeedFeedback()));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(createSeedNotes()));
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(createSeedTemplates()));
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(createSeedGoals()));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(createSeedNotifications()));
  localStorage.setItem(STORAGE_KEYS.EMAIL_TEMPLATES, JSON.stringify(createSeedEmailTemplates()));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(createSeedReports()));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// ─── Generic Helpers ────────────────────────────────────────────────────────────
function getList<T>(key: string): T[] { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }
function setList<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

// ─── Users ──────────────────────────────────────────────────────────────────────
export function getUsers(): User[] { return getList<User>(STORAGE_KEYS.USERS); }
export function saveUsers(users: User[]) { setList(STORAGE_KEYS.USERS, users); }
export function addUser(user: Omit<User, 'id' | 'createdAt' | 'status' | 'role'>): User {
  const users = getUsers();
  if (users.find(u => u.email === user.email)) throw new Error('Email already registered');
  const n: User = { ...user, id: generateId(), role: 'user', status: 'active', createdAt: new Date().toISOString() };
  saveUsers([...users, n]);
  addActivityLog({ userId: n.id, userName: n.name, action: 'User Registered', details: `${n.name} registered`, type: 'system' });
  addNotification({ userId: 'admin-001', title: 'New User', message: `${n.name} registered`, type: 'info' });
  return n;
}
export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers(); const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...updates }; saveUsers(users); return users[idx];
}
export function deleteUser(id: string) { saveUsers(getUsers().filter(u => u.id !== id)); }
export function authenticateUser(email: string, password: string): User | null {
  const users = getUsers(); const user = users.find(u => u.email === email && u.password === password);
  if (!user) return null;
  if (user.status === 'suspended') throw new Error('Account is suspended. Contact admin.');
  updateUser(user.id, { lastLogin: new Date().toISOString() });
  return { ...user, lastLogin: new Date().toISOString() };
}
export function getCurrentUser(): User | null {
  const d = localStorage.getItem(STORAGE_KEYS.CURRENT_USER); if (!d) return null;
  const stored = JSON.parse(d); const fresh = getUsers().find(u => u.id === stored.id);
  if (!fresh || fresh.status === 'suspended') { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); return null; }
  return fresh;
}
export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ─── Announcements ──────────────────────────────────────────────────────────────
export function getAnnouncements(): Announcement[] { return getList<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS); }
export function addAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
  const anns = getAnnouncements();
  const n: Announcement = { ...ann, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.ANNOUNCEMENTS, [n, ...anns]);
  addActivityLog({ userId: ann.authorId, userName: ann.authorName, action: 'Announcement Sent', details: `"${ann.title}"`, type: 'admin' });
  // Notify all users
  getUsers().forEach(u => { if (u.id !== ann.authorId) addNotification({ userId: u.id, title: 'New Announcement', message: ann.title, type: ann.priority === 'high' ? 'warning' : 'info' }); });
  return n;
}
export function deleteAnnouncement(id: string) { setList(STORAGE_KEYS.ANNOUNCEMENTS, getAnnouncements().filter(a => a.id !== id)); }

// ─── Meetings ───────────────────────────────────────────────────────────────────
export function getMeetings(userId?: string): Meeting[] { const m = getList<Meeting>(STORAGE_KEYS.MEETINGS); return userId ? m.filter(x => x.userId === userId) : m; }
export function addMeeting(meeting: Omit<Meeting, 'id' | 'createdAt'>): Meeting {
  const m = getMeetings(); const n: Meeting = { ...meeting, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.MEETINGS, [n, ...m]); return n;
}
export function updateMeeting(id: string, updates: Partial<Meeting>) {
  const m = getMeetings(); const idx = m.findIndex(x => x.id === id); if (idx === -1) return;
  m[idx] = { ...m[idx], ...updates }; setList(STORAGE_KEYS.MEETINGS, m);
}
export function deleteMeeting(id: string) { setList(STORAGE_KEYS.MEETINGS, getMeetings().filter(m => m.id !== id)); }

// ─── Tasks ──────────────────────────────────────────────────────────────────────
export function getTasks(userId?: string): Task[] { const t = getList<Task>(STORAGE_KEYS.TASKS); return userId ? t.filter(x => x.userId === userId) : t; }
export function addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const t = getTasks(); const n: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.TASKS, [n, ...t]); return n;
}
export function updateTask(id: string, updates: Partial<Task>) {
  const t = getTasks(); const idx = t.findIndex(x => x.id === id); if (idx === -1) throw new Error('Task not found');
  if (updates.status === 'completed' && t[idx].status !== 'completed') updates.completedAt = new Date().toISOString();
  t[idx] = { ...t[idx], ...updates }; setList(STORAGE_KEYS.TASKS, t); return t[idx];
}
export function deleteTask(id: string) { setList(STORAGE_KEYS.TASKS, getTasks().filter(t => t.id !== id)); }
export function addTaskComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): TaskComment {
  const t = getTasks(); const idx = t.findIndex(x => x.id === taskId); if (idx === -1) throw new Error('Task not found');
  const c: TaskComment = { ...comment, id: generateId(), createdAt: new Date().toISOString() };
  t[idx].comments = [...(t[idx].comments || []), c]; setList(STORAGE_KEYS.TASKS, t); return c;
}

// ─── Activity Logs ──────────────────────────────────────────────────────────────
export function getActivityLogs(): ActivityLog[] { return getList<ActivityLog>(STORAGE_KEYS.ACTIVITY_LOGS); }
export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  const logs = getActivityLogs(); const n: ActivityLog = { ...log, id: generateId(), timestamp: new Date().toISOString() };
  setList(STORAGE_KEYS.ACTIVITY_LOGS, [n, ...logs]); return n;
}

// ─── Feedback ───────────────────────────────────────────────────────────────────
export function getFeedback(): Feedback[] { return getList<Feedback>(STORAGE_KEYS.FEEDBACK); }
export function addFeedback(fb: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Feedback {
  const fbs = getFeedback(); const n: Feedback = { ...fb, id: generateId(), createdAt: new Date().toISOString(), status: 'new' };
  setList(STORAGE_KEYS.FEEDBACK, [n, ...fbs]);
  addNotification({ userId: 'admin-001', title: 'New Feedback', message: `${fb.userName}: ${fb.subject}`, type: 'info' });
  return n;
}
export function updateFeedback(id: string, updates: Partial<Feedback>) {
  const fbs = getFeedback(); const idx = fbs.findIndex(f => f.id === id); if (idx === -1) return;
  fbs[idx] = { ...fbs[idx], ...updates }; setList(STORAGE_KEYS.FEEDBACK, fbs);
}

// ─── Notes ──────────────────────────────────────────────────────────────────────
export function getNotes(userId?: string): Note[] { const n = getList<Note>(STORAGE_KEYS.NOTES); return userId ? n.filter(x => x.userId === userId) : n; }
export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const ns = getNotes(); const n: Note = { ...note, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  setList(STORAGE_KEYS.NOTES, [n, ...ns]); return n;
}
export function updateNote(id: string, updates: Partial<Note>) {
  const ns = getNotes(); const idx = ns.findIndex(n => n.id === id); if (idx === -1) return;
  ns[idx] = { ...ns[idx], ...updates, updatedAt: new Date().toISOString() }; setList(STORAGE_KEYS.NOTES, ns);
}
export function deleteNote(id: string) { setList(STORAGE_KEYS.NOTES, getNotes().filter(n => n.id !== id)); }

// ─── Templates ──────────────────────────────────────────────────────────────────
export function getTemplates(userId?: string): MeetingTemplate[] {
  const t = getList<MeetingTemplate>(STORAGE_KEYS.TEMPLATES);
  return userId ? t.filter(x => x.userId === userId || x.isGlobal) : t;
}
export function addTemplate(tmpl: Omit<MeetingTemplate, 'id' | 'createdAt'>): MeetingTemplate {
  const ts = getTemplates(); const n: MeetingTemplate = { ...tmpl, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.TEMPLATES, [n, ...ts]); return n;
}
export function deleteTemplate(id: string) { setList(STORAGE_KEYS.TEMPLATES, getTemplates().filter(t => t.id !== id)); }
export function updateTemplate(id: string, updates: Partial<MeetingTemplate>) {
  const ts = getTemplates(); const idx = ts.findIndex(t => t.id === id); if (idx === -1) return;
  ts[idx] = { ...ts[idx], ...updates }; setList(STORAGE_KEYS.TEMPLATES, ts);
}

// ─── Goals ──────────────────────────────────────────────────────────────────────
export function getGoals(userId?: string): Goal[] { const g = getList<Goal>(STORAGE_KEYS.GOALS); return userId ? g.filter(x => x.userId === userId) : g; }
export function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
  const gs = getGoals(); const n: Goal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.GOALS, [n, ...gs]); return n;
}
export function updateGoal(id: string, updates: Partial<Goal>) {
  const gs = getGoals(); const idx = gs.findIndex(g => g.id === id); if (idx === -1) return;
  gs[idx] = { ...gs[idx], ...updates }; setList(STORAGE_KEYS.GOALS, gs);
}
export function deleteGoal(id: string) { setList(STORAGE_KEYS.GOALS, getGoals().filter(g => g.id !== id)); }
export function toggleMilestone(goalId: string, milestoneId: string) {
  const gs = getGoals(); const gi = gs.findIndex(g => g.id === goalId); if (gi === -1) return;
  const mi = gs[gi].milestones.findIndex(m => m.id === milestoneId); if (mi === -1) return;
  gs[gi].milestones[mi].completed = !gs[gi].milestones[mi].completed;
  gs[gi].milestones[mi].completedAt = gs[gi].milestones[mi].completed ? new Date().toISOString() : undefined;
  const done = gs[gi].milestones.filter(m => m.completed).length;
  gs[gi].progress = Math.round((done / gs[gi].milestones.length) * 100);
  if (gs[gi].progress === 100) gs[gi].status = 'completed';
  setList(STORAGE_KEYS.GOALS, gs);
}

// ─── Notifications ──────────────────────────────────────────────────────────────
export function getNotifications(userId?: string): Notification[] { const n = getList<Notification>(STORAGE_KEYS.NOTIFICATIONS); return userId ? n.filter(x => x.userId === userId) : n; }
export function addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const ns = getNotifications(); const n: Notification = { ...notif, id: generateId(), createdAt: new Date().toISOString(), read: false };
  setList(STORAGE_KEYS.NOTIFICATIONS, [n, ...ns]); return n;
}
export function markNotificationRead(id: string) {
  const ns = getNotifications(); const idx = ns.findIndex(n => n.id === id); if (idx === -1) return;
  ns[idx].read = true; setList(STORAGE_KEYS.NOTIFICATIONS, ns);
}
export function markAllNotificationsRead(userId: string) {
  const ns = getNotifications(); ns.forEach(n => { if (n.userId === userId) n.read = true; }); setList(STORAGE_KEYS.NOTIFICATIONS, ns);
}
export function deleteNotification(id: string) { setList(STORAGE_KEYS.NOTIFICATIONS, getNotifications().filter(n => n.id !== id)); }

// ─── Email Templates ────────────────────────────────────────────────────────────
export function getEmailTemplates(): EmailTemplate[] { return getList<EmailTemplate>(STORAGE_KEYS.EMAIL_TEMPLATES); }
export function addEmailTemplate(tmpl: Omit<EmailTemplate, 'id' | 'createdAt'>): EmailTemplate {
  const ts = getEmailTemplates(); const n: EmailTemplate = { ...tmpl, id: generateId(), createdAt: new Date().toISOString() };
  setList(STORAGE_KEYS.EMAIL_TEMPLATES, [n, ...ts]); return n;
}
export function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>) {
  const ts = getEmailTemplates(); const idx = ts.findIndex(t => t.id === id); if (idx === -1) return;
  ts[idx] = { ...ts[idx], ...updates }; setList(STORAGE_KEYS.EMAIL_TEMPLATES, ts);
}
export function deleteEmailTemplate(id: string) { setList(STORAGE_KEYS.EMAIL_TEMPLATES, getEmailTemplates().filter(t => t.id !== id)); }

// ─── Reports ────────────────────────────────────────────────────────────────────
export function getReports(): Report[] { return getList<Report>(STORAGE_KEYS.REPORTS); }
export function addReport(report: Omit<Report, 'id' | 'generatedAt'>): Report {
  const rs = getReports(); const n: Report = { ...report, id: generateId(), generatedAt: new Date().toISOString() };
  setList(STORAGE_KEYS.REPORTS, [n, ...rs]); return n;
}
export function deleteReport(id: string) { setList(STORAGE_KEYS.REPORTS, getReports().filter(r => r.id !== id)); }

// ─── Settings ───────────────────────────────────────────────────────────────────
export function getSettings(): SystemSettings { const d = localStorage.getItem(STORAGE_KEYS.SETTINGS); return d ? JSON.parse(d) : DEFAULT_SETTINGS; }
export function updateSettings(updates: Partial<SystemSettings>) {
  const s = getSettings(); const u = { ...s, ...updates }; localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(u)); return u;
}

// ─── Utility: Generate Weekly Report ────────────────────────────────────────────
export function generateWeeklyReport(userName: string): Report {
  const meetings = getMeetings(); const tasks = getTasks();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weekMeetings = meetings.filter(m => new Date(m.createdAt) >= weekAgo);
  const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekAgo);
  const completedThisWeek = tasks.filter(t => t.completedAt && new Date(t.completedAt) >= weekAgo);
  return addReport({
    title: `Weekly Report - ${new Date().toLocaleDateString()}`, type: 'weekly', generatedBy: userName,
    data: { meetings: weekMeetings.length, tasksCreated: weekTasks.length, tasksCompleted: completedThisWeek.length,
      activeUsers: getUsers().filter(u => u.status === 'active').length, avgDuration: weekMeetings.length > 0 ? Math.round(weekMeetings.reduce((s, m) => s + (parseInt(m.duration) || 0), 0) / weekMeetings.length) : 0 }
  });
}

// Initialize
initDefaults();
