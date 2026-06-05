import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import {
  deleteProfileByClerkId,
  upsertProfileFromClerkUser,
} from "@/lib/clerk/admin";
import { apiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    return apiError(
      "CONFIG_ERROR",
      "CLERK_WEBHOOK_SIGNING_SECRET is not configured",
      500,
    );
  }

  let event: WebhookEvent;
  try {
    event = await verifyWebhook(req, { signingSecret });
  } catch (error) {
    console.error("[clerk-webhook] verification failed", error);
    return apiError("WEBHOOK_VERIFICATION_FAILED", "Invalid webhook signature", 400);
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        await upsertProfileFromClerkUser(event.data);
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await deleteProfileByClerkId(event.data.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[clerk-webhook] handler error", event.type, error);
    return apiError("WEBHOOK_HANDLER_ERROR", "Failed to process webhook", 500);
  }

  return new Response("OK", { status: 200 });
}
