import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "standardwebhooks";
import { prisma } from "@/lib/db";
import type { WebhookPayload } from "dodopayments/resources/webhook-events";

// 플랜별 크레딧 매핑
const PLAN_CREDITS: Record<string, number> = {
  starter: 50,
  pro: 100,
  ultra: 275,
};

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const rawBody = await request.text();

    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };

    // 웹훅 서명 검증
    const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);
    await webhook.verify(rawBody, webhookHeaders);

    const payload = JSON.parse(rawBody) as WebhookPayload;

    // payment.succeeded 이벤트만 처리
    if (payload.type === "payment.succeeded") {
      const paymentData = payload.data;

      if (paymentData.payload_type !== "Payment") {
        return NextResponse.json({ received: true });
      }

      const { payment_id, metadata, total_amount } = paymentData;
      const userId = metadata?.userId;
      const plan = metadata?.plan;

      if (!userId || !plan) {
        console.error("Missing userId or plan in metadata");
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      const credits = PLAN_CREDITS[plan];

      if (!credits) {
        console.error("Invalid plan:", plan);
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      // 중복 처리 방지 (dodoPaymentId가 이미 존재하면 스킵)
      const existingTransaction = await prisma.transaction.findUnique({
        where: { dodoPaymentId: payment_id },
      });

      if (existingTransaction) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      // 트랜잭션으로 크레딧 추가 + 거래 기록
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: credits,
            },
          },
        }),
        prisma.transaction.create({
          data: {
            userId,
            credits,
            amount: total_amount,
            plan,
            dodoPaymentId: payment_id,
          },
        }),
      ]);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
