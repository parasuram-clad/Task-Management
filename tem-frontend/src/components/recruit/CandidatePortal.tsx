import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, MapPin, Briefcase, Clock, DollarSign, Building2, Send } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  experience: string;
  salaryRange: string;
  postedDate: string;
  applicants: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

const mockJobs: JobListing[] = [
  {
    id: 'JOB-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    experience: '5+ years',
    salaryRange: '$120,000 - $150,000',
    postedDate: '2024-11-15',
    applicants: 24,
    description: 'We are looking for an experienced Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications.',
    requirements: [
      '5+ years of professional software development experience',
      'Strong proficiency in React and TypeScript',
      'Experience with Node.js and RESTful APIs',
      'Knowledge of AWS services and cloud architecture',
      'Excellent problem-solving and communication skills'
    ],
    responsibilities: [
      'Design and develop high-quality, scalable software solutions',
      'Collaborate with product managers and designers',
      'Mentor junior developers and conduct code reviews',
      'Participate in architectural decisions',
      'Write clean, maintainable, and well-documented code'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      '401(k) matching',
      'Professional development budget',
      'Unlimited PTO'
    ]
  },
  {
    id: 'JOB-002',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 years',
    salaryRange: '$90,000 - $120,000',
    postedDate: '2024-11-18',
    applicants: 15,
    description: 'Join our design team to create beautiful, user-friendly interfaces for our products. You will work closely with product managers and engineers to deliver exceptional user experiences.',
    requirements: [
      '3-5 years of product design experience',
      'Proficiency in Figma and design systems',
      'Strong portfolio demonstrating UX/UI skills',
      'Experience with user research and testing',
      'Excellent communication skills'
    ],
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with engineers on implementation',
      'Maintain and evolve the design system',
      'Present designs to stakeholders'
    ],
    benefits: [
      'Remote-first culture',
      'Competitive compensation',
      'Health benefits',
      'Home office stipend',
      'Annual design conference budget'
    ]
  },
  {
    id: 'JOB-003',
    title: 'Marketing Intern',
    department: 'Marketing',
    location: 'New York, NY',
    type: 'Intern',
    experience: 'Student/Fresh Graduate',
    salaryRange: '$15,000 - $20,000',
    postedDate: '2024-11-10',
    applicants: 42,
    description: 'Summer internship opportunity for passionate marketing students. Gain hands-on experience in digital marketing, content creation, and campaign management.',
    requirements: [
      'Currently pursuing degree in Marketing or related field',
      'Strong writing and communication skills',
      'Familiarity with social media platforms',
      'Creative mindset and attention to detail',
      'Basic knowledge of analytics tools'
    ],
    responsibilities: [
      'Assist in creating social media content',
      'Support email marketing campaigns',
      'Conduct market research and competitive analysis',
      'Help organize marketing events',
      'Learn from experienced marketing professionals'
    ],
    benefits: [
      'Mentorship program',
      'Networking opportunities',
      'Letter of recommendation',
      'Potential for full-time conversion',
      'Free lunch and snacks'
    ]
  },
  {
    id: 'JOB-004',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Austin, TX',
    type: 'Full-time',
    experience: '2-4 years',
    salaryRange: '$75,000 - $95,000',
    postedDate: '2024-11-12',
    applicants: 31,
    description: 'We are seeking a Data Analyst to help us make data-driven decisions. You will analyze complex datasets, create visualizations, and provide actionable insights.',
    requirements: [
      '2-4 years of data analysis experience',
      'Proficiency in SQL and Python',
      'Experience with data visualization tools (Tableau, Power BI)',
      'Strong statistical analysis skills',
      'Excellent presentation skills'
    ],
    responsibilities: [
      'Analyze large datasets to identify trends and patterns',
      'Create dashboards and reports for stakeholders',
      'Collaborate with teams to define KPIs',
      'Perform A/B testing and statistical analysis',
      'Present findings to leadership'
    ],
    benefits: [
      'Competitive salary',
      'Health and wellness benefits',
      'Professional development opportunities',
      'Flexible schedule',
      'Modern office in Austin'
    ]
  }
];

export function CandidatePortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || job.location.includes(selectedLocation);
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesLocation && matchesType;
  });

  const handleApply = (jobId: string) => {
    // This would open an application form
    alert(`Application form for ${jobId} would open here`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <h1 className="text-5xl">Join Our Team</h1>
            <p className="text-xl text-blue-100">Find your dream job and make an impact</p>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>500+ Employees</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>10+ Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{mockJobs.length} Open Positions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">All Locations</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="Austin">Austin</option>
                <option value="Remote">Remote</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Cards */}
          <div className="lg:col-span-1 space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">{job.type}</Badge>
                  </div>
                  <CardDescription>{job.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.experience}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {job.salaryRange}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    {job.applicants} applicants
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">{selectedJob.title}</CardTitle>
                      <CardDescription className="text-base">
                        {selectedJob.department} • {selectedJob.location}
                      </CardDescription>
                      <div className="flex gap-2 mt-4">
                        <Badge className="bg-blue-100 text-blue-700">{selectedJob.type}</Badge>
                        <Badge variant="outline">{selectedJob.experience}</Badge>
                        <Badge variant="outline">{selectedJob.salaryRange}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                      <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">About the Role</h3>
                        <p className="text-muted-foreground">{selectedJob.description}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="requirements" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {selectedJob.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span className="text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="responsibilities" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Responsibilities</h3>
                        <ul className="space-y-2">
                          {selectedJob.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span className="text-muted-foreground">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="benefits" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Benefits</h3>
                        <ul className="space-y-2">
                          {selectedJob.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="text-muted-foreground">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 pt-6 border-t">
                    <Button size="lg" className="w-full" onClick={() => handleApply(selectedJob.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Apply for this position
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      By applying, you agree to our terms and privacy policy
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a job to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Company Name. All rights reserved.</p>
          <p className="mt-2">Questions? Contact us at careers@company.com</p>
        </div>
      </div>
    </div>
  );
}
