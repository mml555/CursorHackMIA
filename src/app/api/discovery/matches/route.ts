import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { listMutualMatches } from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { business } = await requireApprovedBusinessMember();
    const members = await listMutualMatches(business.id);
    return apiSuccess({ members });
  } catch (error) {
    return handleRouteError(error);
  }
}
