import { requireAdmin } from "@/lib/clerk/auth";
import { vetBusiness } from "@/lib/businesses/admin";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { adminBusinessVettingSchema } from "@/lib/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = paramsSchema.parse(await context.params);
    const body = adminBusinessVettingSchema.parse(await req.json());
    const business = await vetBusiness(id, body);
    return apiSuccess({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
