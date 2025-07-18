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
import { Building, PlusCircle, Users, FileText, BarChart3, Edit, Trash2, Eye } from "lucide-react";

const CompanyDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    pendingApplications: 0
  });
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: ''
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_range: '',
    skills_required: ''
  });

  useEffect(() => {
    if (!loading && user) {
      fetchCompanyData();
    }
  }, [user, loading]);

  const fetchCompanyData = async () => {
    try {
      // Fetch company profile
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (companyData) {
        setCompany(companyData);
        setProfileForm(companyData);
        
        // Fetch jobs for this company
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        setJobs(jobsData || []);

        // Fetch applications for company jobs
        const { data: applicationsData } = await supabase
          .from('job_applications')
          .select(`
            *,
            jobs!inner (title, company_id),
            applicant_profiles!inner (
              profiles!inner (full_name, email)
            )
          `)
          .eq('jobs.company_id', companyData.id)
          .order('applied_at', { ascending: false });

        setApplications(applicationsData || []);

        // Calculate stats
        const activeJobs = jobsData?.filter(job => job.status === 'approved').length || 0;
        const pendingApplications = applicationsData?.filter(app => app.status === 'applied').length || 0;

        setStats({
          totalJobs: jobsData?.length || 0,
          totalApplications: applicationsData?.length || 0,
          activeJobs,
          pendingApplications
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company data",
        variant: "destructive",
      });
    }
  };

  const saveCompanyProfile = async () => {
    try {
      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(profileForm)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        // Create new company profile
        const { error } = await supabase
          .from('companies')
          .insert([{ ...profileForm, user_id: user?.id }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Company profile saved successfully",
      });
      
      setIsProfileDialogOpen(false);
      fetchCompanyData();
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive",
      });
    }
  };

  const saveJob = async () => {
    try {
      const jobData = {
        ...jobForm,
        company_id: company.id,
        skills_required: jobForm.skills_required.split(',').map(skill => skill.trim()).filter(Boolean),
        status: 'pending'
      };

      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Job ${editingJob ? 'updated' : 'created'} successfully`,
      });
      
      setIsJobDialogOpen(false);
      setEditingJob(null);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        job_type: '',
        experience_level: '',
        salary_range: '',
        skills_required: ''
      });
      fetchCompanyData();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      
      fetchCompanyData();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });
      
      fetchCompanyData();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const openEditJobDialog = (job: any) => {
    setEditingJob(job);
    setJobForm({
      ...job,
      skills_required: job.skills_required?.join(', ') || ''
    });
    setIsJobDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'company') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and applications</p>
          </div>
          <div className="space-x-2">
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  {company ? 'Edit Profile' : 'Create Profile'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Company Profile</DialogTitle>
                  <DialogDescription>
                    {company ? 'Update your company information' : 'Create your company profile'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={profileForm.industry}
                      onChange={(e) => setProfileForm({...profileForm, industry: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_size">Company Size</Label>
                    <Input
                      id="company_size"
                      value={profileForm.company_size}
                      onChange={(e) => setProfileForm({...profileForm, company_size: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={saveCompanyProfile} className="w-full">
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

        {!company ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>Welcome to VishwasJobPortal.com</CardTitle>
              <CardDescription>
                To get started, please create your company profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsProfileDialogOpen(true)}>
                <Building className="h-4 w-4 mr-2" />
                Create Company Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="jobs" className="space-y-4">
              <TabsList>
                <TabsTrigger value="jobs">Job Management</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Your Job Postings</CardTitle>
                        <CardDescription>Create and manage your job listings</CardDescription>
                      </div>
                      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Post New Job
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
                            <DialogDescription>
                              Fill in the job details below
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor="title">Job Title</Label>
                              <Input
                                id="title"
                                value={jobForm.title}
                                onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="description">Job Description</Label>
                              <Textarea
                                id="description"
                                value={jobForm.description}
                                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={jobForm.location}
                                onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="job_type">Job Type</Label>
                              <Input
                                id="job_type"
                                value={jobForm.job_type}
                                onChange={(e) => setJobForm({...jobForm, job_type: e.target.value})}
                                placeholder="Full-time, Part-time, Contract"
                              />
                            </div>
                            <div>
                              <Label htmlFor="experience_level">Experience Level</Label>
                              <Input
                                id="experience_level"
                                value={jobForm.experience_level}
                                onChange={(e) => setJobForm({...jobForm, experience_level: e.target.value})}
                                placeholder="Entry, Mid, Senior"
                              />
                            </div>
                            <div>
                              <Label htmlFor="salary_range">Salary Range</Label>
                              <Input
                                id="salary_range"
                                value={jobForm.salary_range}
                                onChange={(e) => setJobForm({...jobForm, salary_range: e.target.value})}
                                placeholder="e.g., $50,000 - $70,000"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="skills_required">Required Skills (comma separated)</Label>
                              <Input
                                id="skills_required"
                                value={jobForm.skills_required}
                                onChange={(e) => setJobForm({...jobForm, skills_required: e.target.value})}
                                placeholder="React, Node.js, Python"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="requirements">Requirements</Label>
                              <Textarea
                                id="requirements"
                                value={jobForm.requirements}
                                onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                              />
                            </div>
                          </div>
                          <Button onClick={saveJob} className="w-full">
                            {editingJob ? 'Update Job' : 'Post Job'}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applications</TableHead>
                          <TableHead>Posted Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job: any) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                              <Badge variant={job.status === 'approved' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {applications.filter(app => app.job_id === job.id).length}
                            </TableCell>
                            <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openEditJobDialog(job)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteJob(job.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Applications</CardTitle>
                    <CardDescription>Review and manage applications for your jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application: any) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">
                              {application.applicant_profiles?.profiles?.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {application.applicant_profiles?.profiles?.email || 'N/A'}
                            </TableCell>
                            <TableCell>{application.jobs?.title}</TableCell>
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
                            <TableCell>
                              <div className="space-x-1">
                                {application.status === 'applied' && (
                                  <>
                                    <Button 
                                      size="sm"
                                      onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                                    >
                                      Shortlist
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {application.status === 'shortlisted' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, 'selected')}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Performance Analytics</CardTitle>
                    <CardDescription>View insights about your job postings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Detailed analytics and reporting features will be available soon.
                      </p>
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

export default CompanyDashboard;