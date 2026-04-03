import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, LogOut, Users, Megaphone, Shield, Trash2, UserCheck, UserX, ArrowUpCircle, ArrowDownCircle,
  Activity, Settings, MessageSquare, BarChart3, Search, FileText, CheckSquare, Heart, Clock,
  TrendingUp, AlertTriangle, Mail, Download, Eye, EyeOff, Send, RefreshCw, Database,
  Globe, Zap, Target, Calendar, Bell, PieChart, Layout, Layers, Copy, Edit, Plus,
  Filter, MoreHorizontal, Star, Flag, Archive, Unlock, Lock, UserPlus, ChevronDown,
  ChevronUp, Briefcase, Building, Hash, Cpu, HardDrive, Wifi, Server, MonitorCheck,
  FileBarChart, MailPlus, UserCog, ClipboardList, Gauge, FolderOpen, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAllDataSnapshot, createExportEnvelope, downloadJsonFile, downloadReportMarkdown } from '@/lib/export';
import {
  getUsers, updateUser, deleteUser, getAnnouncements, addAnnouncement, deleteAnnouncement,
  getMeetings, getTasks, getActivityLogs, addActivityLog, getFeedback, updateFeedback,
  getSettings, updateSettings, deleteTask, updateTask, deleteMeeting, updateMeeting,
  getNotifications, addNotification, getEmailTemplates, addEmailTemplate, updateEmailTemplate,
  deleteEmailTemplate, getReports, addReport, deleteReport, getTemplates, addTemplate,
  deleteTemplate, updateTemplate, getGoals, getNotes, generateWeeklyReport, addTask
} from '@/lib/store';
import type { SystemSettings } from '@/lib/store';

