import React from "react";
import { useNavigate } from "react-router-dom";
import { jobs, companies, applications, billings, } from "@/dummyData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
};

const AdminDashboard = () => {
  const [tab, setTab] = React.useState("jobs");
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate("/jobs")}>Find Your Dream Job</Button>
      </div>
      <Tabs defaultValue="jobs" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Button onClick={() => exportToExcel(jobs, "jobs.xlsx")} className="mb-2">
            <Download className="h-4 w-4 mr-2" /> Export Jobs (Excel)
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>{companies.find((c) => c.id === job.companyId)?.name}</TableCell>
                  <TableCell>{job.views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Users Tab */}
        <TabsContent value="users">
          {/* <Button onClick={() => exportToExcel(users, "users.xlsx")} className="mb-2">
            <Download className="h-4 w-4 mr-2" /> Export Users (Excel)
          </Button> */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Billing Tab */}
        <TabsContent value="billing">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{companies.find((c) => c.id === b.companyId)?.name}</TableCell>
                  <TableCell>${b.amount}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Moderation Tab */}
        <TabsContent value="moderation">
          <h2 className="font-bold mb-2">Flagged Jobs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {flaggedJobs.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{jobs.find((j) => j.id === f.jobId)?.title}</TableCell>
                  <TableCell>{f.reason}</TableCell>
                  <TableCell>{f.date}</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
          <h2 className="font-bold mt-4 mb-2">Flagged Users</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {flaggedUsers.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{users.find((u) => u.id === f.userId)?.fullName}</TableCell>
                  <TableCell>{f.reason}</TableCell>
                  <TableCell>{f.date}</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="p-4">
            <h2 className="font-bold mb-2">MIS Reports & Analytics</h2>
            <p>Dummy analytics: Total Jobs: {jobs.length}, Total Users: {users.length}, Total Applications: {applications.length}</p>
            {/* Add chart components here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;