import { requireAdmin } from "@/lib/clerk/auth";
import { listBusinessesForAdmin } from "@/lib/businesses/admin";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import type { BusinessStatus } from "@/lib/db/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse({
      status: searchParams.get("status") ?? undefined,
    });

    const businesses = await listBusinessesForAdmin(
      query.status as BusinessStatus | undefined,
    );
    return apiSuccess({ businesses });
  } catch (error) {
    return handleRouteError(error);
  }
}
