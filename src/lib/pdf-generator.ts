import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale, Product } from './types';
import { formatCurrency, formatDateTime } from './utils-data';

export const generateInvoicePDF = (sale: Sale, products: Product[]) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES INVOICE', 105, 20, { align: 'center' });

  // Company Info (you can customize this)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Accounting System', 20, 35);
  doc.text('Admin Panel', 20, 40);

  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${sale.invoiceNumber}`, 20, 55);
  doc.text(`Date: ${formatDateTime(sale.createdAt)}`, 20, 60);
  doc.text(`Status: ${sale.status}`, 20, 65);

  // Customer Details
  doc.text('Bill To:', 120, 55);
  doc.text(sale.customerName, 120, 60);
  if (sale.customerMobile) {
    doc.text(`Mobile: ${sale.customerMobile}`, 120, 65);
  }
  if (sale.customerAddress) {
    doc.text(sale.customerAddress, 120, 70);
  }

  // Items Table
  const tableData = sale.items.map(item => [
    item.productName,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Product', 'Quantity', 'Price', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 85;
  
  doc.text(`Total Amount: ${formatCurrency(sale.totalAmount)}`, 140, finalY + 10);
  doc.text(`Amount Received: ${formatCurrency(sale.amountReceived)}`, 140, finalY + 15);
  doc.text(`Amount Pending: ${formatCurrency(sale.amountPending)}`, 140, finalY + 20);
  doc.text(`Payment Mode: ${sale.paymentMode}`, 140, finalY + 25);

  if (sale.paymentMode === 'MIXED') {
    doc.text(`  Cash: ${formatCurrency(sale.cashAmount || 0)}`, 140, finalY + 30);
    doc.text(`  Online: ${formatCurrency(sale.onlineAmount || 0)}`, 140, finalY + 35);
  }

  if (sale.amountPending > 0 && sale.dueDate) {
    doc.setTextColor(255, 0, 0);
    doc.text(`Due Date: ${formatDateTime(sale.dueDate)}`, 140, finalY + 40);
    doc.setTextColor(0, 0, 0);
  }

  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Save PDF
  doc.save(`invoice-${sale.invoiceNumber}.pdf`);
};