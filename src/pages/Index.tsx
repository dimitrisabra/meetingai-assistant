import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Brain, Zap, Users, Shield, ArrowRight, FileText, BarChart3, Clock, Star } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">MeetingAI</span>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
                {user.role === 'admin' && <Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>}
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/signup"><Button size="sm">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Zap className="h-4 w-4" /> AI-Powered Meeting Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Summarize Meetings.<br />Generate Tasks. <span className="text-primary">Automatically.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Paste your meeting transcript and let AI extract key points, action items, and assign tasks to your team instantly.
        </p>
        <Link to={user ? "/dashboard" : "/login"}>
          <Button size="lg" className="gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Brain, title: 'AI Summaries', desc: 'Instant meeting summaries from transcripts with key decisions highlighted.' },
          { icon: Users, title: 'Task Generation', desc: 'Automatically generate and assign tasks to team members from discussions.' },
          { icon: Shield, title: 'Admin Controls', desc: 'Manage users, send announcements, and control access from the admin panel.' },
        ].map(f => (
          <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <f.icon className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Everything You Need</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: FileText, title: 'Meeting Notes', desc: 'Organize and search all your meeting records.' },
            { icon: BarChart3, title: 'Analytics', desc: 'Track productivity metrics and team performance.' },
            { icon: Clock, title: 'Time Tracking', desc: 'Monitor meeting durations and time allocation.' },
            { icon: Star, title: 'Favorites', desc: 'Bookmark important meetings for quick access.' },
          ].map(f => (
            <div key={f.title} className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-sm transition-shadow">
              <f.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-foreground text-sm mb-1">{f.title}</h4>
              <p className="text-muted-foreground text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Trusted by Teams</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'James Wilson', role: 'Product Manager', quote: 'MeetingAI saves me at least 30 minutes per meeting. The AI summaries are incredibly accurate.' },
              { name: 'Emily Rodriguez', role: 'UI/UX Designer', quote: 'The auto-generated tasks from transcripts are a game changer for our design sprints.' },
              { name: 'Aisha Patel', role: 'Marketing Lead', quote: 'I love how announcements from admin show up right on my dashboard. Great communication tool.' },
            ].map(t => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-5">
                <p className="text-muted-foreground text-sm italic mb-3">"{t.quote}"</p>
                <p className="text-foreground font-medium text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MeetingAI. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
