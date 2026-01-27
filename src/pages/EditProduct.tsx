import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    mfgDate: '',
    expDate: '',
    stockQuantity: '',
    make: '',
    description: '',
    unitPrice: '',
    costPrice: '',
    category: '',
    batchNumber: '',
    gstPercentage: '',
    notes: '',
  });

  useEffect(() => {
    const product = products.find(p => p.id === id);
    console.log("33===>", product)
    if (product) {
      setFormData({
        name: product.name,
        mfgDate: new Date(product.mfgDate).toISOString().split('T')[0],
        expDate: new Date(product.expDate).toISOString().split('T')[0],
        stockQuantity: product.stockQuantity.toString(),
        make: product.make,
        description: product.description,
        unitPrice: product.unitPrice.toString(),
        costPrice: product.costPrice.toString(),
        category: product.category,
        batchNumber: product.batchNumber,
        gstPercentage: product.gstPercentage.toString(),
        notes: product.notes,
      });
    }
  }, [id, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === id);
    if (!product) return;

    updateProduct({
      ...product,
      name: formData.name,
      mfgDate: formData.mfgDate,
      expDate: formData.expDate,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      make: formData.make,
      description: formData.description,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      category: formData.category,
      batchNumber: formData.batchNumber,
      gstPercentage: parseFloat(formData.gstPercentage) || 0,
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
    });

    navigate('/products');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make/Brand *</Label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (MRP) *</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstPercentage">GST Percentage</Label>
                <Input
                  id="gstPercentage"
                  name="gstPercentage"
                  type="number"
                  step="0.01"
                  value={formData.gstPercentage}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfgDate">Manufacturing Date *</Label>
                <Input
                  id="mfgDate"
                  name="mfgDate"
                  type="date"
                  value={formData.mfgDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expDate">Expiry Date *</Label>
                <Input
                  id="expDate"
                  name="expDate"
                  type="date"
                  value={formData.expDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Product</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}