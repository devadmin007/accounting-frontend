import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type { Sale, SaleItem } from '@/lib/types';
import { generateInvoiceNumber, formatCurrency } from '@/lib/utils-data';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";


export default function CreateBill() {
  const navigate = useNavigate();
  const { products, addSale } = useData();
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | 'MIXED'>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const activeProducts = products.filter(p => p.isActive && p.stockQuantity > 0);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, price: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].price = product.unitPrice;
        newItems[index].subtotal = product.unitPrice * newItems[index].quantity;
      }
    }

    if (field === 'quantity' || field === 'price') {
      newItems[index].subtotal = newItems[index].price * newItems[index].quantity;
    }

    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one product');
      return;
    }

    let received = 0;
    if (paymentMode === 'MIXED') {
      received = (parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0);
    } else {
      received = parseFloat(amountReceived) || 0;
    }

    const pending = totalAmount - received;

    const sale: Sale = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber('INV'),
      customerName,
      customerMobile,
      customerAddress,
      totalAmount,
      amountReceived: received,
      amountPending: pending,
      paymentMode,
      cashAmount: paymentMode === 'MIXED' ? parseFloat(cashAmount) || 0 : undefined,
      onlineAmount: paymentMode === 'MIXED' ? parseFloat(onlineAmount) || 0 : undefined,
      dueDate: pending > 0 ? dueDate : '',
      items: items.filter(item => item.productId),
      createdAt: new Date().toISOString(),
      status: pending === 0 ? 'PAID' : pending < totalAmount ? 'PARTIAL' : 'PENDING',
    };

    addSale(sale);
    generateInvoicePDF(sale, products);
    navigate('/sales');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sales')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-gray-500 mt-1">Generate a sales invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerMobile">Mobile Number</Label>
                <Input
                  id="customerMobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Product</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !item.productId && "text-muted-foreground"
                        )}
                      >
                        {item.productId
                          ? products.find((product) => product.id === item.productId)?.name
                          : "Select product"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {activeProducts.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.name} ${product.id} ${product.stockQuantity}`}
                              onSelect={() => {
                                updateItem(index, "productId", product.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.id === item.productId
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.name} - Stock: {product.stockQuantity}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                </div>
                <div className="w-24 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Subtotal</Label>
                  <Input value={formatCurrency(item.subtotal)} disabled />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-center text-gray-500 py-8">No products added yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <RadioGroup value={paymentMode} onValueChange={(value: 'CASH' | 'ONLINE' | 'MIXED') => setPaymentMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ONLINE" id="online" />
                  <Label htmlFor="online">Online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MIXED" id="mixed" />
                  <Label htmlFor="mixed">Mixed (Cash + Online)</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMode === 'MIXED' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cashAmount">Cash Amount</Label>
                  <Input
                    id="cashAmount"
                    type="number"
                    step="0.01"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onlineAmount">Online Amount</Label>
                  <Input
                    id="onlineAmount"
                    type="number"
                    step="0.01"
                    value={onlineAmount}
                    onChange={(e) => setOnlineAmount(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="amountReceived">Amount Received</Label>
                <Input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                />
              </div>
            )}

            {(() => {
              const received = paymentMode === 'MIXED'
                ? (parseFloat(cashAmount) || 0) + (parseFloat(onlineAmount) || 0)
                : parseFloat(amountReceived) || 0;
              const pending = totalAmount - received;

              return pending > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <p className="text-sm text-orange-600">
                    Pending Amount: {formatCurrency(pending)}
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit">Generate Bill & Download PDF</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/sales')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}