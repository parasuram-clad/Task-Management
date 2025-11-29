import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  Building2,
  User as UserIcon,
  FileCheck,
  DollarSign,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Document {
  id: string;
  name: string;
  type: 'policy' | 'payslip' | 'offer_letter' | 'revision_letter' | 'appraisal' | 'certificate' | 'other';
  category: 'company' | 'personal';
  uploaded_by: string;
  uploaded_date: string;
  size: string;
  url?: string;
  employee_id?: string;
  month?: string; // For payslips
}

interface DocumentsListProps {
  user: User;
}

// Mock documents data
const mockDocuments: Document[] = [
  // Company Documents
  {
    id: '1',
    name: 'Employee Handbook 2024',
    type: 'policy',
    category: 'company',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-01-15',
    size: '2.5 MB',
  },
  {
    id: '2',
    name: 'Code of Conduct',
    type: 'policy',
    category: 'company',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-01-10',
    size: '1.8 MB',
  },
  {
    id: '3',
    name: 'Leave Policy',
    type: 'policy',
    category: 'company',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-02-01',
    size: '856 KB',
  },
  {
    id: '4',
    name: 'Work From Home Policy',
    type: 'policy',
    category: 'company',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-03-15',
    size: '720 KB',
  },
  {
    id: '5',
    name: 'Health & Safety Guidelines',
    type: 'policy',
    category: 'company',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-01-20',
    size: '1.2 MB',
  },
  // Personal Documents
  {
    id: '101',
    name: 'Offer Letter',
    type: 'offer_letter',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2023-06-15',
    size: '245 KB',
    employee_id: '1',
  },
  {
    id: '102',
    name: 'Salary Revision Letter',
    type: 'revision_letter',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-01-10',
    size: '180 KB',
    employee_id: '1',
  },
  {
    id: '103',
    name: 'Payslip - October 2024',
    type: 'payslip',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-11-01',
    size: '125 KB',
    employee_id: '1',
    month: 'October 2024',
  },
  {
    id: '104',
    name: 'Payslip - September 2024',
    type: 'payslip',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-10-01',
    size: '125 KB',
    employee_id: '1',
    month: 'September 2024',
  },
  {
    id: '105',
    name: 'Payslip - August 2024',
    type: 'payslip',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-09-01',
    size: '125 KB',
    employee_id: '1',
    month: 'August 2024',
  },
  {
    id: '106',
    name: 'Annual Appraisal 2024',
    type: 'appraisal',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-03-20',
    size: '320 KB',
    employee_id: '1',
  },
  {
    id: '107',
    name: 'Training Certificate - React Advanced',
    type: 'certificate',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-05-15',
    size: '450 KB',
    employee_id: '1',
  },
];

export function DocumentsList({ user }: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter documents based on user access
  const companyDocuments = mockDocuments.filter(doc => doc.category === 'company');
  const personalDocuments = mockDocuments.filter(
    doc => doc.category === 'personal' && doc.employee_id === user.id
  );

  const allDocuments = [...companyDocuments, ...personalDocuments];

  const filterDocuments = (docs: Document[]) => {
    return docs.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredDocuments = () => {
    switch (activeTab) {
      case 'company':
        return filterDocuments(companyDocuments);
      case 'personal':
        return filterDocuments(personalDocuments);
      case 'payslips':
        return filterDocuments(personalDocuments.filter(doc => doc.type === 'payslip'));
      default:
        return filterDocuments(allDocuments);
    }
  };

  const filteredDocuments = getFilteredDocuments();

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'policy':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'payslip':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'offer_letter':
      case 'revision_letter':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'appraisal':
        return <Award className="h-5 w-5 text-orange-600" />;
      case 'certificate':
        return <FileCheck className="h-5 w-5 text-indigo-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (type: Document['type']) => {
    const variants: Record<Document['type'], string> = {
      policy: 'bg-blue-100 text-blue-700',
      payslip: 'bg-green-100 text-green-700',
      offer_letter: 'bg-purple-100 text-purple-700',
      revision_letter: 'bg-purple-100 text-purple-700',
      appraisal: 'bg-orange-100 text-orange-700',
      certificate: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700',
    };

    const labels: Record<Document['type'], string> = {
      policy: 'Policy',
      payslip: 'Payslip',
      offer_letter: 'Offer Letter',
      revision_letter: 'Revision Letter',
      appraisal: 'Appraisal',
      certificate: 'Certificate',
      other: 'Other',
    };

    return (
      <Badge className={variants[type]} variant="secondary">
        {labels[type]}
      </Badge>
    );
  };

  const handleDownload = (doc: Document) => {
    // In a real app, this would download the actual file
    console.log('Downloading document:', doc.name);
    alert(`Downloading: ${doc.name}`);
  };

  const handleView = (doc: Document) => {
    // In a real app, this would open the document in a viewer
    console.log('Viewing document:', doc.name);
    alert(`Opening: ${doc.name}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Documents</h1>
        <p className="text-muted-foreground">
          Access your personal documents and company policies
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company Docs</p>
                <p className="text-2xl">{companyDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personal Docs</p>
                <p className="text-2xl">{personalDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payslips</p>
                <p className="text-2xl">
                  {personalDocuments.filter(doc => doc.type === 'payslip').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Docs</p>
                <p className="text-2xl">{allDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="company">Company Policies</TabsTrigger>
          <TabsTrigger value="personal">Personal Documents</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' && 'All Documents'}
                {activeTab === 'company' && 'Company Policies'}
                {activeTab === 'personal' && 'Personal Documents'}
                {activeTab === 'payslips' && 'Payslips'}
                {' '}({filteredDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.type)}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.month && (
                              <p className="text-sm text-muted-foreground">{doc.month}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDocumentTypeBadge(doc.type)}</TableCell>
                      <TableCell>
                        <Badge variant={doc.category === 'company' ? 'default' : 'secondary'}>
                          {doc.category === 'company' ? 'Company' : 'Personal'}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.uploaded_by}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(doc.uploaded_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(doc)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No documents found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Try adjusting your search'
                      : 'No documents available in this category'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
