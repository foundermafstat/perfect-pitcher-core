"use client";

import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Платеж отменен</CardTitle>
            <CardDescription className="text-gray-600">
              Вы отменили процесс оплаты
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-left">
              <div className="mb-4">
                <p className="mb-2">
                  Ваш платеж был отменен. С вашей карты не были списаны средства.
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <h4 className="font-medium text-amber-800">Возникли проблемы?</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Если у вас возникли проблемы при оплате, пожалуйста, свяжитесь с нашей службой поддержки по электронной почте support@perfectpitcher.app
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => router.push("/products")} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к продуктам
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              На главную
            </Button>
            <Button variant="secondary" onClick={() => router.push("/products")} className="flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Попробовать снова
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
