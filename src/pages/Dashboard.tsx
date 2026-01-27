import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown, Wallet, CreditCard, Package } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { getDashboardMetrics, getLowStockProducts, formatCurrency } from "@/lib/utils-data";
import type { DateRange } from "@/lib/types";
import SalesChart from "@/components/dashboard/SalesChart";
import LowStockAlert from "@/components/dashboard/LowStockAlert";

export default function Dashboard() {
  const { products, sales, purchases } = useData();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });

  const metrics = useMemo(() => getDashboardMetrics(sales, purchases, products, dateRange), [sales, purchases, products, dateRange]);
  console.log(metrics, "metrics");
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);

  const setQuickRange = (days: number) => {
    setDateRange({
      from: startOfDay(subDays(new Date(), days)),
      to: endOfDay(new Date()),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your business metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickRange(0)}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
            Last 30 days
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: startOfDay(range.from), to: endOfDay(range.to) });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalSelling)}</div>
            <p className="text-xs text-gray-500 mt-1">Total receivable amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalPurchase)}</div>
            <p className="text-xs text-gray-500 mt-1">Total payable amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Received</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCashReceived)}</div>
            <p className="text-xs text-gray-500 mt-1">Cash payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Online Received</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalOnlineReceived)}</div>
            <p className="text-xs text-gray-500 mt-1">Online payments</p>
          </CardContent>
        </Card>
      </div>

      {metrics.topSellingProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Selling Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{metrics.topSellingProduct.name}</p>
                <p className="text-sm text-gray-500">Most sold in selected period</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{metrics.topSellingProduct.quantity}</p>
                <p className="text-sm text-gray-500">Units sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart sales={sales} dateRange={dateRange} />
        <LowStockAlert products={lowStockProducts} />
      </div>
    </div>
  );
}
