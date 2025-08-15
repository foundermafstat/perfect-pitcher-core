import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Обрабатываем различные события Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Обновляем статус платежа в базе данных
        if (session.payment_status === "paid" && session.metadata?.paymentId) {
          const payment = await prisma.payment.update({
            where: { id: session.metadata.paymentId },
            data: {
              status: "completed",
              stripeCustomerId: session.customer as string,
            },
          });
          
          console.log(`Платеж ${session.metadata.paymentId} успешно завершен`);

          // Начисление токенов пользователю, если у продукта задан tokensGranted
          try {
            const withRelations = await prisma.payment.findUnique({
              where: { id: payment.id },
              include: { product: true },
            })
            if (withRelations?.userId && withRelations.product?.tokensGranted && withRelations.status === 'completed') {
              await prisma.$transaction([
                prisma.user.update({
                  where: { id: withRelations.userId },
                  data: { fiatBalance: { increment: withRelations.amount } },
                }),
                prisma.fiatTransaction.create({
                  data: {
                    userId: withRelations.userId,
                    amount: withRelations.amount,
                    currency: withRelations.currency,
                    provider: 'stripe',
                    status: 'completed',
                    reason: 'stripe_payment_completed',
                    meta: { paymentId: withRelations.id, productId: withRelations.productId },
                  },
                }),
              ])
            }
          } catch (creditErr) {
            console.error('Token credit error:', creditErr)
          }
        }
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Находим платеж по ID сессии и обновляем его статус
        if (paymentIntent.metadata?.paymentId) {
          await prisma.payment.update({
            where: { id: paymentIntent.metadata.paymentId },
            data: {
              status: "failed",
            },
          });
          
          console.log(`Платеж ${paymentIntent.metadata.paymentId} не удался`);
        }
        break;
      }
      
      default:
        console.log(`Неизвестное событие Stripe: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Ошибка при обработке вебхука Stripe:", error);
    return NextResponse.json(
      { error: "Ошибка при обработке вебхука" },
      { status: 500 }
    );
  }
}
