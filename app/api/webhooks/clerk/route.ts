import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response("Error: Missing required user data", {
        status: 400,
      });
    }

    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });
    } catch (error) {
      console.error("Error creating user in database:", error);
      return new Response("Error: Database operation failed", {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id) {
      return new Response("Error: Missing user ID", {
        status: 400,
      });
    }

    try {
      await prisma.user.update({
        where: {
          clerkId: id,
        },
        data: {
          email: email_addresses?.[0]?.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new Response("Error: Database operation failed", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Error: Missing user ID", {
        status: 400,
      });
    }

    try {
      await prisma.user.delete({
        where: {
          clerkId: id,
        },
      });
    } catch (error: any) {
      // P2025 에러는 레코드가 없는 경우 - 이미 삭제되었으므로 성공으로 처리
      if (error.code === "P2025") {
        return new Response("Webhook processed successfully", { status: 200 });
      }

      console.error("Error deleting user from database:", error);
      return new Response("Error: Database operation failed", {
        status: 500,
      });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