type ExportDataType = 'Users' | 'Meetings' | 'Tasks' | 'Activity Logs' | 'Feedback' | 'Reports' | 'All Data';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [annCategory, setAnnCategory] = useState('General');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [meetingCatFilter, setMeetingCatFilter] = useState<string>('all');
  const [userDeptFilter, setUserDeptFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Inline state
  const [adminResponse, setAdminResponse] = useState<Record<string, string>>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Email template form
  const [etName, setEtName] = useState('');
  const [etSubject, setEtSubject] = useState('');
  const [etBody, setEtBody] = useState('');
  const [etCategory, setEtCategory] = useState('General');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  // Send notification form
  const [notifTarget, setNotifTarget] = useState<string>('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'error'>('info');

  // Meeting template form
  const [mtName, setMtName] = useState('');
  const [mtAgenda, setMtAgenda] = useState('');
  const [mtDuration, setMtDuration] = useState('30');
  const [mtGlobal, setMtGlobal] = useState(true);

  // Task assignment
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  if (!user || user.role !== 'admin') return null;

  void refreshKey;
  const users = getUsers();
  const announcements = getAnnouncements();
  const allMeetings = getMeetings();
  const allTasks = getTasks();
  const activityLogs = getActivityLogs();
  const feedbacks = getFeedback();
  const settings = getSettings();
  const emailTemplates = getEmailTemplates();
  const reports = getReports();
  const templates = getTemplates();
  const allGoals = getGoals();
  const allNotes = getNotes();
  const allNotifications = getNotifications();

  // Derived data
  const departments = Array.from(new Set(users.map(u => u.department || 'Unassigned')));
  const meetingCategories = Array.from(new Set(allMeetings.map(m => m.category || 'General')));

  const filteredUsers = users.filter(u => {
    if (userSearch && !u.name.toLowerCase().includes(userSearch.toLowerCase()) && !u.email.toLowerCase().includes(userSearch.toLowerCase())) return false;
    if (userDeptFilter !== 'all' && (u.department || 'Unassigned') !== userDeptFilter) return false;
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    return true;
  });
  const filteredLogs = activityLogs.filter(l => logFilter === 'all' || l.type === logFilter);
  const filteredFeedback = feedbacks.filter(f => feedbackFilter === 'all' || f.status === feedbackFilter);
  const filteredTasks = allTasks.filter(t => {
    if (taskFilter !== 'all' && t.status !== taskFilter) return false;
    if (taskPriorityFilter !== 'all' && t.priority !== taskPriorityFilter) return false;
    return true;
  });
  const filteredMeetings = allMeetings.filter(m => {
    if (meetingSearch && !m.title.toLowerCase().includes(meetingSearch.toLowerCase())) return false;
    if (meetingCatFilter !== 'all' && (m.category || 'General') !== meetingCatFilter) return false;
    return true;
  });

  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = allTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length;
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : 'N/A';
  const totalMinutes = allMeetings.reduce((s, m) => s + (parseInt(m.duration) || 0), 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const newFeedbackCount = feedbacks.filter(f => f.status === 'new').length;
  const unreadNotifs = allNotifications.filter(n => !n.read).length;

  const buildAllDataExport = () => ({
    users,
    announcements,
    meetings: allMeetings,
    tasks: allTasks,
    activityLogs,
    feedback: feedbacks,
    notifications: allNotifications,
    notes: allNotes,
    goals: allGoals,
    templates,
    emailTemplates,
    reports,
    settings,
  });

  const getExportPayload = (dataType: Exclude<ExportDataType, 'All Data'>) => {
    switch (dataType) {
      case 'Users':
        return users;
      case 'Meetings':
        return allMeetings;
      case 'Tasks':
        return allTasks;
      case 'Activity Logs':
        return activityLogs;
      case 'Feedback':
        return feedbacks;
      case 'Reports':
        return reports;
    }
  };

  const userStats = users.map(u => ({
    ...u,
    meetingCount: allMeetings.filter(m => m.userId === u.id).length,
    taskCount: allTasks.filter(t => t.userId === u.id).length,
    completedCount: allTasks.filter(t => t.userId === u.id && t.status === 'completed').length,
    noteCount: allNotes.filter(n => n.userId === u.id).length,
    goalCount: allGoals.filter(g => g.userId === u.id).length,
    feedbackCount: feedbacks.filter(f => f.userId === u.id).length,
  }));

  // ── Handlers ──
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) { toast({ title: 'Error', description: 'Title and message required', variant: 'destructive' }); return; }
    addAnnouncement({ title: annTitle, message: annMessage, priority: annPriority, authorId: user.id, authorName: user.name, category: annCategory });
    setAnnTitle(''); setAnnMessage(''); setAnnPriority('medium');
    toast({ title: 'Announcement sent to all users!' }); refresh();
  };

  const handleSuspend = (userId: string) => { updateUser(userId, { status: 'suspended' }); addActivityLog({ userId: user.id, userName: user.name, action: 'User Suspended', details: `Suspended ${users.find(u => u.id === userId)?.name}`, type: 'admin' }); toast({ title: 'User suspended' }); refresh(); };
  const handleActivate = (userId: string) => { updateUser(userId, { status: 'active' }); addActivityLog({ userId: user.id, userName: user.name, action: 'User Activated', details: `Activated ${users.find(u => u.id === userId)?.name}`, type: 'admin' }); toast({ title: 'User activated' }); refresh(); };
  const handlePromote = (userId: string) => { updateUser(userId, { role: 'admin' }); addActivityLog({ userId: user.id, userName: user.name, action: 'User Promoted', details: `Promoted ${users.find(u => u.id === userId)?.name} to admin`, type: 'admin' }); toast({ title: 'User promoted to admin' }); refresh(); };
  const handleDemote = (userId: string) => { updateUser(userId, { role: 'user' }); addActivityLog({ userId: user.id, userName: user.name, action: 'User Demoted', details: `Demoted ${users.find(u => u.id === userId)?.name}`, type: 'user' }); toast({ title: 'User demoted' }); refresh(); };
  const handleDeleteUser = (userId: string) => {
    if (userId === user.id) { toast({ title: 'Error', description: "Can't delete yourself", variant: 'destructive' }); return; }
    const t = users.find(u => u.id === userId);
    deleteUser(userId);
    addActivityLog({ userId: user.id, userName: user.name, action: 'User Deleted', details: `Deleted ${t?.name}`, type: 'admin' });
    toast({ title: 'User deleted' }); refresh();
  };

  const handleBulkAction = () => {
    if (!selectedUsers.length || !bulkAction) return;
    const self = selectedUsers.filter(id => id !== user.id);
    if (bulkAction === 'suspend') self.forEach(id => { updateUser(id, { status: 'suspended' }); });
    if (bulkAction === 'activate') self.forEach(id => { updateUser(id, { status: 'active' }); });
    if (bulkAction === 'delete') self.forEach(id => deleteUser(id));
    if (bulkAction === 'promote') self.forEach(id => { updateUser(id, { role: 'admin' }); });
    if (bulkAction === 'demote') self.forEach(id => { updateUser(id, { role: 'user' }); });
    addActivityLog({ userId: user.id, userName: user.name, action: `Bulk ${bulkAction}`, details: `Applied to ${self.length} users`, type: 'admin' });
    toast({ title: `Bulk ${bulkAction} applied to ${self.length} users` });
    setSelectedUsers([]); setBulkAction(''); refresh();
  };

  const handleRespondFeedback = (fbId: string) => {
    const response = adminResponse[fbId];
    if (!response?.trim()) return;
    updateFeedback(fbId, { adminResponse: response, status: 'resolved' });
    const fb = feedbacks.find(f => f.id === fbId);
    if (fb) addNotification({ userId: fb.userId, title: 'Feedback Response', message: `Admin responded to "${fb.subject}"`, type: 'success' });
    setAdminResponse(prev => ({ ...prev, [fbId]: '' }));
    toast({ title: 'Response sent & user notified!' }); refresh();
  };

  const handleSettingsUpdate = (key: keyof SystemSettings, value: any) => {
    updateSettings({ [key]: value });
    addActivityLog({ userId: user.id, userName: user.name, action: 'Settings Updated', details: `Changed ${key}`, type: 'admin' });
    toast({ title: 'Settings saved!' }); refresh();
  };

  const handleBulkCompleteTasks = () => {
    allTasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()).forEach(t => updateTask(t.id, { status: 'completed' }));
    addActivityLog({ userId: user.id, userName: user.name, action: 'Bulk Task Complete', details: 'All overdue tasks completed', type: 'admin' });
    toast({ title: 'Overdue tasks completed!' }); refresh();
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;
    const targets = notifTarget === 'all' ? users.map(u => u.id) : [notifTarget];
    targets.forEach(uid => addNotification({ userId: uid, title: notifTitle, message: notifMessage, type: notifType }));
    addActivityLog({ userId: user.id, userName: user.name, action: 'Notification Sent', details: `"${notifTitle}" to ${targets.length} user(s)`, type: 'admin' });
    setNotifTitle(''); setNotifMessage('');
    toast({ title: `Notification sent to ${targets.length} user(s)!` }); refresh();
  };

  const handleSaveEmailTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!etName.trim()) return;
    if (editingTemplate) {
      updateEmailTemplate(editingTemplate, { name: etName, subject: etSubject, body: etBody, category: etCategory });
      setEditingTemplate(null);
      toast({ title: 'Template updated!' });
    } else {
      addEmailTemplate({ name: etName, subject: etSubject, body: etBody, category: etCategory });
      toast({ title: 'Template created!' });
    }
    setEtName(''); setEtSubject(''); setEtBody(''); setEtCategory('General');
    refresh();
  };

  const handleAddMeetingTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtName.trim()) return;
    addTemplate({ name: mtName, agenda: mtAgenda, defaultDuration: mtDuration, defaultParticipants: '', userId: user.id, isGlobal: mtGlobal });
    setMtName(''); setMtAgenda(''); setMtDuration('30');
    addActivityLog({ userId: user.id, userName: user.name, action: 'Template Created', details: `Created "${mtName}"`, type: 'admin' });
    toast({ title: 'Meeting template created!' }); refresh();
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee) return;
    const targetUser = users.find(u => u.id === newTaskAssignee);
    if (!targetUser) return;
    addTask({ title: newTaskTitle, description: '', assignee: targetUser.name, status: 'pending', priority: newTaskPriority, dueDate: newTaskDue || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], userId: newTaskAssignee });
    addNotification({ userId: newTaskAssignee, title: 'New Task Assigned', message: `Admin assigned: "${newTaskTitle}"`, type: 'info' });
    addActivityLog({ userId: user.id, userName: user.name, action: 'Task Assigned', details: `Assigned "${newTaskTitle}" to ${targetUser.name}`, type: 'admin' });
    setNewTaskTitle(''); setNewTaskAssignee(''); setNewTaskDue('');
    toast({ title: 'Task assigned & user notified!' }); refresh();
  };

  const handleGenerateReport = (type: 'weekly' | 'monthly') => {
    const report = type === 'weekly'
      ? generateWeeklyReport(user.name)
      : addReport({
        title: `Monthly Report - ${new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}`,
        type: 'monthly',
        generatedBy: user.name,
        data: {
          totalMeetings: allMeetings.length,
          totalTasks: allTasks.length,
          completedTasks,
          activeUsers,
          avgRating,
          totalMinutes,
          departments: departments.length,
          feedbackCount: feedbacks.length,
        },
      });

    const filename = downloadReportMarkdown(report);

    addActivityLog({ userId: user.id, userName: user.name, action: 'Report Generated', details: `${type} report downloaded as ${filename}`, type: 'admin' });
    toast({ title: `${type} report generated!`, description: `${filename} downloaded.` }); refresh();
  };

  const handleExportData = (dataType: ExportDataType, dataOverride?: unknown) => {
    if (!settings.enableExport) {
      toast({ title: 'Data export disabled', description: 'Enable data export in settings first.', variant: 'destructive' });
      return;
    }

    const payload = dataType === 'All Data'
      ? createAllDataSnapshot(buildAllDataExport(), user.name)
      : createExportEnvelope(dataType, dataOverride ?? getExportPayload(dataType), user.name);
    const filename = downloadJsonFile(dataType, payload);

    addActivityLog({ userId: user.id, userName: user.name, action: 'Data Export', details: `Exported ${dataType} as ${filename}`, type: 'admin' });
    toast({ title: `${dataType} exported!`, description: `${filename} downloaded.` }); refresh();
  };

  const handleDownloadBackup = () => {
    const filename = downloadJsonFile('system-backup', createAllDataSnapshot(buildAllDataExport(), user.name));
    addActivityLog({ userId: user.id, userName: user.name, action: 'System Backup', details: `Downloaded backup ${filename}`, type: 'admin' });
    toast({ title: 'System backup created!', description: `${filename} downloaded.` }); refresh();
  };

  const handlePurgeOldData = (days: number) => {
    const cutoff = new Date(Date.now() - days * 86400000);
    const oldLogs = activityLogs.filter(l => new Date(l.timestamp) < cutoff);
    addActivityLog({ userId: user.id, userName: user.name, action: 'Data Purge', details: `Purged ${oldLogs.length} logs older than ${days} days`, type: 'admin' });
    toast({ title: `Purged data older than ${days} days` }); refresh();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">MeetingAI</span>
            <Badge variant="secondary" className="text-xs">Admin Panel</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1"><Bell className="h-3 w-3" />{unreadNotifs}</Badge>
            <Badge variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" />{newFeedbackCount} new</Badge>
            <Link to="/dashboard"><Button variant="outline" size="sm">User Dashboard</Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary' },
            { label: 'Active', value: activeUsers, icon: UserCheck, color: 'text-success' },
            { label: 'Suspended', value: suspendedUsers, icon: UserX, color: 'text-destructive' },
            { label: 'Admins', value: adminCount, icon: Shield, color: 'text-primary' },
            { label: 'Meetings', value: allMeetings.length, icon: Calendar, color: 'text-foreground' },
            { label: 'Tasks', value: allTasks.length, icon: CheckSquare, color: 'text-foreground' },
            { label: 'Overdue', value: overdueTasks, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Avg Rating', value: avgRating, icon: Heart, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-3 pb-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-foreground mr-2 self-center">Quick Actions:</span>
            <Button size="sm" variant="outline" onClick={handleBulkCompleteTasks} className="gap-1 text-xs"><CheckSquare className="h-3 w-3" /> Complete Overdue Tasks</Button>
            <Button size="sm" variant="outline" onClick={() => handleGenerateReport('weekly')} className="gap-1 text-xs"><FileBarChart className="h-3 w-3" /> Generate Weekly Report</Button>
            <Button size="sm" variant="outline" onClick={() => handleGenerateReport('monthly')} className="gap-1 text-xs"><PieChart className="h-3 w-3" /> Generate Monthly Report</Button>
            <Button size="sm" variant="outline" onClick={() => handleExportData('All Data')} className="gap-1 text-xs"><Download className="h-3 w-3" /> Export All Data</Button>
            <Button size="sm" variant="outline" onClick={handleDownloadBackup} className="gap-1 text-xs"><Database className="h-3 w-3" /> Trigger Backup</Button>
            <Button size="sm" variant="outline" onClick={() => { addActivityLog({ userId: user.id, userName: user.name, action: 'Cache Cleared', details: 'All caches cleared', type: 'admin' }); toast({ title: 'Cache cleared!' }); }} className="gap-1 text-xs"><RefreshCw className="h-3 w-3" /> Clear Cache</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <ScrollArea className="w-full">
            <TabsList className="mb-4 flex w-max">
              <TabsTrigger value="users" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
              <TabsTrigger value="meetings" className="gap-1 text-xs"><Calendar className="h-3.5 w-3.5" /> Meetings</TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1 text-xs"><CheckSquare className="h-3.5 w-3.5" /> Tasks</TabsTrigger>
              <TabsTrigger value="announcements" className="gap-1 text-xs"><Megaphone className="h-3.5 w-3.5" /> Announcements</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1 text-xs"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
              <TabsTrigger value="activity" className="gap-1 text-xs"><Activity className="h-3.5 w-3.5" /> Logs</TabsTrigger>
              <TabsTrigger value="feedback" className="gap-1 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Feedback</TabsTrigger>
              <TabsTrigger value="email-templates" className="gap-1 text-xs"><Mail className="h-3.5 w-3.5" /> Email Templates</TabsTrigger>
              <TabsTrigger value="meeting-templates" className="gap-1 text-xs"><Layout className="h-3.5 w-3.5" /> Meeting Templates</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1 text-xs"><FileBarChart className="h-3.5 w-3.5" /> Reports</TabsTrigger>
              <TabsTrigger value="data" className="gap-1 text-xs"><Database className="h-3.5 w-3.5" /> Data Mgmt</TabsTrigger>
              <TabsTrigger value="settings" className="gap-1 text-xs"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* ═══════════════ USERS TAB ═══════════════ */}
          <TabsContent value="users" className="space-y-3">
            {/* Filters & Bulk */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-9" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <Select value={userDeptFilter} onValueChange={setUserDeptFilter}>
                <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Depts</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="user">User</SelectItem></SelectContent>
              </Select>
            </div>

            {/* Bulk actions bar */}
            {selectedUsers.length > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{selectedUsers.length} selected</span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Bulk action..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suspend">Suspend All</SelectItem>
                      <SelectItem value="activate">Activate All</SelectItem>
                      <SelectItem value="promote">Promote All</SelectItem>
                      <SelectItem value="demote">Demote All</SelectItem>
                      <SelectItem value="delete">Delete All</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction} className="text-xs">Apply</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])} className="text-xs">Clear</Button>
                </CardContent>
              </Card>
            )}

            {/* Select all */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onCheckedChange={selectAllUsers} />
              <span className="text-xs text-muted-foreground">Select all ({filteredUsers.length})</span>
            </div>

            {/* User list */}
            {filteredUsers.map(u => {
              const stats = userStats.find(s => s.id === u.id);
              const isExpanded = expandedUser === u.id;
              return (
                <Card key={u.id} className="animate-fade-in">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedUsers.includes(u.id)} onCheckedChange={() => setSelectedUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} className="mt-1" />
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{u.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-medium text-sm text-foreground">{u.name}</span>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{u.role}</Badge>
                          <Badge variant={u.status === 'active' ? 'outline' : 'destructive'} className="text-xs">{u.status}</Badge>
                          {u.department && <Badge variant="outline" className="text-xs"><Building className="h-2.5 w-2.5 mr-1" />{u.department}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        {u.lastLogin && <p className="text-xs text-muted-foreground">Last login: {new Date(u.lastLogin).toLocaleString()}</p>}

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg space-y-2 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="bg-background rounded p-2 text-center"><p className="font-bold text-foreground">{stats?.meetingCount || 0}</p><p className="text-muted-foreground">Meetings</p></div>
                              <div className="bg-background rounded p-2 text-center"><p className="font-bold text-foreground">{stats?.taskCount || 0}</p><p className="text-muted-foreground">Tasks</p></div>
                              <div className="bg-background rounded p-2 text-center"><p className="font-bold text-success">{stats?.completedCount || 0}</p><p className="text-muted-foreground">Completed</p></div>
                              <div className="bg-background rounded p-2 text-center"><p className="font-bold text-foreground">{stats?.goalCount || 0}</p><p className="text-muted-foreground">Goals</p></div>
                            </div>
                            {u.bio && <p className="text-muted-foreground"><span className="font-medium text-foreground">Bio:</span> {u.bio}</p>}
                            {u.phone && <p className="text-muted-foreground"><span className="font-medium text-foreground">Phone:</span> {u.phone}</p>}
                            <div className="flex gap-2 text-muted-foreground">
                              <span className="font-medium text-foreground">Feedback:</span> {stats?.feedbackCount || 0} submissions
                              <span className="font-medium text-foreground ml-3">Notes:</span> {stats?.noteCount || 0}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-wrap shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        {u.id !== user.id ? (
                          <>
                            {u.status === 'active'
                              ? <Button variant="outline" size="sm" onClick={() => handleSuspend(u.id)} className="text-xs gap-1 h-7"><Lock className="h-3 w-3" /> Suspend</Button>
                              : <Button variant="outline" size="sm" onClick={() => handleActivate(u.id)} className="text-xs gap-1 h-7"><Unlock className="h-3 w-3" /> Activate</Button>
                            }
                            {u.role === 'user'
                              ? <Button variant="outline" size="sm" onClick={() => handlePromote(u.id)} className="text-xs gap-1 h-7"><ArrowUpCircle className="h-3 w-3" /> Promote</Button>
                              : <Button variant="outline" size="sm" onClick={() => handleDemote(u.id)} className="text-xs gap-1 h-7"><ArrowDownCircle className="h-3 w-3" /> Demote</Button>
                            }
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-xs text-destructive gap-1 h-7"><Trash2 className="h-3 w-3" /></Button>
                          </>
                        ) : <Badge variant="outline" className="text-xs">You</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ═══════════════ MEETINGS TAB ═══════════════ */}
          <TabsContent value="meetings" className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-9" placeholder="Search meetings..." value={meetingSearch} onChange={e => setMeetingSearch(e.target.value)} />
              </div>
              <Select value={meetingCatFilter} onValueChange={setMeetingCatFilter}>
                <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Categories</SelectItem>{meetingCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleExportData('Meetings', filteredMeetings)} className="gap-1 text-xs h-9"><Download className="h-3 w-3" /> Export</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{filteredMeetings.length} meetings · {totalMinutes} total minutes</p>
            {filteredMeetings.map(m => {
              const meetingUser = users.find(u => u.id === m.userId);
              return (
                <Card key={m.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-sm text-foreground">{m.title}</span>
                          {m.favorite && <Star className="h-3 w-3 fill-primary text-primary" />}
                          {m.category && <Badge variant="outline" className="text-xs">{m.category}</Badge>}
                          {m.sentiment && <Badge variant={m.sentiment === 'positive' ? 'default' : m.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-xs">{m.sentiment}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">By {meetingUser?.name || 'Unknown'} · {new Date(m.date).toLocaleDateString()} · {m.duration} · {m.participants.length} participants</p>
                        <div className="flex gap-1 mt-1 flex-wrap">{(m.tags || []).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                        {m.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{m.summary.replace(/\*\*/g, '')}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild><Button variant="outline" size="sm" className="text-xs gap-1 h-7"><Eye className="h-3 w-3" /> View</Button></DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{m.title}</DialogTitle>
                              <DialogDescription>{new Date(m.date).toLocaleString()} · {m.duration}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div><Label className="text-xs font-medium">Participants</Label><p className="text-sm text-muted-foreground">{m.participants.join(', ')}</p></div>
                              <div><Label className="text-xs font-medium">Transcript</Label><p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">{m.transcript}</p></div>
                              {m.summary && (
                                <div>
                                  <Label className="text-xs font-medium">AI Summary</Label>
                                  <div className="mt-1 rounded bg-muted/30 p-3">
                                    <MarkdownContent content={m.summary} className="text-sm text-muted-foreground" />
                                  </div>
                                </div>
                              )}
                              {m.actionItems && m.actionItems.length > 0 && <div><Label className="text-xs font-medium">Action Items</Label><ul className="list-disc pl-4 text-sm text-muted-foreground">{m.actionItems.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => { deleteMeeting(m.id); addActivityLog({ userId: user.id, userName: user.name, action: 'Meeting Deleted', details: `Deleted "${m.title}"`, type: 'admin' }); toast({ title: 'Meeting deleted' }); refresh(); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ═══════════════ TASKS TAB ═══════════════ */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Assign task form */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Assign Task to User</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAssignTask} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[200px] space-y-1"><Label className="text-xs">Title</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title..." className="h-8" required /></div>
                  <div className="w-40 space-y-1"><Label className="text-xs">Assign To</Label>
                    <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}><SelectTrigger className="h-8"><SelectValue placeholder="User..." /></SelectTrigger><SelectContent>{users.filter(u => u.status === 'active').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="w-28 space-y-1"><Label className="text-xs">Priority</Label>
                    <Select value={newTaskPriority} onValueChange={v => setNewTaskPriority(v as any)}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
                  </div>
                  <div className="w-36 space-y-1"><Label className="text-xs">Due Date</Label><Input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="h-8" /></div>
                  <Button type="submit" size="sm" className="gap-1"><Send className="h-3 w-3" /> Assign</Button>
                </form>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
              </Select>
              <Select value={taskPriorityFilter} onValueChange={setTaskPriorityFilter}>
                <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleBulkCompleteTasks} className="text-xs gap-1 h-8"><CheckSquare className="h-3 w-3" /> Complete Overdue ({overdueTasks})</Button>
              <Button variant="outline" size="sm" onClick={() => handleExportData('Tasks', filteredTasks)} className="text-xs gap-1 h-8"><Download className="h-3 w-3" /> Export</Button>
              <span className="text-xs text-muted-foreground self-center ml-auto">{filteredTasks.length} tasks</span>
            </div>

            {/* Task table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.slice(0, 30).map(t => {
                    const taskUser = users.find(u => u.id === t.userId);
                    const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';
                    return (
                      <TableRow key={t.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          <span className={`text-sm ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</span>
                          {isOverdue && <Badge variant="destructive" className="text-[10px] ml-1">Overdue</Badge>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.assignee}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{taskUser?.name || '—'}</TableCell>
                        <TableCell><Badge variant={t.priority === 'high' ? 'destructive' : t.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">{t.priority}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.dueDate}</TableCell>
                        <TableCell>
                          <Select value={t.status} onValueChange={v => { updateTask(t.id, { status: v as any }); refresh(); }}>
                            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteTask(t.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ═══════════════ ANNOUNCEMENTS TAB ═══════════════ */}
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-5 w-5" /> Broadcast Announcement</CardTitle>
                <CardDescription>Sent to all users instantly with notification</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title" required /></div>
                    <div className="space-y-1"><Label className="text-xs">Priority</Label>
                      <Select value={annPriority} onValueChange={v => setAnnPriority(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label>
                      <Select value={annCategory} onValueChange={setAnnCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Product">Product</SelectItem><SelectItem value="System">System</SelectItem><SelectItem value="Security">Security</SelectItem><SelectItem value="Social">Social</SelectItem></SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Message</Label><Textarea value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Announcement body..." rows={3} required /></div>
                  <Button type="submit" className="gap-1"><Send className="h-4 w-4" /> Broadcast to All Users</Button>
                </form>
              </CardContent>
            </Card>
            {announcements.map(a => (
              <Card key={a.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{a.title}</span>
                        <Badge variant={a.priority === 'high' ? 'destructive' : a.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">{a.priority}</Badge>
                        {a.category && <Badge variant="outline" className="text-xs">{a.category}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">By {a.authorName} · {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { deleteAnnouncement(a.id); refresh(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ═══════════════ NOTIFICATIONS TAB ═══════════════ */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" /> Send Notification</CardTitle>
                <CardDescription>Send targeted or broadcast notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Target</Label>
                      <Select value={notifTarget} onValueChange={setNotifTarget}><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          {users.filter(u => u.status === 'active').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Type</Label>
                      <Select value={notifType} onValueChange={v => setNotifType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" required /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Message</Label><Input value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder="Message..." /></div>
                  <Button type="submit" className="gap-1"><Send className="h-4 w-4" /> Send</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Recent Notifications ({allNotifications.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allNotifications.slice(0, 30).map(n => {
                    const nUser = users.find(u => u.id === n.userId);
                    return (
                      <div key={n.id} className={`flex items-center gap-3 p-2 rounded text-sm ${n.read ? 'opacity-60' : 'bg-muted/30'}`}>
                        <div className={`h-2 w-2 rounded-full shrink-0 ${n.type === 'error' ? 'bg-destructive' : n.type === 'warning' ? 'bg-warning' : n.type === 'success' ? 'bg-success' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground text-xs">{n.title}</span>
                          <span className="text-muted-foreground text-xs ml-2">{n.message}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{nUser?.name}</span>
                        <Badge variant={n.read ? 'secondary' : 'default'} className="text-[10px]">{n.read ? 'Read' : 'Unread'}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ ANALYTICS TAB ═══════════════ */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Platform Overview</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ['Total Users', users.length], ['Active Users', activeUsers], ['Admins', adminCount],
                    ['Total Meetings', allMeetings.length], ['Meeting Time', `${totalMinutes} min`],
                    ['Avg Duration', `${allMeetings.length > 0 ? Math.round(totalMinutes / allMeetings.length) : 0} min`],
                    ['Total Tasks', allTasks.length], ['Task Completion', `${allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0}%`],
                    ['Avg Rating', `${avgRating}/5`], ['Active Goals', allGoals.filter(g => g.status === 'active').length],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-bold text-foreground">{val}</span></div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">User Leaderboard</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {userStats.sort((a, b) => (b.meetingCount + b.completedCount) - (a.meetingCount + a.completedCount)).slice(0, 8).map((u, i) => (
                    <div key={u.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs w-5 font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>#{i + 1}</span>
                        <span className="text-foreground text-xs">{u.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-[10px]">{u.meetingCount}m</Badge>
                        <Badge variant="outline" className="text-[10px]">{u.completedCount}✓</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Department Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {departments.map(dept => {
                    const count = users.filter(u => (u.department || 'Unassigned') === dept).length;
                    const pct = Math.round((count / users.length) * 100);
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">{dept}</span><span className="font-medium text-foreground">{count} ({pct}%)</span></div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Task Status Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Pending', count: allTasks.filter(t => t.status === 'pending').length, color: 'bg-muted-foreground' },
                    { label: 'In Progress', count: allTasks.filter(t => t.status === 'in-progress').length, color: 'bg-primary' },
                    { label: 'Completed', count: completedTasks, color: 'bg-success' },
                    { label: 'Overdue', count: overdueTasks, color: 'bg-destructive' },
                  ].map(s => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{s.label}</span><span className="font-medium text-foreground">{s.count}</span></div>
                      <div className="h-1.5 bg-muted rounded-full"><div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${allTasks.length > 0 ? (s.count / allTasks.length) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Feedback Ratings</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = feedbacks.filter(f => f.rating === r).length;
                    return (
                      <div key={r} className="flex items-center gap-2">
                        <div className="flex gap-0.5 w-16">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-2.5 w-2.5 ${i < r ? 'fill-primary text-primary' : 'text-muted'}`} />)}</div>
                        <div className="flex-1"><Progress value={feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0} className="h-1.5" /></div>
                        <span className="text-xs font-medium text-foreground w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Meeting Sentiment</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {['positive', 'neutral', 'negative'].map(s => {
                    const count = allMeetings.filter(m => m.sentiment === s).length;
                    const noSent = allMeetings.filter(m => !m.sentiment).length;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className={`text-xs w-16 capitalize ${s === 'positive' ? 'text-success' : s === 'negative' ? 'text-destructive' : 'text-muted-foreground'}`}>{s}</span>
                        <div className="flex-1"><Progress value={allMeetings.length > 0 ? (count / allMeetings.length) * 100 : 0} className="h-1.5" /></div>
                        <span className="text-xs font-medium text-foreground w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ ACTIVITY LOGS TAB ═══════════════ */}
          <TabsContent value="activity" className="space-y-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              {['all', 'admin', 'user', 'system'].map(f => (
                <Button key={f} variant={logFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setLogFilter(f)} className="text-xs capitalize">{f} {f === 'all' ? `(${activityLogs.length})` : `(${activityLogs.filter(l => l.type === f).length})`}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleExportData('Activity Logs', filteredLogs)} className="text-xs gap-1 ml-auto"><Download className="h-3 w-3" /> Export</Button>
            </div>
            {filteredLogs.slice(0, 30).map(log => (
              <Card key={log.id} className="animate-fade-in">
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${log.type === 'admin' ? 'bg-primary' : log.type === 'system' ? 'bg-warning' : 'bg-success'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{log.action}</span><Badge variant="outline" className="text-[10px]">{log.type}</Badge></div>
                    <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{log.userName}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ═══════════════ FEEDBACK TAB ═══════════════ */}
          <TabsContent value="feedback" className="space-y-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              <Button variant={feedbackFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFeedbackFilter('all')} className="text-xs">All ({feedbacks.length})</Button>
              <Button variant={feedbackFilter === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setFeedbackFilter('new')} className="text-xs">New ({newFeedbackCount})</Button>
              <Button variant={feedbackFilter === 'reviewed' ? 'default' : 'outline'} size="sm" onClick={() => setFeedbackFilter('reviewed')} className="text-xs">Reviewed</Button>
              <Button variant={feedbackFilter === 'resolved' ? 'default' : 'outline'} size="sm" onClick={() => setFeedbackFilter('resolved')} className="text-xs">Resolved</Button>
            </div>
            {filteredFeedback.map(fb => (
              <Card key={fb.id} className="animate-fade-in">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{fb.subject}</span>
                        <Badge variant={fb.status === 'new' ? 'default' : fb.status === 'resolved' ? 'secondary' : 'outline'} className="text-xs">{fb.status}</Badge>
                        {fb.category && <Badge variant="outline" className="text-xs">{fb.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{fb.userName} · {new Date(fb.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < fb.rating ? 'fill-primary text-primary' : 'text-muted'}`} />)}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{fb.message}</p>
                  {fb.adminResponse && <div className="bg-primary/5 rounded-lg p-2 text-xs border border-primary/20"><span className="font-medium text-foreground">Admin:</span> <span className="text-muted-foreground">{fb.adminResponse}</span></div>}
                  {fb.status !== 'resolved' && (
                    <div className="mt-2 flex gap-2">
                      <Input placeholder="Write response..." value={adminResponse[fb.id] || ''} onChange={e => setAdminResponse(prev => ({ ...prev, [fb.id]: e.target.value }))} className="h-8 text-xs" />
                      <Button size="sm" onClick={() => handleRespondFeedback(fb.id)} className="text-xs gap-1"><Send className="h-3 w-3" /> Reply</Button>
                      <Button size="sm" variant="outline" onClick={() => { updateFeedback(fb.id, { status: 'reviewed' }); refresh(); }} className="text-xs">Mark Reviewed</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ═══════════════ EMAIL TEMPLATES TAB ═══════════════ */}
          <TabsContent value="email-templates" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><MailPlus className="h-4 w-4" /> {editingTemplate ? 'Edit Template' : 'Create Email Template'}</CardTitle>
                <CardDescription>Templates for automated emails. Use {'{{name}}'}, {'{{email}}'} as variables.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveEmailTemplate} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={etName} onChange={e => setEtName(e.target.value)} placeholder="Template name" required /></div>
                    <div className="space-y-1"><Label className="text-xs">Subject</Label><Input value={etSubject} onChange={e => setEtSubject(e.target.value)} placeholder="Email subject" /></div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label>
                      <Select value={etCategory} onValueChange={setEtCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Onboarding">Onboarding</SelectItem><SelectItem value="Account">Account</SelectItem><SelectItem value="Security">Security</SelectItem><SelectItem value="Engagement">Engagement</SelectItem><SelectItem value="Reminders">Reminders</SelectItem></SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Body</Label><Textarea value={etBody} onChange={e => setEtBody(e.target.value)} rows={4} placeholder="Email body..." /></div>
                  <div className="flex gap-2">
                    <Button type="submit" className="gap-1">{editingTemplate ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {editingTemplate ? 'Update' : 'Create'}</Button>
                    {editingTemplate && <Button type="button" variant="outline" onClick={() => { setEditingTemplate(null); setEtName(''); setEtSubject(''); setEtBody(''); }}>Cancel</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>

            {emailTemplates.map(et => (
              <Card key={et.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm text-foreground">{et.name}</span><Badge variant="outline" className="text-xs">{et.category}</Badge></div>
                      <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Subject:</span> {et.subject}</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">{et.body}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setEditingTemplate(et.id); setEtName(et.name); setEtSubject(et.subject); setEtBody(et.body); setEtCategory(et.category); }}><Edit className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { const target = users.filter(u => u.status === 'active'); addActivityLog({ userId: user.id, userName: user.name, action: 'Email Sent', details: `Sent "${et.name}" to ${target.length} users`, type: 'admin' }); toast({ title: `Email "${et.name}" sent to ${target.length} users!` }); }}><Send className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive h-7" onClick={() => { deleteEmailTemplate(et.id); refresh(); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ═══════════════ MEETING TEMPLATES TAB ═══════════════ */}
          <TabsContent value="meeting-templates" className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4" /> Create Meeting Template</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddMeetingTemplate} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={mtName} onChange={e => setMtName(e.target.value)} placeholder="Template name" required /></div>
                    <div className="space-y-1"><Label className="text-xs">Default Duration (min)</Label><Input value={mtDuration} onChange={e => setMtDuration(e.target.value)} type="number" /></div>
                    <div className="flex items-end gap-2 pb-0.5">
                      <div className="flex items-center gap-2"><Checkbox checked={mtGlobal} onCheckedChange={v => setMtGlobal(!!v)} /><Label className="text-xs">Available to all users</Label></div>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Agenda</Label><Textarea value={mtAgenda} onChange={e => setMtAgenda(e.target.value)} rows={3} placeholder="Meeting agenda..." /></div>
                  <Button type="submit" className="gap-1"><Plus className="h-4 w-4" /> Create Template</Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-3">
              {templates.map(t => (
                <Card key={t.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium text-sm text-foreground">{t.name}</span>{t.isGlobal && <Badge variant="outline" className="text-[10px]"><Globe className="h-2.5 w-2.5 mr-1" />Global</Badge>}</div>
                        <p className="text-xs text-muted-foreground">{t.defaultDuration} min · {users.find(u => u.id === t.userId)?.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => { deleteTemplate(t.id); refresh(); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{t.agenda}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ═══════════════ REPORTS TAB ═══════════════ */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex gap-2 mb-3">
              <Button onClick={() => handleGenerateReport('weekly')} className="gap-1 text-xs"><FileBarChart className="h-3 w-3" /> Generate Weekly</Button>
              <Button onClick={() => handleGenerateReport('monthly')} variant="outline" className="gap-1 text-xs"><PieChart className="h-3 w-3" /> Generate Monthly</Button>
              <Button variant="outline" className="gap-1 text-xs" onClick={() => handleExportData('Reports')}><Download className="h-3 w-3" /> Export All</Button>
            </div>

            {reports.map(r => (
              <Card key={r.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{r.title}</span>
                        <Badge variant={r.type === 'monthly' ? 'default' : 'secondary'} className="text-xs">{r.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">By {r.generatedBy} · {new Date(r.generatedAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => { deleteReport(r.id); refresh(); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(r.data).map(([key, val]) => (
                      <div key={key} className="bg-muted/30 rounded p-2 text-center">
                        <p className="font-bold text-sm text-foreground">{String(val)}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ═══════════════ DATA MANAGEMENT TAB ═══════════════ */}
          <TabsContent value="data" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4" /> Export Data</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {['Users', 'Meetings', 'Tasks', 'Activity Logs', 'Feedback', 'Reports', 'All Data'].map(dt => (
                    <Button key={dt} variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => handleExportData(dt)}>
                      <span>{dt}</span><Download className="h-3 w-3" />
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trash2 className="h-4 w-4 text-destructive" /> Data Purge</CardTitle><CardDescription>Remove old data to free storage</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {[30, 60, 90, 180, 365].map(days => (
                    <Button key={days} variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => handlePurgeOldData(days)}>
                      <span>Purge data older than {days} days</span><Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Storage Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ['Users', users.length], ['Meetings', allMeetings.length], ['Tasks', allTasks.length],
                    ['Activity Logs', activityLogs.length], ['Feedback', feedbacks.length],
                    ['Notifications', allNotifications.length], ['Notes', allNotes.length],
                    ['Goals', allGoals.length], ['Templates', templates.length],
                    ['Email Templates', emailTemplates.length], ['Reports', reports.length],
                  ].map(([label, count]) => (
                    <div key={String(label)} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium text-foreground">{count} records</span></div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Maintenance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => { addActivityLog({ userId: user.id, userName: user.name, action: 'Cache Cleared', details: 'All caches cleared', type: 'admin' }); toast({ title: 'Cache cleared!' }); }}>
                    <span>Clear All Caches</span><RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={() => { addActivityLog({ userId: user.id, userName: user.name, action: 'Index Rebuild', details: 'Search indexes rebuilt', type: 'admin' }); toast({ title: 'Indexes rebuilt!' }); }}>
                    <span>Rebuild Search Indexes</span><Database className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={handleDownloadBackup}>
                    <span>Full System Backup</span><HardDrive className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full justify-between text-xs" onClick={() => { localStorage.removeItem('sma_initialized_v5'); toast({ title: 'Data will reset on reload', description: 'Refresh the page to reset all data.' }); }}>
                    <span>Factory Reset (Danger!)</span><AlertCircle className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ SETTINGS TAB ═══════════════ */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1"><Label className="text-xs">Site Name</Label><Input value={settings.siteName} onChange={e => handleSettingsUpdate('siteName', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Max Meetings Per User</Label><Input type="number" value={settings.maxMeetingsPerUser} onChange={e => handleSettingsUpdate('maxMeetingsPerUser', parseInt(e.target.value))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Max Tasks Per User</Label><Input type="number" value={settings.maxTasksPerUser} onChange={e => handleSettingsUpdate('maxTasksPerUser', parseInt(e.target.value))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Max File Size (MB)</Label><Input type="number" value={settings.maxFileSize} onChange={e => handleSettingsUpdate('maxFileSize', parseInt(e.target.value))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Session Timeout (min)</Label><Input type="number" value={settings.sessionTimeout} onChange={e => handleSettingsUpdate('sessionTimeout', parseInt(e.target.value))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Data Retention (days)</Label><Input type="number" value={settings.dataRetentionDays} onChange={e => handleSettingsUpdate('dataRetentionDays', parseInt(e.target.value))} /></div>
                  <div className="space-y-1"><Label className="text-xs">Default Task Priority</Label>
                    <Select value={settings.defaultTaskPriority} onValueChange={v => handleSettingsUpdate('defaultTaskPriority', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Feature Toggles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'enableNotifications', label: 'Notifications', desc: 'Send in-app notifications' },
                    { key: 'allowSignups', label: 'Allow Signups', desc: 'New user registration' },
                    { key: 'autoGenerateTasks', label: 'Auto Tasks', desc: 'Extract tasks from transcripts' },
                    { key: 'enableAuditLog', label: 'Audit Log', desc: 'Log all admin actions' },
                    { key: 'enableFeedback', label: 'Feedback', desc: 'Allow user feedback' },
                    { key: 'enableGoals', label: 'Goals', desc: 'Enable goal tracking' },
                    { key: 'enableTemplates', label: 'Templates', desc: 'Meeting templates' },
                    { key: 'enableExport', label: 'Data Export', desc: 'Allow data export' },
                    { key: 'requireEmailVerification', label: 'Email Verification', desc: 'Require email confirmation' },
                  ].map(toggle => (
                    <div key={toggle.key} className="flex items-center justify-between">
                      <div><Label className="text-xs">{toggle.label}</Label><p className="text-[10px] text-muted-foreground">{toggle.desc}</p></div>
                      <Switch checked={(settings as any)[toggle.key]} onCheckedChange={v => handleSettingsUpdate(toggle.key as keyof SystemSettings, v)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> System Health</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Database', status: 'Healthy', icon: Database },
                    { label: 'API Server', status: 'Online', icon: Server },
                    { label: 'AI Engine', status: 'Active', icon: Cpu },
                    { label: 'Storage', status: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`, icon: HardDrive },
                    { label: 'Uptime', status: '99.9%', icon: MonitorCheck },
                    { label: 'WebSocket', status: 'Connected', icon: Wifi },
                  ].map(h => (
                    <div key={h.label} className="flex items-center gap-3 bg-success/5 rounded-lg p-2.5">
                      <h.icon className="h-4 w-4 text-success" />
                      <span className="text-xs text-muted-foreground flex-1">{h.label}</span>
                      <span className="text-xs font-bold text-success">{h.status}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div><Label className="text-xs text-destructive">Maintenance Mode</Label><p className="text-[10px] text-muted-foreground">Disables access for all users</p></div>
                      <Switch checked={settings.maintenanceMode} onCheckedChange={v => handleSettingsUpdate('maintenanceMode', v)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
