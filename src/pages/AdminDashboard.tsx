import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, FileText, DollarSign, AlertTriangle, Download } from "lucide-react";

const AdminDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0
  });

  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [user, loading]);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (company_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch users and their roles
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `);

      // Fetch companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (title),
          applicant_profiles!inner (
            profiles!inner (full_name)
          )
        `)
        .order('applied_at', { ascending: false });

      setJobs(jobsData || []);
      setUsers(usersData || []);
      setCompanies(companiesData || []);
      setApplications(applicationsData || []);

      setStats({
        totalUsers: usersData?.length || 0,
        totalCompanies: companiesData?.length || 0,
        totalJobs: jobsData?.length || 0,
        totalApplications: applicationsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Job ${status} successfully`,
      });
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const exportData = async (type: string) => {
    try {
      let data;
      let filename;
      
      switch (type) {
        case 'jobs':
          data = jobs;
          filename = 'jobs_export.csv';
          break;
        case 'users':
          data = users;
          filename = 'users_export.csv';
          break;
        case 'companies':
          data = companies;
          filename = 'companies_export.csv';
          break;
        case 'applications':
          data = applications;
          filename = 'applications_export.csv';
          break;
        default:
          return;
      }

      // Simple CSV export
      const csvContent = "data:text/csv;charset=utf-8," 
        + Object.keys(data[0] || {}).join(",") + "\n"
        + data.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `${type} data exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your job portal platform</p>
          </div>
          <Button 
            onClick={() => supabase.auth.signOut()}
            variant="outline"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="companies">Company Management</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Job Postings</CardTitle>
                    <CardDescription>Monitor and manage all job postings</CardDescription>
                  </div>
                  <Button onClick={() => exportData('jobs')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Jobs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job: any) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.companies?.company_name}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === 'approved' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="space-x-2">
                            {job.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateJobStatus(job.id, 'approved')}
                              >
                                Approve
                              </Button>
                            )}
                            {job.status !== 'rejected' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateJobStatus(job.id, 'rejected')}
                              >
                                Reject
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

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all users and their roles</CardDescription>
                  </div>
                  <Button onClick={() => exportData('users')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge>{user.user_roles?.[0]?.role || 'applicant'}</Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Company Management</CardTitle>
                    <CardDescription>Manage registered companies</CardDescription>
                  </div>
                  <Button onClick={() => exportData('companies')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Companies
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registered Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company: any) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.company_name}</TableCell>
                        <TableCell>{company.industry || 'N/A'}</TableCell>
                        <TableCell>{company.company_size || 'N/A'}</TableCell>
                        <TableCell>{company.city || 'N/A'}</TableCell>
                        <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate and export platform reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => exportData('jobs')} variant="outline" className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      Export Jobs Report
                    </div>
                  </Button>
                  <Button onClick={() => exportData('users')} variant="outline" className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      Export Users Report
                    </div>
                  </Button>
                  <Button onClick={() => exportData('companies')} variant="outline" className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      Export Companies Report
                    </div>
                  </Button>
                  <Button onClick={() => exportData('applications')} variant="outline" className="h-20">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      Export Applications Report
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;