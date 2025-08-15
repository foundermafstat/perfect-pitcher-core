"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getProducts, createProduct } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Проверка роли администратора
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        toast.error("У вас нет доступа к этой странице");
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/products");
    }
  }, [status, session, router]);

  // Загрузка продуктов
  useEffect(() => {
    async function loadProducts() {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Ошибка при загрузке продуктов:", error);
        toast.error("Не удалось загрузить продукты");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadProducts();
    }
  }, [status, session]);

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Валидация
      if (!formData.name || !formData.description || !formData.price) {
        toast.error("Пожалуйста, заполните все обязательные поля");
        return;
      }
      
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error("Пожалуйста, введите корректную цену");
        return;
      }
      
      // Создание продукта
      const newProduct = await createProduct({
        name: formData.name,
        description: formData.description,
        price: price,
        currency: formData.currency,
        imageUrl: formData.imageUrl || undefined,
      });
      
      if (newProduct) {
        toast.success("Продукт успешно создан");
        setProducts((prev) => [...prev, newProduct]);
        setIsDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          currency: "USD",
          imageUrl: "",
        });
      } else {
        toast.error("Не удалось создать продукт");
      }
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
      toast.error("Произошла ошибка при создании продукта");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Если пользователь не аутентифицирован или не является администратором
  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление продуктами</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить продукт
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Добавить новый продукт</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Название продукта*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание*</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Цена*</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      placeholder="USD"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Создание..." : "Создать продукт"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список продуктов</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка продуктов...</p>
          ) : products.length === 0 ? (
            <p>Продукты не найдены. Создайте новый продукт.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: product.currency,
                      }).format(product.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
