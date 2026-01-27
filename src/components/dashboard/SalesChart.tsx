import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfDay } from 'date-fns';
import type { Sale, DateRange } from '@/lib/types';
import { isDateInRange } from '@/lib/utils-data';

interface SalesChartProps {
  sales: Sale[];
  dateRange: DateRange;
}

export default function SalesChart({ sales, dateRange }: SalesChartProps) {
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const daySales = sales.filter(sale => {
        const saleDate = startOfDay(parseISO(sale.createdAt));
        return saleDate.getTime() === dayStart.getTime();
      });

      const totalSales = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalReceived = daySales.reduce((sum, sale) => sum + sale.amountReceived, 0);

      return {
        date: format(day, 'MMM dd'),
        sales: totalSales,
        received: totalReceived,
      };
    });
  }, [sales, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `₹${value.toFixed(2)}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#3b82f6" 
              name="Total Sales"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="received" 
              stroke="#10b981" 
              name="Amount Received"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}