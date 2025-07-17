import { Button } from "@/components/ui/button";
import { Search, Users, Building, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleFindJob = () => {
    navigate("/jobs");
  };

  const handlePostJob = () => {
    navigate("/post-job");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional team collaboration"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Connect Talent with
            <span className="block bg-gradient-to-r from-accent-light to-warning bg-clip-text text-transparent">
              Opportunity
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            VishwasJobPortal.com is the modern job portal that brings together top talent, 
            innovative companies, and smart recruiting tools in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="accent" size="lg" className="text-lg px-8 py-6" onClick={handleFindJob}>
              <Search className="mr-2" />
              Find Your Dream Job
            </Button>
            <Button variant="hero" size="lg" className="text-lg px-8 py-6 bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={handlePostJob}>
              <Building className="mr-2" />
              Post a Job
            </Button>
          </div>

          {/* User Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <UserRoleCard
              icon={<Users className="w-8 h-8" />}
              title="Job Seekers"
              description="Find your perfect role with AI-powered matching"
              color="applicant"
            />
            <UserRoleCard
              icon={<Building className="w-8 h-8" />}
              title="Companies"
              description="Build your dream team with smart recruiting"
              color="company"
            />
            <UserRoleCard
              icon={<Search className="w-8 h-8" />}
              title="Recruiters"
              description="Streamline hiring with advanced tools"
              color="supervisor"
            />
            <UserRoleCard
              icon={<Shield className="w-8 h-8" />}
              title="Admins"
              description="Manage platform with powerful analytics"
              color="admin"
            />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-warning/20 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
    </section>
  );
};

interface UserRoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "applicant" | "company" | "supervisor" | "admin";
}

const UserRoleCard = ({ icon, title, description, color }: UserRoleCardProps) => {
  const colorClasses = {
    applicant: "border-applicant/30 hover:border-applicant text-applicant",
    company: "border-company/30 hover:border-company text-company",
    supervisor: "border-supervisor/30 hover:border-supervisor text-supervisor",
    admin: "border-admin/30 hover:border-admin text-admin"
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 ${colorClasses[color]} transition-all duration-300 hover:scale-105 hover:shadow-glow`}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </div>
  );
};

export default HeroSection;