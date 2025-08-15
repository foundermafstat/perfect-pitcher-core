"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import Stripe from "stripe"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

// Инициализация Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Создание продукта в базе данных
 */
export async function createProduct(productData: {
  name: string
  description: string
  price: number
  currency?: string
  imageUrl?: string
}) {
  try {
    console.log("Создание продукта:", productData.name)
    
    // Валидация данных
    if (!productData.name || !productData.description || productData.price <= 0) {
      console.error("Некорректные данные продукта")
      return null
    }
    
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: productData.currency || "USD",
        imageUrl: productData.imageUrl,
      },
    })

    console.log("Продукт успешно создан:", product.id)
    revalidatePath("/products")
    revalidatePath("/admin/products")
    return product
  } catch (error) {
    console.error("Ошибка при создании продукта:", error)
    return null
  }
}

/**
 * Получение всех продуктов
 */
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return products
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error)
    return []
  }
}

/**
 * Получение продукта по ID
 */
export async function getProductById(id: string) {
  if (!id) {
    console.error("ID продукта не указан")
    return null
  }
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })
    
    if (!product) {
      console.log(`Продукт с ID ${id} не найден`)
    }
    
    return product
  } catch (error) {
    console.error(`Ошибка при получении продукта ${id}:`, error)
    return null
  }
}

/**
 * Создание платежной сессии Stripe
 */
export async function createCheckoutSession(productId: string) {
  if (!productId) {
    console.error("ID продукта не указан")
    return { error: "ID продукта не указан" }
  }
  
  try {
    // Проверка авторизации пользователя
    const session = await auth()
    if (!session?.user) {
      console.error("Попытка создания платежа неавторизованным пользователем")
      return { error: "Пользователь не авторизован" }
    }

    // Получение данных пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    })

    if (!user) {
      console.error(`Пользователь с email ${session.user.email} не найден в базе данных`)
      return { error: "Пользователь не найден" }
    }

    // Получение данных продукта
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, description: true, imageUrl: true, price: true, currency: true, tokensGranted: true },
    })

    if (!product) {
      console.error(`Продукт с ID ${productId} не найден`)
      return { error: "Продукт не найден" }
    }

    console.log(`Создание платежа для пользователя ${user.id} за продукт ${product.id}`)

    // Создаем платеж в базе данных
    const payment = await prisma.payment.create({
      data: {
        amount: product.price,
        currency: product.currency,
        status: "pending",
        userId: user.id,
        productId: product.id,
      },
    })

    console.log(`Платеж создан в базе данных: ${payment.id}`)

    // Проверка наличия APP_URL
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("NEXT_PUBLIC_APP_URL не найден в переменных окружения")
      return { error: "Ошибка конфигурации сервера" }
    }

    // Создаем сессию Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description,
              images: product.imageUrl ? [product.imageUrl] : [],
            },
            unit_amount: Math.round(product.price * 100), // Stripe работает с наименьшими единицами валюты (центы)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        paymentId: payment.id,
        userId: user.id,
        productId: product.id,
        tokensGranted: product.tokensGranted ?? 0,
      },
      customer_email: user.email || undefined,
    })

    console.log(`Сессия Stripe создана: ${stripeSession.id}`)

    // Обновляем платеж с ID сессии Stripe
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeSessionId: stripeSession.id,
      },
    })

    return { url: stripeSession.url }
  } catch (error: any) {
    console.error("Ошибка при создании платежной сессии:", error?.message || error)
    return { error: "Ошибка при создании платежной сессии" }
  }
}

/**
 * Проверка статуса платежа
 */
export async function checkPaymentStatus(sessionId: string) {
  if (!sessionId) {
    console.error("ID сессии не указан")
    return { success: false, error: "ID сессии не указан" }
  }
  
  try {
    console.log(`Проверка статуса платежа для сессии: ${sessionId}`)
    
    // Получаем сессию из Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Получаем платеж из базы данных
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: sessionId },
      include: { product: true },
    })
    
    if (!payment) {
      console.error(`Платеж с ID сессии ${sessionId} не найден в базе данных`)
      return { success: false, error: "Платеж не найден" }
    }
    
    console.log(`Текущий статус платежа в Stripe: ${session.payment_status}`)
    
    // Если платеж успешно оплачен
    if (session.payment_status === "paid") {
      console.log(`Обновление статуса платежа ${payment.id} на 'completed'`)
      
      // Обновляем статус платежа в базе данных
      await prisma.payment.update({
        where: { stripeSessionId: sessionId },
        data: {
          status: "completed",
          stripeCustomerId: session.customer as string,
        },
      })
      
      return { 
        success: true, 
        status: "completed",
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          productName: payment.product.name
        }
      }
    }
    
    // Если платеж не оплачен
    return { 
      success: true, 
      status: session.payment_status,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        productName: payment.product.name
      }
    }
  } catch (error: any) {
    console.error("Ошибка при проверке статуса платежа:", error?.message || error)
    return { success: false, error: "Ошибка при проверке статуса платежа" }
  }
}

/**
 * Получение платежей пользователя
 * @returns Структурированный ответ с платежами пользователя или информацией об ошибке
 */
export async function getUserPayments() {
  try {
    // Проверка авторизации пользователя
    const session = await auth()
    if (!session?.user) {
      console.log("Попытка получения платежей неавторизованным пользователем")
      return { 
        success: false, 
        error: "Требуется авторизация", 
        payments: [] 
      }
    }

    // Получение пользователя из базы данных
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    })

    if (!user) {
      console.log(`Пользователь с email ${session.user.email} не найден в базе данных`)
      return { 
        success: false, 
        error: "Пользователь не найден", 
        payments: [] 
      }
    }

    console.log(`Получение платежей для пользователя: ${user.id}`)
    
    // Получение платежей из базы данных
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`Найдено ${payments.length} платежей для пользователя ${user.id}`)
    
    // Формирование ответа с дополнительной информацией
    return { 
      success: true, 
      payments,
      totalCount: payments.length,
      completedCount: payments.filter(p => p.status === "completed").length,
      pendingCount: payments.filter(p => p.status === "pending").length,
      totalSpent: payments
        .filter(p => p.status === "completed")
        .reduce((sum, payment) => sum + payment.amount, 0)
    }
  } catch (error: any) {
    console.error("Ошибка при получении платежей пользователя:", error?.message || error)
    return { 
      success: false, 
      error: "Ошибка при получении платежей", 
      payments: [] 
    }
  }
}
