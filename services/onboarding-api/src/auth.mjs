import { verifyToken } from "@clerk/backend";

export async function requireClerkUserId(req, secretKey) {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error("Authentication required");
    error.status = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  try {
    const payload = await verifyToken(match[1], { secretKey });
    if (!payload.sub) {
      const error = new Error("Invalid session token");
      error.status = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    return payload.sub;
  } catch (cause) {
    const error = new Error("Invalid session token");
    error.status = 401;
    error.code = "UNAUTHORIZED";
    error.cause = cause;
    throw error;
  }
}
