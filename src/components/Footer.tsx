import { Button } from "@/components/ui/button";
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
              WorkLinker.com
            </h3>
            <p className="text-background/80 mb-6">
              Connecting talent with opportunity through innovative technology and smart matching.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-background hover:text-accent">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-accent">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-accent">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-accent">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#jobs" className="text-background/80 hover:text-accent transition-colors">Browse Jobs</a></li>
              <li><a href="#companies" className="text-background/80 hover:text-accent transition-colors">Companies</a></li>
              <li><a href="#about" className="text-background/80 hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-background/80 hover:text-accent transition-colors">Contact</a></li>
              <li><a href="#careers" className="text-background/80 hover:text-accent transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Users</h4>
            <ul className="space-y-2">
              <li><a href="#job-seekers" className="text-background/80 hover:text-accent transition-colors">Job Seekers</a></li>
              <li><a href="#employers" className="text-background/80 hover:text-accent transition-colors">Employers</a></li>
              <li><a href="#recruiters" className="text-background/80 hover:text-accent transition-colors">Recruiters</a></li>
              <li><a href="#help" className="text-background/80 hover:text-accent transition-colors">Help Center</a></li>
              <li><a href="#api" className="text-background/80 hover:text-accent transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-background/80">hello@worklinker.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-background/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-background/80">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-background/60 mb-4 md:mb-0">
              © 2024 WorkLinker.com. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#privacy" className="text-background/60 hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-background/60 hover:text-accent transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-background/60 hover:text-accent transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;