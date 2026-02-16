import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, PackagePlus, Trash } from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function Products() {
  const navigate = useNavigate();
  const { products, updateProduct, addStockHistory, deleteProduct } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [stockToAdd, setStockToAdd] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const filteredProducts = products.filter(p =>
    p.isActive && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddStock = () => {
    console.log('47===>')
    const product = products.find(p => p.id === selectedProduct);
    console.log('49===>', product)
    if (!product || !stockToAdd) return;

    const quantity = parseInt(stockToAdd);
    console.log('49===>', quantity)
    if (isNaN(quantity) || quantity <= 0) return;

    updateProduct({
      ...product,
      stockQuantity: product.stockQuantity + quantity,
      updatedAt: new Date().toISOString(),
    });

    addStockHistory({
      id: Date.now().toString(),
      productId: product.id,
      quantityAdded: quantity,
      date: new Date().toISOString(),
      userId: user?.id || '',
      notes: stockNotes,
    });

    setSelectedProduct(null);
    setStockToAdd('');
    setStockNotes('');
  };

  const handleDeleteProduct = () => {
    if (!deleteProductId) return;

    deleteProduct(deleteProductId);

    setShowDeleteDialog(false);
    setDeleteProductId(null);
  };


  const handleExport = () => {
    const exportData = filteredProducts.map(p => ({
      Name: p.name,
      Make: p.make,
      Category: p.category,
      Stock: p.stockQuantity,
      'Unit Price': p.unitPrice,
      'Cost Price': p.costPrice,
      'MFG Date': formatDate(p.mfgDate),
      'EXP Date': formatDate(p.expDate),
    }));
    exportToCSV(exportData, 'products');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            Export
          </Button>
          <Button onClick={() => navigate('/products/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Make/Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>MFG Date</TableHead>
                <TableHead>EXP Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.make}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity <= 10 ? 'destructive' : 'default'}>
                        {product.stockQuantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                    <TableCell>{formatDate(product.mfgDate)}</TableCell>
                    <TableCell>{formatDate(product.expDate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProduct(product.id)}
                        >
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteProductId(product.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add quantity to existing product stock
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add notes"
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteProductId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}