import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Calendar,
  Eye,
  Download,
  Plus,
  X,
  BookOpen,
  DollarSign,
  Award,
  FileCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

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
  employee_name?: string;
  month?: string;
}

interface DocumentManagementProps {
  user: User;
}

// Mock employees for document assignment
const mockEmployees = [
  { id: '1', name: 'John Doe', employeeId: 'EMP001' },
  { id: '2', name: 'Sarah Johnson', employeeId: 'EMP002' },
  { id: '3', name: 'Mike Chen', employeeId: 'EMP003' },
  { id: '4', name: 'Emily Davis', employeeId: 'EMP004' },
  { id: '5', name: 'James Wilson', employeeId: 'EMP005' },
];

// Mock documents data
const initialDocuments: Document[] = [
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
    id: '101',
    name: 'Offer Letter - John Doe',
    type: 'offer_letter',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2023-06-15',
    size: '245 KB',
    employee_id: '1',
    employee_name: 'John Doe',
  },
  {
    id: '102',
    name: 'Salary Revision Letter - John Doe',
    type: 'revision_letter',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-01-10',
    size: '180 KB',
    employee_id: '1',
    employee_name: 'John Doe',
  },
  {
    id: '103',
    name: 'Payslip - John Doe - October 2024',
    type: 'payslip',
    category: 'personal',
    uploaded_by: 'HR Department',
    uploaded_date: '2024-11-01',
    size: '125 KB',
    employee_id: '1',
    employee_name: 'John Doe',
    month: 'October 2024',
  },
];

export function DocumentManagement({ user }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'policy' as Document['type'],
    category: 'company' as 'company' | 'personal',
    employee_id: '',
    month: '',
    file: null as File | null,
  });

  const companyDocuments = documents.filter(doc => doc.category === 'company');
  const personalDocuments = documents.filter(doc => doc.category === 'personal');

  const filterDocuments = (docs: Document[]) => {
    return docs.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.employee_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredDocuments = () => {
    switch (activeTab) {
      case 'company':
        return filterDocuments(companyDocuments);
      case 'personal':
        return filterDocuments(personalDocuments);
      default:
        return filterDocuments(documents);
    }
  };

  const filteredDocuments = getFilteredDocuments();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: uploadData.name,
        type: uploadData.type,
        category: uploadData.category,
        uploaded_by: user.name,
        uploaded_date: new Date().toISOString(),
        size: uploadData.file ? `${(uploadData.file.size / 1024).toFixed(0)} KB` : '0 KB',
        employee_id: uploadData.category === 'personal' ? uploadData.employee_id : undefined,
        employee_name: uploadData.category === 'personal'
          ? mockEmployees.find(e => e.id === uploadData.employee_id)?.name
          : undefined,
        month: uploadData.type === 'payslip' ? uploadData.month : undefined,
      };

      setDocuments([newDocument, ...documents]);
      toast.success('Document uploaded successfully');
      setShowUploadDialog(false);
      setUploadData({
        name: '',
        type: 'policy',
        category: 'company',
        employee_id: '',
        month: '',
        file: null,
      });
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      toast.success('Document deleted successfully');
      setDocumentToDelete(null);
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Document Management</h1>
            <p className="text-muted-foreground">
              Upload and manage company policies and employee documents
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company Policies</p>
                <p className="text-2xl">{companyDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personal Documents</p>
                <p className="text-2xl">{personalDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl">{documents.length}</p>
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
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' && 'All Documents'}
                {activeTab === 'company' && 'Company Policies'}
                {activeTab === 'personal' && 'Personal Documents'}
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
                    {activeTab !== 'company' && <TableHead>Employee</TableHead>}
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
                      {activeTab !== 'company' && (
                        <TableCell>
                          {doc.employee_name || '-'}
                        </TableCell>
                      )}
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
                            onClick={() => alert(`Viewing: ${doc.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert(`Downloading: ${doc.name}`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocumentToDelete(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
                      : 'Upload your first document to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a company policy or employee document
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value: 'company' | 'personal') =>
                  setUploadData({ ...uploadData, category: value, employee_id: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company Policy</SelectItem>
                  <SelectItem value="personal">Personal Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Document Type *</Label>
              <Select
                value={uploadData.type}
                onValueChange={(value: Document['type']) =>
                  setUploadData({ ...uploadData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uploadData.category === 'company' ? (
                    <>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="payslip">Payslip</SelectItem>
                      <SelectItem value="offer_letter">Offer Letter</SelectItem>
                      <SelectItem value="revision_letter">Revision Letter</SelectItem>
                      <SelectItem value="appraisal">Appraisal</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {uploadData.category === 'personal' && (
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <Select
                  value={uploadData.employee_id}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uploadData.type === 'payslip' && uploadData.category === 'personal' && (
              <div>
                <Label htmlFor="month">Month & Year *</Label>
                <Input
                  id="month"
                  type="month"
                  value={uploadData.month}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, month: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={uploadData.name}
                onChange={(e) =>
                  setUploadData({ ...uploadData, name: e.target.value })
                }
                placeholder="e.g., Employee Handbook 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="file">File *</Label>
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
                >
                  <div className="text-center">
                    {uploadData.file ? (
                      <div>
                        <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">{uploadData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadData.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX (max. 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    required
                  />
                </label>
                {uploadData.file && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadData({ ...uploadData, file: null })}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove file
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !uploadData.file ||
                  !uploadData.name ||
                  (uploadData.category === 'personal' && !uploadData.employee_id)
                }
              >
                {isSubmitting ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
