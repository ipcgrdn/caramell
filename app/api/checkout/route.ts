import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import DodoPayments from "dodopayments";
import { prisma } from "@/lib/db";

const PRODUCT_IDS: Record<string, string> = {
  starter: process.env.DODO_PRODUCT_STARTER || "",
  pro: process.env.DODO_PRODUCT_PRO || "",
  ultra: process.env.DODO_PRODUCT_ULTRA || "",
};

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { plan } = await request.json();

    if (plan === "free") {
      return NextResponse.json(
        { error: "Free plan does not require payment" },
        { status: 400 }
      );
    }

    const productId = PRODUCT_IDS[plan.toLowerCase()];

    if (!productId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
      // 나중에 제거해야 함.
      environment: "test_mode",
    });

    const checkoutSession = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        userId: user.id,
        plan: plan.toLowerCase(),
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.checkout_url,
      sessionId: checkoutSession.session_id,
    });
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
