"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getUserPayments } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CreditCard, DollarSign, ShoppingCart } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  stripeSessionId?: string;
  product: {
    id: string;
    name: string;
    description?: string;
  };
}

interface PaymentSummary {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  totalSpent: number;
}

export default function PaymentsHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account/payments");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadPayments() {
      try {
        const result = await getUserPayments();
        
        if (result.success) {
          setPayments(result.payments);
          setSummary({
            totalCount: result.totalCount,
            completedCount: result.completedCount,
            pendingCount: result.pendingCount,
            totalSpent: result.totalSpent
          });
        } else {
          setError(result.error || "Не удалось загрузить платежи");
          toast.error(result.error || "Не удалось загрузить историю платежей");
        }
      } catch (error) {
        console.error("Ошибка при загрузке платежей:", error);
        setError("Не удалось загрузить историю платежей");
        toast.error("Не удалось загрузить историю платежей");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      loadPayments();
    }
  }, [status]);

  // Функция для отображения статуса платежа
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Оплачен</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-400">В обработке</Badge>;
      case "failed":
        return <Badge variant="destructive">Ошибка</Badge>;
      case "canceled":
        return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Отменен</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  
  // Форматирование суммы
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (status === "loading") {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">История платежей</h1>
        <p className="text-muted-foreground">
          Просмотр всех ваших платежей и их статусов
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3">Загрузка истории платежей...</span>
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500 mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Ошибка загрузки платежей</h3>
            </div>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Всего платежей</p>
                      <h3 className="text-2xl font-bold mt-1">{summary.totalCount}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Успешных платежей</p>
                      <h3 className="text-2xl font-bold mt-1">{summary.completedCount}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Общая сумма покупок</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {formatAmount(summary.totalSpent, "RUB")}
                      </h3>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Все платежи</TabsTrigger>
              <TabsTrigger value="completed">Успешные</TabsTrigger>
              <TabsTrigger value="pending">В обработке</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <PaymentsTable 
                payments={payments} 
                formatDate={formatDate} 
                formatAmount={formatAmount}
                getStatusBadge={getStatusBadge}
                router={router}
              />
            </TabsContent>
            
            <TabsContent value="completed">
              <PaymentsTable 
                payments={payments.filter(p => p.status === "completed")} 
                formatDate={formatDate} 
                formatAmount={formatAmount}
                getStatusBadge={getStatusBadge}
                router={router}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <PaymentsTable 
                payments={payments.filter(p => p.status === "pending")} 
                formatDate={formatDate} 
                formatAmount={formatAmount}
                getStatusBadge={getStatusBadge}
                router={router}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

interface PaymentsTableProps {
  payments: Payment[];
  formatDate: (date: string) => string;
  formatAmount: (amount: number, currency: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  router: any;
}

function PaymentsTable({ payments, formatDate, formatAmount, getStatusBadge, router }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center py-6">
            <p className="mb-4">Платежи не найдены</p>
            <Button onClick={() => router.push("/products")}>
              Просмотреть продукты
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Продукт</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.product.name}
                  {payment.product.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                      {payment.product.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {formatAmount(payment.amount, payment.currency)}
                </TableCell>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
