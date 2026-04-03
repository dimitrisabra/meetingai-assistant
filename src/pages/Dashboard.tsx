import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Brain, LogOut, Plus, Trash2, FileText, CheckSquare, Bell, Megaphone, Star, Search, BarChart3, User, MessageSquare, Clock, TrendingUp, Heart, Filter, Eye, EyeOff, StickyNote, Target, BookTemplate, Calendar, Send, Pin, PinOff, Edit, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadReportMarkdown } from '@/lib/export';
import { getMeetings, addMeeting, deleteMeeting, updateMeeting, getTasks, addTask, updateTask, deleteTask, addTaskComment, getAnnouncements, addFeedback, getUsers, getNotes, addNote, updateNote, deleteNote, getTemplates, addTemplate, deleteTemplate, getGoals, addGoal, updateGoal, deleteGoal, toggleMilestone, getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, generateWeeklyReport, getReports } from '@/lib/store';
import { hasGeminiApiKey, summarizeMeetingWithGemini } from '@/lib/gemini';

function generateTasksFromTranscript(transcript: string, userId: string): Array<Omit<import('@/lib/store').Task, 'id' | 'createdAt'>> {
  const actionWords = ['need to', 'should', 'will', 'must', 'action item', 'follow up', 'assign', 'complete', 'schedule', 'prepare', 'review', 'send', 'create', 'update'];
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const tasks: Array<Omit<import('@/lib/store').Task, 'id' | 'createdAt'>> = [];
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (actionWords.some(w => lower.includes(w))) {
      tasks.push({ title: sentence.trim().slice(0, 80), description: sentence.trim(), assignee: 'Unassigned', status: 'pending', priority: lower.includes('urgent') ? 'high' : lower.includes('important') ? 'medium' : 'low', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], userId });
    }
  });
  if (tasks.length === 0) tasks.push({ title: 'Review meeting notes', description: 'Follow up on meeting discussion.', assignee: 'Unassigned', status: 'pending', priority: 'medium', dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], userId });
  return tasks;
}

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [meetingParticipants, setMeetingParticipants] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('30');
  const [meetingCategory, setMeetingCategory] = useState('General');
  const [isProcessingMeeting, setIsProcessingMeeting] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDue, setTaskDue] = useState('');
  const [taskCategory, setTaskCategory] = useState('General');
  const [taskHours, setTaskHours] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [meetingFilter, setMeetingFilter] = useState('all');

  const [editProfile, setEditProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileDept, setProfileDept] = useState(user?.department || '');

  const [fbSubject, setFbSubject] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState('General');

  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // Notes
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('bg-primary/10');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Templates
  const [tmplName, setTmplName] = useState('');
  const [tmplAgenda, setTmplAgenda] = useState('');
  const [tmplDuration, setTmplDuration] = useState('30');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Goals
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCategory, setGoalCategory] = useState('General');
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({});

  // Pomodoro
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroLabel, setPomodoroLabel] = useState('');

  // Task view mode
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');

  if (!user) return null;
  void refreshKey;

  const allMeetings = getMeetings(user.id);
  const allTasks = getTasks(user.id);
  const announcements = getAnnouncements();
  const allUsers = getUsers();
  const notes = getNotes(user.id);
  const templates = getTemplates(user.id);
  const goals = getGoals(user.id);
  const notifications = getNotifications(user.id);
  const reports = getReports();
  const unreadCount = notifications.filter(n => !n.read).length;

  const meetings = allMeetings.filter(m => {
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !m.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (meetingFilter === 'favorites' && !m.favorite) return false;
    if (meetingFilter === 'recent') { if (new Date(m.date).getTime() < Date.now() - 7 * 86400000) return false; }
    if (meetingFilter !== 'all' && meetingFilter !== 'favorites' && meetingFilter !== 'recent' && m.category !== meetingFilter) return false;
    return true;
  });

  const tasks = allTasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (taskFilter === 'all') return true;
    if (taskFilter === 'overdue') return t.status !== 'completed' && new Date(t.dueDate) < new Date();
    if (['pending', 'in-progress', 'completed'].includes(taskFilter)) return t.status === taskFilter;
    if (['high', 'medium', 'low'].includes(taskFilter)) return t.priority === taskFilter;
    return true;
  });

  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const totalMinutes = allMeetings.reduce((s, m) => s + (parseInt(m.duration) || 0), 0);
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const overdueTasks = allTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date());
  const totalEstimated = allTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const totalActual = allTasks.reduce((s, t) => s + (t.actualHours || 0), 0);

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingTranscript.trim()) { toast({ title: 'Error', description: 'Title and transcript required', variant: 'destructive' }); return; }

    const participants = meetingParticipants.split(',').map(p => p.trim()).filter(Boolean);
    const normalizedDuration = meetingDuration.trim() || '30';

    setIsProcessingMeeting(true);

    try {
      const summary = await summarizeMeetingWithGemini({
        title: meetingTitle,
        transcript: meetingTranscript,
        participants,
        durationMinutes: normalizedDuration,
        category: meetingCategory,
      });
      const meeting = addMeeting({
        title: meetingTitle,
        date: new Date().toISOString(),
        duration: normalizedDuration + ' min',
        participants,
        transcript: meetingTranscript,
        summary,
        userId: user.id,
        category: meetingCategory,
      });
      const autoTasks = generateTasksFromTranscript(meetingTranscript, user.id);
      autoTasks.forEach(t => addTask({ ...t, meetingId: meeting.id }));
      setMeetingTitle(''); setMeetingTranscript(''); setMeetingParticipants(''); setMeetingDuration('30');
      toast({ title: 'Meeting summarized!', description: `${autoTasks.length} task(s) auto-created.` }); refresh();
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unable to summarize the meeting right now.';
      toast({ title: 'AI summary failed', description, variant: 'destructive' });
    } finally {
      setIsProcessingMeeting(false);
    }
  };

  const handleUseTemplate = (tmplId: string) => {
    const tmpl = templates.find(t => t.id === tmplId);
    if (!tmpl) return;
    setMeetingTitle(tmpl.name);
    setMeetingTranscript(tmpl.agenda);
    setMeetingDuration(tmpl.defaultDuration);
    if (tmpl.defaultParticipants) setMeetingParticipants(tmpl.defaultParticipants);
    setSelectedTemplate(tmplId);
    toast({ title: 'Template loaded!', description: tmpl.name });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({ title: taskTitle, description: taskDesc, assignee: taskAssignee || 'Unassigned', status: 'pending', priority: taskPriority, dueDate: taskDue || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], userId: user.id, category: taskCategory, estimatedHours: taskHours ? parseFloat(taskHours) : undefined });
    setTaskTitle(''); setTaskDesc(''); setTaskAssignee(''); setTaskDue(''); setTaskHours('');
    toast({ title: 'Task created!' }); refresh();
  };

  const handleAddComment = (taskId: string) => {
    const text = commentText[taskId];
    if (!text?.trim()) return;
    addTaskComment(taskId, { userId: user.id, userName: user.name, text });
    setCommentText(p => ({ ...p, [taskId]: '' }));
    toast({ title: 'Comment added!' }); refresh();
  };

  const handleSaveProfile = () => {
    updateProfile({ name: profileName, phone: profilePhone, bio: profileBio, department: profileDept });
    setEditProfile(false); toast({ title: 'Profile updated!' });
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSubject.trim() || !fbMessage.trim()) return;
    addFeedback({ userId: user.id, userName: user.name, subject: fbSubject, message: fbMessage, rating: fbRating, category: fbCategory });
    setFbSubject(''); setFbMessage(''); setFbRating(5);
    toast({ title: 'Feedback sent!' }); refresh();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    addNote({ userId: user.id, title: noteTitle, content: noteContent, color: noteColor, pinned: false });
    setNoteTitle(''); setNoteContent(''); toast({ title: 'Note created!' }); refresh();
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim()) return;
    addTemplate({ name: tmplName, agenda: tmplAgenda, defaultDuration: tmplDuration, defaultParticipants: '', userId: user.id });
    setTmplName(''); setTmplAgenda(''); toast({ title: 'Template created!' }); refresh();
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;
    addGoal({ userId: user.id, title: goalTitle, description: goalDesc, targetDate: goalTarget, progress: 0, status: 'active', milestones: [], category: goalCategory });
    setGoalTitle(''); setGoalDesc(''); setGoalTarget(''); toast({ title: 'Goal created!' }); refresh();
  };

  const handleAddMilestone = (goalId: string) => {
    const text = newMilestone[goalId];
    if (!text?.trim()) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const ms = [...goal.milestones, { id: Date.now().toString(36), title: text, completed: false }];
    updateGoal(goalId, { milestones: ms, progress: Math.round(ms.filter(m => m.completed).length / ms.length * 100) });
    setNewMilestone(p => ({ ...p, [goalId]: '' }));
    toast({ title: 'Milestone added!' }); refresh();
  };

  const handleGenerateReport = () => {
    const report = generateWeeklyReport(user.name);
    const filename = downloadReportMarkdown(report);
    toast({ title: 'Report generated!', description: `${filename} downloaded.` }); refresh();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const priorityColor = (p: string) => p === 'high' ? 'destructive' as const : p === 'medium' ? 'default' as const : 'secondary' as const;
  const statusColor = (s: string) => s === 'completed' ? 'default' as const : s === 'in-progress' ? 'secondary' as const : 'outline' as const;

  // Pomodoro timer
  const startPomodoro = () => { setPomodoroActive(true); setPomodoroTime(25 * 60); };
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Kanban columns
  const kanbanCols = ['pending', 'in-progress', 'completed'] as const;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">MeetingAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 w-56 h-9" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" className="relative" onClick={() => { markAllNotificationsRead(user.id); refresh(); }}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
            {user.role === 'admin' && <Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>}
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-primary">{allMeetings.length}</p><p className="text-xs text-muted-foreground">Meetings</p></CardContent></Card>
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-foreground">{allTasks.length}</p><p className="text-xs text-muted-foreground">Tasks</p></CardContent></Card>
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-success">{completedTasks}</p><p className="text-xs text-muted-foreground">Done</p></CardContent></Card>
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-warning">{overdueTasks.length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-foreground">{totalMinutes}m</p><p className="text-xs text-muted-foreground">Time</p></CardContent></Card>
          <Card><CardContent className="pt-3 pb-3 text-center"><p className="text-xl font-bold text-primary">{goals.filter(g => g.status === 'active').length}</p><p className="text-xs text-muted-foreground">Goals</p></CardContent></Card>
        </div>

        <Card className="mb-4"><CardContent className="pt-3 pb-3"><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-foreground">Completion</span><span className="text-xs font-bold text-primary">{completionRate}%</span></div><Progress value={completionRate} className="h-1.5" /></CardContent></Card>

        {overdueTasks.length > 0 && (
          <Card className="mb-4 border-destructive/30 bg-destructive/5"><CardContent className="pt-3 pb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive font-medium">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span><span className="text-xs text-muted-foreground ml-2">{overdueTasks.slice(0, 2).map(t => t.title).join(', ')}</span></CardContent></Card>
        )}

        {announcements.length > 0 && (
          <Card className="mb-4 border-primary/30 bg-primary/5"><CardContent className="pt-3 pb-3 space-y-1">
            {announcements.slice(0, 2).map(a => (<div key={a.id} className="flex items-center gap-2"><Megaphone className="h-3 w-3 text-primary shrink-0" /><span className="text-xs font-medium text-foreground">{a.title}</span><Badge variant={a.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs scale-90">{a.priority}</Badge></div>))}
          </CardContent></Card>
        )}

        <Tabs defaultValue="meetings">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="meetings" className="gap-1 text-xs"><FileText className="h-3 w-3" /> Meetings</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1 text-xs"><CheckSquare className="h-3 w-3" /> Tasks</TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 text-xs"><StickyNote className="h-3 w-3" /> Notes</TabsTrigger>
            <TabsTrigger value="goals" className="gap-1 text-xs"><Target className="h-3 w-3" /> Goals</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1 text-xs"><BookTemplate className="h-3 w-3" /> Templates</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs"><BarChart3 className="h-3 w-3" /> Analytics</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 text-xs"><Bell className="h-3 w-3" /> Notifs {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
            <TabsTrigger value="team" className="gap-1 text-xs"><User className="h-3 w-3" /> Team</TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 text-xs"><TrendingUp className="h-3 w-3" /> Reports</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1 text-xs"><MessageSquare className="h-3 w-3" /> Feedback</TabsTrigger>
            <TabsTrigger value="profile" className="gap-1 text-xs"><User className="h-3 w-3" /> Profile</TabsTrigger>
          </TabsList>

          {/* ─── MEETINGS ─── */}
          <TabsContent value="meetings" className="space-y-4">
            <div className="flex gap-2 mb-2 flex-wrap">
              {['all', 'favorites', 'recent', 'Planning', 'Design', 'Engineering', 'Marketing', 'Product'].map(f => (
                <Button key={f} variant={meetingFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setMeetingFilter(f)} className="text-xs">{f === 'favorites' && <Star className="h-3 w-3 mr-1" />}{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</Button>
              ))}
            </div>

            {templates.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="text-xs text-muted-foreground self-center">Quick start:</span>
                {templates.slice(0, 4).map(t => (<Button key={t.id} variant="outline" size="sm" className="text-xs" onClick={() => handleUseTemplate(t.id)}><BookTemplate className="h-3 w-3 mr-1" /> {t.name}</Button>))}
              </div>
            )}

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> New Meeting</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddMeeting} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="Meeting title" required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Duration</Label><Input type="number" value={meetingDuration} onChange={e => setMeetingDuration(e.target.value)} className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label>
                      <Select value={meetingCategory} onValueChange={setMeetingCategory}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{['General', 'Planning', 'Design', 'Engineering', 'Marketing', 'Product', 'HR', 'Sales', 'Security'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Participants</Label><Input value={meetingParticipants} onChange={e => setMeetingParticipants(e.target.value)} placeholder="Alice, Bob" className="h-9" /></div>
                  <div className="space-y-1"><Label className="text-xs">Transcript</Label><Textarea value={meetingTranscript} onChange={e => setMeetingTranscript(e.target.value)} placeholder="Paste transcript..." rows={4} required /></div>
                  {!hasGeminiApiKey() && (
                    <p className="text-xs text-muted-foreground">
                      Add VITE_GEMINI_API_KEY to .env.local to enable AI summaries.
                    </p>
                  )}
                  <Button type="submit" size="sm" disabled={isProcessingMeeting}>
                    <Brain className="h-3 w-3 mr-1" />
                    {isProcessingMeeting ? 'Summarizing...' : 'Process'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {meetings.map(m => (
              <Card key={m.id} className="animate-fade-in">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm">{m.title}</CardTitle>
                      {m.category && <Badge variant="outline" className="text-xs">{m.category}</Badge>}
                      {m.sentiment && <Badge variant={m.sentiment === 'positive' ? 'default' : m.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-xs">{m.sentiment}</Badge>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-muted-foreground mr-1">{m.duration} · {new Date(m.date).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { updateMeeting(m.id, { favorite: !m.favorite }); refresh(); }}><Star className={`h-3 w-3 ${m.favorite ? 'fill-warning text-warning' : 'text-muted-foreground'}`} /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}>{expandedMeeting === m.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteMeeting(m.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                  {m.participants.length > 0 && <div className="flex gap-1 flex-wrap">{m.participants.map(p => <Badge key={p} variant="secondary" className="text-xs scale-90">{p}</Badge>)}</div>}
                  {m.tags && m.tags.length > 0 && <div className="flex gap-1 flex-wrap">{m.tags.map(t => <Badge key={t} variant="outline" className="text-xs scale-90">#{t}</Badge>)}</div>}
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-3 text-xs text-foreground">
                    <MarkdownContent content={m.summary} />
                  </div>
                  {m.actionItems && m.actionItems.length > 0 && <div className="mt-2"><p className="text-xs font-medium text-foreground mb-1">Action Items:</p>{m.actionItems.map((a, i) => <p key={i} className="text-xs text-muted-foreground">• {a}</p>)}</div>}
                  {expandedMeeting === m.id && (
                    <div className="mt-2 bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground border border-border">
                      <p className="font-medium text-foreground mb-1">Full Transcript:</p>
                      <MarkdownContent content={m.transcript} className="text-xs text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {meetings.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No meetings found.</p>}
          </TabsContent>

          {/* ─── TASKS ─── */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'pending', 'in-progress', 'completed', 'overdue', 'high'].map(f => (
                  <Button key={f} variant={taskFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter(f)} className="text-xs h-7">{f === 'all' ? `All (${allTasks.length})` : f === 'overdue' ? `Overdue (${overdueTasks.length})` : f}</Button>
                ))}
              </div>
              <div className="flex gap-1">
                <Button variant={taskViewMode === 'list' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTaskViewMode('list')}>List</Button>
                <Button variant={taskViewMode === 'kanban' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTaskViewMode('kanban')}>Kanban</Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> New Task</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title" required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Assignee</Label><Input value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} placeholder="Assignee" className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label>
                      <Select value={taskCategory} onValueChange={setTaskCategory}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{['General', 'Development', 'Design', 'Marketing', 'DevOps', 'HR', 'Security', 'Documentation', 'Sales', 'Product'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description" rows={2} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Priority</Label><Select value={taskPriority} onValueChange={v => setTaskPriority(v as any)}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label className="text-xs">Due Date</Label><Input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Est. Hours</Label><Input type="number" value={taskHours} onChange={e => setTaskHours(e.target.value)} placeholder="0" className="h-9" /></div>
                  </div>
                  <Button type="submit" size="sm"><Plus className="h-3 w-3 mr-1" /> Add</Button>
                </form>
              </CardContent>
            </Card>

            {taskViewMode === 'kanban' ? (
              <div className="grid grid-cols-3 gap-3">
                {kanbanCols.map(col => (
                  <div key={col}>
                    <div className="flex items-center gap-2 mb-2"><Badge variant={statusColor(col)} className="text-xs">{col}</Badge><span className="text-xs text-muted-foreground">({allTasks.filter(t => t.status === col).length})</span></div>
                    <div className="space-y-2">
                      {allTasks.filter(t => t.status === col).map(t => (
                        <Card key={t.id} className="animate-fade-in">
                          <CardContent className="pt-3 pb-3">
                            <p className="text-xs font-medium text-foreground mb-1">{t.title}</p>
                            <div className="flex gap-1 mb-1"><Badge variant={priorityColor(t.priority)} className="text-xs scale-90">{t.priority}</Badge>{t.category && <Badge variant="outline" className="text-xs scale-90">{t.category}</Badge>}</div>
                            <p className="text-xs text-muted-foreground">{t.assignee} · {t.dueDate}</p>
                            <Select value={t.status} onValueChange={v => { updateTask(t.id, { status: v as any }); refresh(); }}>
                              <SelectTrigger className="h-6 text-xs mt-2"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              tasks.map(t => (
                <Card key={t.id} className={`animate-fade-in ${t.status === 'completed' ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`font-medium text-xs ${t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</span>
                          <Badge variant={priorityColor(t.priority)} className="text-xs scale-90">{t.priority}</Badge>
                          <Badge variant={statusColor(t.status)} className="text-xs scale-90">{t.status}</Badge>
                          {t.category && <Badge variant="outline" className="text-xs scale-90">{t.category}</Badge>}
                          {new Date(t.dueDate) < new Date() && t.status !== 'completed' && <Badge variant="destructive" className="text-xs scale-90">Overdue</Badge>}
                        </div>
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{t.assignee} · Due: {t.dueDate}{t.estimatedHours ? ` · Est: ${t.estimatedHours}h` : ''}{t.actualHours ? ` · Act: ${t.actualHours}h` : ''}</p>
                        {t.comments && t.comments.length > 0 && (
                          <div className="mt-2 space-y-1">{t.comments.map(c => (<div key={c.id} className="bg-muted rounded p-1.5 text-xs"><span className="font-medium text-foreground">{c.userName}:</span> <span className="text-muted-foreground">{c.text}</span></div>))}</div>
                        )}
                        <div className="mt-1.5 flex gap-1">
                          <Input className="h-7 text-xs flex-1" placeholder="Add comment..." value={commentText[t.id] || ''} onChange={e => setCommentText(p => ({ ...p, [t.id]: e.target.value }))} />
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAddComment(t.id)}><Send className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Select value={t.status} onValueChange={v => { updateTask(t.id, { status: v as any }); refresh(); }}>
                          <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteTask(t.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {taskViewMode === 'list' && tasks.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No tasks match filter.</p>}
          </TabsContent>

          {/* ─── NOTES ─── */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" /> New Note</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Note title" required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Color</Label>
                      <Select value={noteColor} onValueChange={setNoteColor}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>
                        <SelectItem value="bg-primary/10">Blue</SelectItem><SelectItem value="bg-success/10">Green</SelectItem><SelectItem value="bg-warning/10">Yellow</SelectItem><SelectItem value="bg-destructive/10">Red</SelectItem><SelectItem value="bg-accent/10">Teal</SelectItem>
                      </SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Content</Label><Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your note..." rows={3} /></div>
                  <Button type="submit" size="sm"><Plus className="h-3 w-3 mr-1" /> Add Note</Button>
                </form>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(n => (
                <Card key={n.id} className={`${n.color} animate-fade-in`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">{n.title}</span>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { updateNote(n.id, { pinned: !n.pinned }); refresh(); }}>{n.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}</Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { deleteNote(n.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(n.updatedAt).toLocaleDateString()}</p>
                    {n.tags && n.tags.length > 0 && <div className="flex gap-1 mt-1">{n.tags.map(t => <Badge key={t} variant="outline" className="text-xs scale-90">#{t}</Badge>)}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── GOALS ─── */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> New Goal</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddGoal} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="Goal title" required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Target Date</Label><Input type="date" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Category</Label>
                      <Select value={goalCategory} onValueChange={setGoalCategory}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{['General', 'Product', 'Engineering', 'Growth', 'Customer Success', 'Personal'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={goalDesc} onChange={e => setGoalDesc(e.target.value)} rows={2} /></div>
                  <Button type="submit" size="sm"><Plus className="h-3 w-3 mr-1" /> Add Goal</Button>
                </form>
              </CardContent>
            </Card>
            {goals.map(g => (
              <Card key={g.id} className="animate-fade-in">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className={`h-4 w-4 ${g.status === 'completed' ? 'text-success' : 'text-primary'}`} />
                      <span className="font-medium text-sm text-foreground">{g.title}</span>
                      <Badge variant={g.status === 'completed' ? 'default' : g.status === 'paused' ? 'secondary' : 'outline'} className="text-xs">{g.status}</Badge>
                      {g.category && <Badge variant="outline" className="text-xs">{g.category}</Badge>}
                    </div>
                    <div className="flex gap-1">
                      {g.status !== 'completed' && <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { updateGoal(g.id, { status: g.status === 'paused' ? 'active' : 'paused' }); refresh(); }}>{g.status === 'paused' ? 'Resume' : 'Pause'}</Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteGoal(g.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </div>
                  {g.description && <p className="text-xs text-muted-foreground mb-2">{g.description}</p>}
                  <div className="flex items-center gap-2 mb-2"><Progress value={g.progress} className="h-2 flex-1" /><span className="text-xs font-bold text-primary">{g.progress}%</span></div>
                  <p className="text-xs text-muted-foreground mb-2">Target: {g.targetDate}</p>
                  {g.milestones.length > 0 && (
                    <div className="space-y-1 mb-2">{g.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Checkbox checked={m.completed} onCheckedChange={() => { toggleMilestone(g.id, m.id); refresh(); }} />
                        <span className={`text-xs ${m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{m.title}</span>
                      </div>
                    ))}</div>
                  )}
                  <div className="flex gap-1">
                    <Input className="h-7 text-xs flex-1" placeholder="Add milestone..." value={newMilestone[g.id] || ''} onChange={e => setNewMilestone(p => ({ ...p, [g.id]: e.target.value }))} />
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAddMilestone(g.id)}><Plus className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ─── TEMPLATES ─── */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookTemplate className="h-4 w-4" /> Create Template</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddTemplate} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={tmplName} onChange={e => setTmplName(e.target.value)} placeholder="Template name" required className="h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">Default Duration (min)</Label><Input type="number" value={tmplDuration} onChange={e => setTmplDuration(e.target.value)} className="h-9" /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Agenda</Label><Textarea value={tmplAgenda} onChange={e => setTmplAgenda(e.target.value)} placeholder="1. Topic one\n2. Topic two..." rows={4} /></div>
                  <Button type="submit" size="sm"><Plus className="h-3 w-3 mr-1" /> Create</Button>
                </form>
              </CardContent>
            </Card>
            {templates.map(t => (
              <Card key={t.id} className="animate-fade-in">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2"><span className="font-medium text-sm text-foreground">{t.name}</span>{t.isGlobal && <Badge variant="secondary" className="text-xs">Global</Badge>}<span className="text-xs text-muted-foreground">{t.defaultDuration} min</span></div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{t.agenda}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleUseTemplate(t.id)}>Use</Button>
                      {!t.isGlobal && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteTemplate(t.id); refresh(); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ─── ANALYTICS ─── */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle className="text-sm">Productivity</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Meetings</span><span className="font-bold">{allMeetings.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Time</span><span className="font-bold">{totalMinutes} min</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Duration</span><span className="font-bold">{allMeetings.length > 0 ? Math.round(totalMinutes / allMeetings.length) : 0} min</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tasks/Meeting</span><span className="font-bold">{allMeetings.length > 0 ? (allTasks.length / allMeetings.length).toFixed(1) : 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Completion</span><span className="font-bold text-success">{completionRate}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Hours</span><span className="font-bold">{totalEstimated}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Actual Hours</span><span className="font-bold">{totalActual}h</span></div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Tasks by Status</CardTitle></CardHeader><CardContent className="space-y-2">
                {[{ l: 'Pending', n: pendingTasks, c: 'bg-warning' }, { l: 'In Progress', n: inProgressTasks, c: 'bg-info' }, { l: 'Completed', n: completedTasks, c: 'bg-success' }, { l: 'Overdue', n: overdueTasks.length, c: 'bg-destructive' }].map(x => (
                  <div key={x.l}><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{x.l}</span><span className="font-bold">{x.n}</span></div><div className="w-full bg-muted rounded-full h-1.5"><div className={`${x.c} rounded-full h-1.5`} style={{ width: `${allTasks.length > 0 ? (x.n / allTasks.length) * 100 : 0}%` }} /></div></div>
                ))}
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">By Category</CardTitle></CardHeader><CardContent className="space-y-2">
                {Array.from(new Set(allTasks.map(t => t.category || 'General'))).map(cat => {
                  const count = allTasks.filter(t => (t.category || 'General') === cat).length;
                  return <div key={cat} className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-20 truncate">{cat}</span><div className="flex-1 bg-muted rounded-full h-1.5"><div className="bg-primary rounded-full h-1.5" style={{ width: `${(count / allTasks.length) * 100}%` }} /></div><span className="text-xs font-bold w-6 text-right">{count}</span></div>;
                })}
              </CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Meeting Sentiment</CardTitle></CardHeader><CardContent className="space-y-2">
                {['positive', 'neutral', 'negative'].map(s => {
                  const count = allMeetings.filter(m => m.sentiment === s).length;
                  return <div key={s} className="flex items-center gap-2"><Badge variant={s === 'positive' ? 'default' : s === 'negative' ? 'destructive' : 'secondary'} className="w-16 justify-center text-xs">{s}</Badge><div className="flex-1 bg-muted rounded-full h-1.5"><div className={`rounded-full h-1.5 ${s === 'positive' ? 'bg-success' : s === 'negative' ? 'bg-destructive' : 'bg-muted-foreground/30'}`} style={{ width: `${allMeetings.length > 0 ? (count / allMeetings.length) * 100 : 0}%` }} /></div><span className="text-xs font-bold w-6 text-right">{count}</span></div>;
                })}
              </CardContent></Card>
            </div>
          </TabsContent>

          {/* ─── NOTIFICATIONS ─── */}
          <TabsContent value="notifications" className="space-y-2">
            <div className="flex justify-between mb-2"><span className="text-sm font-medium">{notifications.length} notifications</span><Button variant="outline" size="sm" className="text-xs" onClick={() => { markAllNotificationsRead(user.id); refresh(); }}>Mark all read</Button></div>
            {notifications.map(n => (
              <Card key={n.id} className={`animate-fade-in ${n.read ? 'opacity-60' : ''}`}>
                <CardContent className="pt-3 pb-3 flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${n.type === 'error' ? 'bg-destructive' : n.type === 'warning' ? 'bg-warning' : n.type === 'success' ? 'bg-success' : 'bg-primary'}`} />
                  <div className="flex-1">
                    <p className={`text-xs ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-0.5">
                    {!n.read && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { markNotificationRead(n.id); refresh(); }}><Eye className="h-3 w-3" /></Button>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { deleteNotification(n.id); refresh(); }}><X className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {notifications.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No notifications.</p>}
          </TabsContent>

          {/* ─── TEAM ─── */}
          <TabsContent value="team" className="space-y-2">
            {allUsers.filter(u => u.status === 'active' && u.id !== user.id).map(u => (
              <Card key={u.id}><CardContent className="pt-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{u.name.charAt(0)}</div><div><p className="text-xs font-medium text-foreground">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div>
                <div className="flex gap-1"><Badge variant="secondary" className="text-xs">{u.department || 'N/A'}</Badge><Badge variant={u.role === 'admin' ? 'default' : 'outline'} className="text-xs">{u.role}</Badge></div>
              </CardContent></Card>
            ))}
          </TabsContent>

          {/* ─── REPORTS ─── */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex gap-2"><Button size="sm" onClick={handleGenerateReport}><TrendingUp className="h-3 w-3 mr-1" /> Generate Weekly Report</Button></div>
            {reports.map(r => (
              <Card key={r.id} className="animate-fade-in"><CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm text-foreground">{r.title}</span><Badge variant="outline" className="text-xs">{r.type}</Badge></div>
                <p className="text-xs text-muted-foreground mb-2">By {r.generatedBy} · {new Date(r.generatedAt).toLocaleString()}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(r.data).map(([k, v]) => (<div key={k} className="bg-muted rounded p-2 text-center"><p className="text-lg font-bold text-foreground">{typeof v === 'number' ? v : String(v)}</p><p className="text-xs text-muted-foreground">{k.replace(/([A-Z])/g, ' $1').trim()}</p></div>))}
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>

          {/* ─── FEEDBACK ─── */}
          <TabsContent value="feedback">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Send Feedback</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Subject</Label><Input value={fbSubject} onChange={e => setFbSubject(e.target.value)} required className="h-9" /></div>
                  <div className="space-y-1"><Label className="text-xs">Category</Label><Select value={fbCategory} onValueChange={setFbCategory}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{['General', 'Feature', 'Feature Request', 'Bug', 'UI/UX'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Message</Label><Textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} rows={3} required /></div>
                <div className="space-y-1"><Label className="text-xs">Rating</Label><div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (<button key={n} type="button" onClick={() => setFbRating(n)} className="focus:outline-none"><Heart className={`h-5 w-5 ${n <= fbRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} /></button>))}</div></div>
                <Button type="submit" size="sm"><Send className="h-3 w-3 mr-1" /> Send</Button>
              </form>
            </CardContent></Card>
          </TabsContent>

          {/* ─── PROFILE ─── */}
          <TabsContent value="profile">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent>
              {!editProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{user.name.charAt(0)}</div>
                    <div><p className="font-bold text-foreground">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p><div className="flex gap-1 mt-1"><Badge variant="secondary" className="text-xs">{user.role}</Badge><Badge variant="outline" className="text-xs">{user.department || 'No dept'}</Badge></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{user.phone || 'Not set'}</span></div>
                    <div><span className="text-muted-foreground">Joined:</span> <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                    <div><span className="text-muted-foreground">Last Login:</span> <span className="text-foreground">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span></div>
                    <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className="text-xs">{user.status}</Badge></div>
                  </div>
                  {user.bio && <p className="text-xs text-muted-foreground">{user.bio}</p>}
                  <Button size="sm" onClick={() => setEditProfile(true)}>Edit Profile</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={profileName} onChange={e => setProfileName(e.target.value)} className="h-9" /></div>
                  <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="h-9" /></div>
                  <div className="space-y-1"><Label className="text-xs">Department</Label><Input value={profileDept} onChange={e => setProfileDept(e.target.value)} className="h-9" /></div>
                  <div className="space-y-1"><Label className="text-xs">Bio</Label><Textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={2} /></div>
                  <div className="flex gap-2"><Button size="sm" onClick={handleSaveProfile}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditProfile(false)}>Cancel</Button></div>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
