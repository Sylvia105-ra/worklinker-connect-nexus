-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'company', 'applicant');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create companies table for company/recruiter profiles
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applicant_profiles table for job seeker details
CREATE TABLE public.applicant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  resume_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  education TEXT,
  location TEXT,
  job_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  job_type TEXT, -- full-time, part-time, contract, etc.
  experience_level TEXT,
  salary_range TEXT,
  skills_required TEXT[],
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, closed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.applicant_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied', -- applied, shortlisted, selected, rejected
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view and edit their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Companies can manage their own profile" 
ON public.companies 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all companies" 
ON public.companies 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for applicant_profiles
CREATE POLICY "Applicants can manage their own profile" 
ON public.applicant_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Companies can view applicant profiles" 
ON public.applicant_profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'company'));

CREATE POLICY "Admins can view all applicant profiles" 
ON public.applicant_profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Companies can manage their own jobs" 
ON public.jobs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = jobs.company_id 
    AND companies.user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view approved jobs" 
ON public.jobs 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Admins can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for job_applications
CREATE POLICY "Applicants can manage their own applications" 
ON public.job_applications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.applicant_profiles 
    WHERE applicant_profiles.id = job_applications.applicant_id 
    AND applicant_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Companies can view applications for their jobs" 
ON public.job_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = job_applications.job_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Companies can update application status" 
ON public.job_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = job_applications.job_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all applications" 
ON public.job_applications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email)
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicant_profiles_updated_at
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();