import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { formatCurrency, formatDateTime, exportToCSV, calculateOverdueDays } from '@/lib/utils-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Purchases() {
  const navigate = useNavigate();
  const { purchases } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExport = () => {
    const exportData = filteredPurchases.map(purchase => ({
      'Invoice Number': purchase.invoiceNumber,
      'Supplier Name': purchase.supplierName,
      'Total Amount': purchase.totalAmount,
      'Amount Paid': purchase.amountPaid,
      'Amount Pending': purchase.amountPending,
      'Payment Mode': purchase.paymentMode,
      'Status': purchase.status,
      'Purchase Date': formatDateTime(purchase.purchaseDate),
      'Due Date': purchase.dueDate ? formatDateTime(purchase.dueDate) : 'N/A',
    }));
    exportToCSV(exportData, 'purchases');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-500 mt-1">Manage raw material purchases and suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            Export
          </Button>
          <Button onClick={() => navigate('/purchases/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by supplier name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No purchase records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => {
                  const overdueDays = purchase.amountPending > 0 && purchase.dueDate 
                    ? calculateOverdueDays(purchase.dueDate) 
                    : 0;

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{formatCurrency(purchase.totalAmount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(purchase.amountPaid)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(purchase.amountPending)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.paymentMode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            purchase.status === 'PAID' ? 'default' :
                            purchase.status === 'PARTIAL' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(purchase.purchaseDate)}</TableCell>
                      <TableCell>
                        {purchase.dueDate ? formatDateTime(purchase.dueDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {overdueDays > 0 && (
                          <Badge variant="destructive">{overdueDays} days</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}