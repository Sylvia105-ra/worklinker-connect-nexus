import { jobs, companies } from "@/dummyData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const JobSearch = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">All Company Job Openings</h1>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Posted Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell>{job.title}</TableCell>
            <TableCell>{companies.find((c) => c.id === job.companyId)?.name}</TableCell>
            <TableCell>{job.location}</TableCell>
            <TableCell>{job.status}</TableCell>
            <TableCell>{job.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default JobSearch;