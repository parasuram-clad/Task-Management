import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Trash2, Save, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CreateInvoiceProps {
  user: User;
  navigateTo: (page: string) => void;
}

export function CreateInvoice({ user, navigateTo }: CreateInvoiceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    project_id: '',
    invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_terms: '30',
    tax_rate: '18',
    notes: '',
    terms_conditions: 'Payment is due within 30 days. Late payments may incur additional charges.',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ]);

  const calculateDueDate = (paymentTerms: string) => {
    const issueDate = new Date(invoiceData.issue_date);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + parseInt(paymentTerms));
    return dueDate.toISOString().split('T')[0];
  };

  const handlePaymentTermsChange = (terms: string) => {
    setInvoiceData({
      ...invoiceData,
      payment_terms: terms,
      due_date: calculateDueDate(terms),
    });
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * parseFloat(invoiceData.tax_rate)) / 100;
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Invoice saved as draft');
      navigateTo('invoices');
    } catch (error) {
      toast.error('Failed to save invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoiceData.client_name || !invoiceData.client_email) {
      toast.error('Please fill in client details');
      return;
    }

    if (items.some(item => !item.description || item.rate === 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Invoice sent successfully');
      navigateTo('invoices');
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('invoices')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <h1 className="text-3xl mb-2">Create Invoice</h1>
        <p className="text-muted-foreground">
          Generate a new invoice for your client
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={invoiceData.invoice_number}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, invoice_number: e.target.value })
                    }
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select
                    value={invoiceData.project_id}
                    onValueChange={(value) =>
                      setInvoiceData({ ...invoiceData, project_id: value })
                    }
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proj-1">Website Redesign</SelectItem>
                      <SelectItem value="proj-2">Mobile App</SelectItem>
                      <SelectItem value="proj-3">System Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={invoiceData.issue_date}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, issue_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select
                    value={invoiceData.payment_terms}
                    onValueChange={handlePaymentTermsChange}
                  >
                    <SelectTrigger id="payment_terms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due on Receipt</SelectItem>
                      <SelectItem value="15">Net 15</SelectItem>
                      <SelectItem value="30">Net 30</SelectItem>
                      <SelectItem value="45">Net 45</SelectItem>
                      <SelectItem value="60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, due_date: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={invoiceData.client_name}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, client_name: e.target.value })
                  }
                  placeholder="Client or Company Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client_email">Email Address *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={invoiceData.client_email}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, client_email: e.target.value })
                  }
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client_address">Address</Label>
                <Textarea
                  id="client_address"
                  value={invoiceData.client_address}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, client_address: e.target.value })
                  }
                  placeholder="Client's billing address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="space-y-3">
                    {index > 0 && <Separator />}
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <Label htmlFor={`description-${item.id}`}>Description</Label>
                        <Input
                          id={`description-${item.id}`}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, 'description', e.target.value)
                          }
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, 'quantity', parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                        <Input
                          id={`rate-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(item.id, 'rate', parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <div className="col-span-2 flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Amount</Label>
                          <Input
                            value={formatCurrency(item.amount)}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, notes: e.target.value })
                  }
                  placeholder="Any additional notes or information"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={invoiceData.terms_conditions}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, terms_conditions: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tax</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceData.tax_rate}
                      onChange={(e) =>
                        setInvoiceData({ ...invoiceData, tax_rate: e.target.value })
                      }
                      className="w-16 h-7 text-xs"
                    />
                    <span className="text-xs">%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  onClick={handleSendInvoice}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Invoice'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
