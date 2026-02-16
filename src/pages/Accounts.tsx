import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Accounts() {
  const { sales, purchases } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const customerOutstanding = useMemo(() => {
    return sales
      .filter(sale => Number(sale.amountPending) > 0)
      .map(sale => ({
        id: sale.id,
        name: sale.customerName,
        mobile: sale.customerMobile,
        invoiceNumber: sale.invoiceNumber,
        totalAmount: Number(sale.totalAmount || 0),
        amountReceived: Number(sale.amountReceived || 0),
        amountPending: Number(sale.amountPending || 0),
        dueDate: sale.dueDate,
        createdAt: sale.createdAt,
        status: sale.status,
        type: 'customer' as const,
      }));
  }, [sales]);

  const supplierOutstanding = useMemo(() => {
    return purchases
      .filter(purchase => Number(purchase.amountPending) > 0)
      .map(purchase => ({
        id: purchase.id,
        name: purchase.supplierName,
        invoiceNumber: purchase.invoiceNumber,
        totalAmount: Number(purchase.totalAmount || 0),
        amountPaid: Number(purchase.amountPaid || 0),
        amountPending: Number(purchase.amountPending || 0),
        dueDate: purchase.dueDate,
        createdAt: purchase.createdAt,
        status: purchase.status,
        type: 'supplier' as const,
      }));
  }, [purchases]);

  const filteredCustomers = customerOutstanding.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSuppliers = supplierOutstanding.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomerOutstanding = customerOutstanding.reduce((sum, item) => sum + item.amountPending, 0);
  const totalSupplierOutstanding = supplierOutstanding.reduce((sum, item) => sum + item.amountPending, 0);

  const handleExportCustomers = () => {
    const exportData = filteredCustomers.map(item => ({
      'Invoice Number': item.invoiceNumber,
      'Customer Name': item.name,
      'Mobile': item.mobile,
      'Total Amount': item.totalAmount,
      'Amount Received': item.amountReceived,
      'Amount Pending': item.amountPending,
      'Due Date': item.dueDate ? formatDateTime(item.dueDate) : 'N/A',
      'Status': item.status,
    }));
    exportToCSV(exportData, 'customer-outstanding');
  };

  const handleExportSuppliers = () => {
    const exportData = filteredSuppliers.map(item => ({
      'Invoice Number': item.invoiceNumber,
      'Supplier Name': item.name,
      'Total Amount': item.totalAmount,
      'Amount Paid': item.amountPaid,
      'Amount Pending': item.amountPending,
      'Due Date': item.dueDate ? formatDateTime(item.dueDate) : 'N/A',
      'Status': item.status,
    }));
    exportToCSV(exportData, 'supplier-outstanding');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <p className="text-gray-500 mt-1">Track customer and supplier outstanding payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customer Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCustomerOutstanding)}</div>
            <p className="text-xs text-gray-500 mt-1">{customerOutstanding.length} pending invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Supplier Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSupplierOutstanding)}</div>
            <p className="text-xs text-gray-500 mt-1">{supplierOutstanding.length} pending payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customer Outstanding</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
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
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportCustomers}>
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No outstanding payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((item) => {
                      const overdueDays = item.dueDate ? calculateOverdueDays(item.dueDate) : 0;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.mobile}</TableCell>
                          <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(item.amountReceived)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{formatCurrency(item.amountPending)}</TableCell>
                          <TableCell>{item.dueDate ? formatDateTime(item.dueDate) : '-'}</TableCell>
                          <TableCell>
                            {overdueDays > 0 && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {overdueDays} days
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers..."
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
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportSuppliers}>
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        No outstanding payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((item) => {
                      const overdueDays = item.dueDate ? calculateOverdueDays(item.dueDate) : 0;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(item.amountPaid)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{formatCurrency(item.amountPending)}</TableCell>
                          <TableCell>{item.dueDate ? formatDateTime(item.dueDate) : '-'}</TableCell>
                          <TableCell>
                            {overdueDays > 0 && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {overdueDays} days
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}