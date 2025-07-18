import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Search, FileText, Briefcase, Bell, Edit } from "lucide-react";

const ApplicantDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlisted: 0,
    selected: 0
  });
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [profileForm, setProfileForm] = useState({
    bio: '',
    skills: '',
    experience_years: '',
    education: '',
    location: '',
    resume_url: '',
    job_preferences: ''
  });

  useEffect(() => {
    if (!loading && user) {
      fetchApplicantData();
    }
  }, [user, loading]);

  const fetchApplicantData = async () => {
    try {
      // Fetch applicant profile
      const { data: profileData } = await supabase
        .from('applicant_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          ...profileData,
          skills: profileData.skills?.join(', ') || '',
          experience_years: profileData.experience_years?.toString() || '',
          job_preferences: JSON.stringify(profileData.job_preferences || {})
        });

        // Fetch user applications
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select(`
            *,
            jobs!inner (
              title,
              location,
              company_id,
              companies!inner (company_name)
            )
          `)
          .eq('applicant_id', profileData.id)
          .order('applied_at', { ascending: false });

        setApplications(applicationsData || []);

        // Calculate stats
        const totalApplications = applicationsData?.length || 0;
        const pendingApplications = applicationsData?.filter(app => app.status === 'applied').length || 0;
        const shortlisted = applicationsData?.filter(app => app.status === 'shortlisted').length || 0;
        const selected = applicationsData?.filter(app => app.status === 'selected').length || 0;

        setStats({
          totalApplications,
          pendingApplications,
          shortlisted,
          selected
        });
      }

      // Fetch available jobs
      let jobsQuery = supabase
        .from('jobs')
        .select(`
          *,
          companies!inner (company_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        jobsQuery = jobsQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (locationFilter) {
        jobsQuery = jobsQuery.ilike('location', `%${locationFilter}%`);
      }

      const { data: jobsData } = await jobsQuery;
      setJobs(jobsData || []);

      // Get job recommendations based on user skills
      if (profileData?.skills?.length > 0) {
        const { data: recommendationsData } = await supabase
          .from('jobs')
          .select(`
            *,
            companies!inner (company_name)
          `)
          .eq('status', 'approved')
          .overlaps('skills_required', profileData.skills)
          .limit(5);

        setRecommendations(recommendationsData || []);
      }
    } catch (error) {
      console.error('Error fetching applicant data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    }
  };

  const saveProfile = async () => {
    try {
      const profileData = {
        ...profileForm,
        user_id: user?.id,
        skills: profileForm.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        experience_years: parseInt(profileForm.experience_years) || 0,
        job_preferences: profileForm.job_preferences ? JSON.parse(profileForm.job_preferences) : {}
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('applicant_profiles')
          .update(profileData)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('applicant_profiles')
          .insert([profileData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Profile saved successfully",
      });
      
      setIsProfileDialogOpen(false);
      fetchApplicantData();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const applyForJob = async (jobId: string) => {
    try {
      if (!profile) {
        toast({
          title: "Profile Required",
          description: "Please create your profile before applying for jobs",
          variant: "destructive",
        });
        return;
      }

      // Check if already applied
      const existingApplication = applications.find(app => app.job_id === jobId);
      if (existingApplication) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('job_applications')
        .insert([{
          job_id: jobId,
          applicant_id: profile.id,
          status: 'applied'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      
      fetchApplicantData();
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'applicant') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Job Seeker Dashboard</h1>
            <p className="text-muted-foreground">Find and apply for your dream job</p>
          </div>
          <div className="space-x-2">
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Your Profile</DialogTitle>
                  <DialogDescription>
                    {profile ? 'Update your profile information' : 'Create your profile to start applying for jobs'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
                      placeholder="React, Node.js, Python, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={profileForm.experience_years}
                      onChange={(e) => setProfileForm({...profileForm, experience_years: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                      placeholder="Degree, University, Year"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="resume_url">Resume URL</Label>
                    <Input
                      id="resume_url"
                      value={profileForm.resume_url}
                      onChange={(e) => setProfileForm({...profileForm, resume_url: e.target.value})}
                      placeholder="Link to your resume"
                    />
                  </div>
                </div>
                <Button onClick={saveProfile} className="w-full">
                  Save Profile
                </Button>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => supabase.auth.signOut()}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {!profile ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>Welcome to VishwasJobPortal.com</CardTitle>
              <CardDescription>
                To get started, please create your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsProfileDialogOpen(true)}>
                <User className="h-4 w-4 mr-2" />
                Create Your Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.shortlisted}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Selected</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.selected}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="jobs" className="space-y-4">
              <TabsList>
                <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Available Jobs</CardTitle>
                        <CardDescription>Search and apply for jobs</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64"
                        />
                        <Input
                          placeholder="Location..."
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="w-32"
                        />
                        <Button onClick={fetchApplicantData}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobs.map((job: any) => (
                        <Card key={job.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <p className="text-muted-foreground">{job.companies?.company_name}</p>
                              <p className="text-sm text-muted-foreground">{job.location}</p>
                              <p className="mt-2 text-sm">{job.description?.substring(0, 150)}...</p>
                              {job.skills_required && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {job.skills_required.slice(0, 5).map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Button
                                onClick={() => applyForJob(job.id)}
                                disabled={hasApplied(job.id)}
                                variant={hasApplied(job.id) ? "secondary" : "default"}
                              >
                                {hasApplied(job.id) ? 'Applied' : 'Apply Now'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                    <CardDescription>Track the status of your job applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application: any) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">{application.jobs?.title}</TableCell>
                            <TableCell>{application.jobs?.companies?.company_name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                application.status === 'selected' ? 'default' :
                                application.status === 'shortlisted' ? 'secondary' :
                                application.status === 'rejected' ? 'destructive' : 'outline'
                              }>
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Recommendations</CardTitle>
                    <CardDescription>Jobs that match your skills and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.map((job: any) => (
                        <Card key={job.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <p className="text-muted-foreground">{job.companies?.company_name}</p>
                              <p className="text-sm text-muted-foreground">{job.location}</p>
                              <p className="mt-2 text-sm">{job.description?.substring(0, 150)}...</p>
                              {job.skills_required && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {job.skills_required.slice(0, 5).map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Button
                                onClick={() => applyForJob(job.id)}
                                disabled={hasApplied(job.id)}
                                variant={hasApplied(job.id) ? "secondary" : "default"}
                              >
                                {hasApplied(job.id) ? 'Applied' : 'Apply Now'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {recommendations.length === 0 && (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                          <p className="text-muted-foreground">
                            Update your skills in your profile to get personalized job recommendations.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;