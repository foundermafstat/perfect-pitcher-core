"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PaymentInfo {
  id: string;
  amount: number;
  currency: string;
  productName: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setVerifying(false);
        setError("Идентификатор платежа не найден");
        return;
      }

      try {
        const result = await checkPaymentStatus(sessionId);
        
        if (result.success) {
          if (result.status === "completed") {
            setVerified(true);
            toast.success("Платеж успешно подтвержден!");
          } else {
            toast.info("Платеж обрабатывается, это может занять некоторое время");
          }
          
          if (result.payment) {
            setPaymentInfo(result.payment);
          }
        } else {
          setError(result.error || "Не удалось проверить статус платежа");
          toast.error(result.error || "Не удалось проверить статус платежа");
        }
      } catch (error) {
        console.error("Ошибка при проверке статуса платежа:", error);
        setError("Произошла ошибка при проверке платежа");
        toast.error("Не удалось проверить статус платежа");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  // Форматирование суммы платежа
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {verified ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <ShoppingBag className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Спасибо за покупку!</CardTitle>
            {verified && (
              <CardDescription className="text-green-600 font-medium">
                Платеж успешно подтвержден
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {verifying ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-3">Проверка статуса платежа...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 py-2">{error}</div>
            ) : paymentInfo ? (
              <div className="text-left">
                <div className="mb-4">
                  {verified ? (
                    <p className="mb-2">Ваш платеж был успешно обработан. Вы можете продолжить использование нашего сервиса.</p>
                  ) : (
                    <p className="mb-2">Ваш платеж был получен и в настоящее время обрабатывается. Мы уведомим вас, когда он будет подтвержден.</p>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Продукт:</span>
                    <span className="font-medium">{paymentInfo.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сумма:</span>
                    <span className="font-medium">{formatAmount(paymentInfo.amount, paymentInfo.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID платежа:</span>
                    <span className="font-mono text-xs">{paymentInfo.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Информация о платеже не найдена.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => router.push("/products")}>
              Вернуться к продуктам
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              На главную
            </Button>
            {verified && (
              <Button variant="ghost" onClick={() => router.push("/account/payments")}>
                История платежей
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
