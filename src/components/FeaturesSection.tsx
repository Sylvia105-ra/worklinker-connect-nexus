import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap,
  Users,
  Building
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Modern Hiring</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of recruitment with AI-powered matching, 
            seamless communication, and advanced analytics.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-primary" />}
            title="AI Job Matching"
            description="Smart algorithms connect the right talent with the perfect opportunities"
            delay="0ms"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-accent" />}
            title="Resume Parsing"
            description="Automated resume analysis powered by Affinda API for instant insights"
            delay="100ms"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-supervisor" />}
            title="Real-time Messaging"
            description="Direct communication between recruiters, candidates, and hiring managers"
            delay="200ms"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-company" />}
            title="Advanced Analytics"
            description="Comprehensive dashboards with hiring metrics and performance insights"
            delay="300ms"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-admin" />}
            title="Secure Authentication"
            description="Multi-factor authentication with OTP login via mobile and email"
            delay="400ms"
          />
          <FeatureCard
            icon={<Smartphone className="w-8 h-8 text-primary" />}
            title="Mobile App"
            description="Native iOS and Android apps with push notifications and offline access"
            delay="500ms"
          />
        </div>

        {/* Role-Based Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RoleFeatureCard
            icon={<Users className="w-12 h-12" />}
            title="For Job Seekers"
            features={[
              "Smart job recommendations",
              "One-click applications",
              "Interview scheduling",
              "Application tracking",
              "Salary insights"
            ]}
            buttonText="Start Job Search"
            buttonVariant="applicant"
          />
          <RoleFeatureCard
            icon={<Building className="w-12 h-12" />}
            title="For Companies"
            features={[
              "Employer branding tools",
              "Candidate screening",
              "Team collaboration",
              "Hiring analytics",
              "Integration support"
            ]}
            buttonText="Post Jobs"
            buttonVariant="company"
          />
          <RoleFeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="For Recruiters"
            features={[
              "Advanced search filters",
              "Bulk messaging",
              "Pipeline management",
              "Performance reports",
              "Client management"
            ]}
            buttonText="Start Recruiting"
            buttonVariant="supervisor"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <Card 
      className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-gradient-card"
      style={{ animationDelay: delay }}
    >
      <CardHeader>
        <div className="mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

interface RoleFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
  buttonText: string;
  buttonVariant: "applicant" | "company" | "supervisor";
}

const RoleFeatureCard = ({ icon, title, features, buttonText, buttonVariant }: RoleFeatureCardProps) => {
  return (
    <Card className="h-full bg-gradient-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
              {feature}
            </li>
          ))}
        </ul>
        <Button variant={buttonVariant} className="w-full mt-6">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeaturesSection;