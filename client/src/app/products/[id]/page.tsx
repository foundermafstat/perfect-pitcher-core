"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { getProductById, createCheckoutSession } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const productId = params.id as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error("Ошибка при загрузке продукта:", error);
        toast.error("Не удалось загрузить информацию о продукте");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handlePurchase = async () => {
    if (status !== "authenticated") {
      toast.error("Для покупки необходимо войти в систему");
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    try {
      setPurchasing(true);
      const result = await createCheckoutSession(productId);
      
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error("Не удалось создать платежную сессию");
      }
    } catch (error) {
      console.error("Ошибка при создании платежной сессии:", error);
      toast.error("Произошла ошибка при обработке платежа");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="relative h-64 w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-12 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-10">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Продукт не найден</h2>
          <p className="text-muted-foreground mb-6">
            Запрашиваемый продукт не существует или был удален
          </p>
          <Button onClick={() => router.push("/products")}>
            Вернуться к списку продуктов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <Card>
          {product.imageUrl && (
            <div className="relative h-64 w-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <CardDescription className="text-xl font-semibold">
              {new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: product.currency,
              }).format(product.price)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{product.description}</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? "Обработка..." : "Купить сейчас"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
