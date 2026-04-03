import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CREDENTIALS = {
  user: { email: 'user@meetingai.com', password: 'user123' },
  admin: { email: 'admin@meetingai.com', password: 'admin123' },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-fill credentials when mode changes
  useEffect(() => {
    setEmail(CREDENTIALS[mode].email);
    setPassword(CREDENTIALS[mode].password);
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = login(email, password);
      if (mode === 'admin' && user.role !== 'admin') {
        toast({ title: 'Access denied', description: 'This account does not have admin privileges', variant: 'destructive' });
        setLoading(false);
        return;
      }
      toast({ title: 'Welcome back!', description: `Logged in as ${user.name}` });
      navigate(user.role === 'admin' && mode === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your MeetingAI account</CardDescription>

          <div className="flex justify-center gap-2 mt-4">
            <Button type="button" variant={mode === 'user' ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => setMode('user')}>
              <User className="h-4 w-4" /> User
            </Button>
            <Button type="button" variant={mode === 'admin' ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => setMode('admin')}>
              <Shield className="h-4 w-4" /> Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : mode === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
          <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
            <p className="font-medium text-foreground mb-1">Demo Credentials (auto-filled):</p>
            <p>User: user@meetingai.com / user123</p>
            <p>Admin: admin@meetingai.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
