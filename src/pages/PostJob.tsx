import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Building, MapPin, DollarSign, Clock, Users, FileText, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  qualifications: string;
  salaryMin: string;
  salaryMax: string;
  benefits: string;
  applicationDeadline: Date | undefined;
  isPublic: boolean;
  contactEmail: string;
  department: string;
  remoteOptions: string;
}

const PostJob = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    location: "",
    type: "",
    experience: "",
    description: "",
    qualifications: "",
    salaryMin: "",
    salaryMax: "",
    benefits: "",
    applicationDeadline: undefined,
    isPublic: true,
    contactEmail: "",
    department: "",
    remoteOptions: ""
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field: keyof JobFormData, value: string | boolean | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.company || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    // Simulate job posting
    toast({
      title: "Job Posted Successfully!",
      description: `${formData.title} has been posted and is now ${formData.isPublic ? 'publicly' : 'privately'} visible.`,
    });

    // Reset form
    setFormData({
      title: "",
      company: "",
      location: "",
      type: "",
      experience: "",
      description: "",
      qualifications: "",
      salaryMin: "",
      salaryMax: "",
      benefits: "",
      applicationDeadline: undefined,
      isPublic: true,
      contactEmail: "",
      department: "",
      remoteOptions: ""
    });
  };

  const JobPreview = () => (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">{formData.title || "Job Title"}</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                <span>{formData.company || "Company Name"}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{formData.location || "Location"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Posted just now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData.isPublic ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {formData.type && <Badge variant="outline">{formData.type}</Badge>}
            {formData.experience && <Badge variant="outline">{formData.experience}</Badge>}
            {formData.remoteOptions && <Badge variant="outline">{formData.remoteOptions}</Badge>}
            {(formData.salaryMin || formData.salaryMax) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formData.salaryMin && formData.salaryMax 
                  ? `$${formData.salaryMin} - $${formData.salaryMax}`
                  : formData.salaryMin 
                    ? `From $${formData.salaryMin}`
                    : `Up to $${formData.salaryMax}`
                }
              </Badge>
            )}
          </div>

          {formData.description && (
            <div>
              <h4 className="font-semibold mb-2">Job Description</h4>
              <p className="text-foreground/80 whitespace-pre-wrap">{formData.description}</p>
            </div>
          )}

          {formData.qualifications && (
            <div>
              <h4 className="font-semibold mb-2">Required Qualifications</h4>
              <p className="text-foreground/80 whitespace-pre-wrap">{formData.qualifications}</p>
            </div>
          )}

          {formData.benefits && (
            <div>
              <h4 className="font-semibold mb-2">Benefits</h4>
              <p className="text-foreground/80 whitespace-pre-wrap">{formData.benefits}</p>
            </div>
          )}

          {formData.applicationDeadline && (
            <div>
              <h4 className="font-semibold mb-2">Application Deadline</h4>
              <p className="text-foreground/80">{format(formData.applicationDeadline, "PPP")}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1">Apply Now</Button>
            <Button variant="outline">Save Job</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Post a Job</h1>
          <p className="text-white/90 text-lg">Find the perfect candidate for your team</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Job Details
              </CardTitle>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant={!isPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreview(false)}
                >
                  Edit
                </Button>
                <Button
                  variant={isPreview ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreview(true)}
                >
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isPreview ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Senior Frontend Developer"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        placeholder="e.g. TechCorp Inc."
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g. Engineering"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Job Type</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="experience">Experience Level</Label>
                        <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry level">Entry level</SelectItem>
                            <SelectItem value="2+ years">2+ years</SelectItem>
                            <SelectItem value="3+ years">3+ years</SelectItem>
                            <SelectItem value="4+ years">4+ years</SelectItem>
                            <SelectItem value="5+ years">5+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="remote">Remote Options</Label>
                      <Select value={formData.remoteOptions} onValueChange={(value) => handleInputChange("remoteOptions", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select remote options" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Compensation</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaryMin">Minimum Salary</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          placeholder="50000"
                          value={formData.salaryMin}
                          onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryMax">Maximum Salary</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          placeholder="80000"
                          value={formData.salaryMax}
                          onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  {/* Qualifications */}
                  <div>
                    <Label htmlFor="qualifications">Required Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      placeholder="List the required skills, experience, and qualifications..."
                      value={formData.qualifications}
                      onChange={(e) => handleInputChange("qualifications", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Benefits */}
                  <div>
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      placeholder="Health insurance, 401k, flexible hours, etc..."
                      value={formData.benefits}
                      onChange={(e) => handleInputChange("benefits", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Application Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Application Details</h3>
                    
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="hr@company.com"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.applicationDeadline && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.applicationDeadline ? format(formData.applicationDeadline, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.applicationDeadline}
                            onSelect={(date) => handleInputChange("applicationDeadline", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="visibility"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                      />
                      <Label htmlFor="visibility">
                        Make this job posting public
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Post Job
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how your job posting will appear to candidates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {isPreview && (
            <div className="lg:sticky lg:top-8">
              <JobPreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;