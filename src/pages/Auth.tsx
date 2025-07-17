import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, Users, Shield } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '', 
    role: '' as 'admin' | 'company' | 'applicant' | '' 
  });
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (!error) {
      // Navigation handled in auth hook with window.location.href
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }
    
    if (!signUpData.role) {
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.fullName, 
      signUpData.role
    );
    
    if (!error) {
      // Reset form
      setSignUpData({ 
        email: '', 
        password: '', 
        confirmPassword: '', 
        fullName: '', 
        role: '' as 'admin' | 'company' | 'applicant' | '' 
      });
    }
    
    setIsLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      case 'applicant':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Manage platform, approve jobs, and access analytics';
      case 'company':
        return 'Post jobs, manage applications, and find talent';
      case 'applicant':
        return 'Search jobs, apply for positions, and build your profile';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            VishwasJobPortal.com
          </h1>
          <p className="text-white/80">Connect with opportunities</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Account Type</Label>
                    <Select
                      value={signUpData.role}
                      onValueChange={(value: 'admin' | 'company' | 'applicant') => 
                        setSignUpData({ ...signUpData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applicant">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon('applicant')}
                            <div>
                              <div className="font-medium">Job Seeker</div>
                              <div className="text-xs text-muted-foreground">
                                {getRoleDescription('applicant')}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="company">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon('company')}
                            <div>
                              <div className="font-medium">Company / Recruiter</div>
                              <div className="text-xs text-muted-foreground">
                                {getRoleDescription('company')}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon('admin')}
                            <div>
                              <div className="font-medium">Administrator</div>
                              <div className="text-xs text-muted-foreground">
                                {getRoleDescription('admin')}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || signUpData.password !== signUpData.confirmPassword || !signUpData.role}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-4">
          <Button variant="link" className="text-white/80" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;