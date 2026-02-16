import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type { Purchase, PurchaseItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils-data';
import { toast } from 'sonner';

export default function EditPurchase() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPurchaseById, updatePurchase } = useData();

    const [loading, setLoading] = useState(true);
    const [supplierName, setSupplierName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | 'CREDIT'>('CASH');
    const [amountPaid, setAmountPaid] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const loadPurchase = async () => {
            if (!id) return;
            try {
                const purchase = await getPurchaseById(id);
                setSupplierName(purchase.supplierName);
                setInvoiceNumber(purchase.invoiceNumber);
                setPurchaseDate(new Date(purchase.purchaseDate).toISOString().split('T')[0]);
                setItems(purchase.items || []);
                setPaymentMode(purchase.paymentMode as any);
                setAmountPaid(purchase.amountPaid.toString());
                setDueDate(purchase.dueDate ? new Date(purchase.dueDate).toISOString().split('T')[0] : '');
            } catch (error) {
                console.error('Error loading purchase:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPurchase();
    }, [id, getPurchaseById]);

    const addItem = () => {
        setItems([...items, { itemName: '', quantity: 1, price: 0, subtotal: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'price') {
            newItems[index].subtotal = (newItems[index].price || 0) * (newItems[index].quantity || 0);
        }

        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        const paid = parseFloat(amountPaid) || 0;
        const pending = totalAmount - paid;

        const purchase: Partial<Purchase> = {
            supplierName,
            invoiceNumber,
            purchaseDate,
            totalAmount,
            amountPaid: paid,
            amountPending: pending,
            paymentMode,
            dueDate: pending > 0 ? dueDate : '',
            items: items.filter(item => item.itemName),
            status: pending === 0 ? 'PAID' : pending < totalAmount ? 'PARTIAL' : 'PENDING',
        };

        try {
            await updatePurchase(id!, purchase);
            navigate('/purchases');
        } catch (error) {
            console.error('Error updating purchase:', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/purchases')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Purchase</h1>
                    <p className="text-gray-500 mt-1">Update purchase record and items</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="supplierName">Supplier Name *</Label>
                                <Input
                                    id="supplierName"
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                <Input
                                    id="invoiceNumber"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                                <Input
                                    id="purchaseDate"
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex-1 space-y-2">
                                    <Label>Item Name</Label>
                                    <Input
                                        value={item.itemName}
                                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                        placeholder="Enter item name"
                                    />
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
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
                            <p className="text-center text-gray-500 py-8">No items added yet</p>
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
                            <RadioGroup value={paymentMode} onValueChange={(value: 'CASH' | 'ONLINE' | 'CREDIT') => setPaymentMode(value)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="CASH" id="cash" />
                                    <Label htmlFor="cash">Cash</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ONLINE" id="online" />
                                    <Label htmlFor="online">Online</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="CREDIT" id="credit" />
                                    <Label htmlFor="credit">Credit (Pay Later)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amountPaid">Amount Paid</Label>
                            <Input
                                id="amountPaid"
                                type="number"
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                            />
                        </div>

                        {(() => {
                            const paid = parseFloat(amountPaid) || 0;
                            const pending = totalAmount - paid;

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
                    <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Update Purchase
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/purchases')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
