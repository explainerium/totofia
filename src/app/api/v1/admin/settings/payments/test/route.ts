import { ApiError } from "@/server/http/api-error";
import { apiHandler } from "@/server/http/api-handler";
import { ok } from "@/server/http/response";
import { gatewayTestInput } from "@/server/modules/payment/gateway-settings.schema";
import { testGatewayConnection } from "@/server/modules/payment/payment.service";

/** Creates a throwaway ৳10 session with the saved credentials (nothing is charged). */
export const POST = apiHandler(
  {
    admin: true,
    body: gatewayTestInput,
    rateLimit: { name: "gateway-test", limit: 10, windowMs: 60_000 },
  },
  async ({ body, user }) => {
    if (user!.role !== "ADMIN") throw new ApiError(403, "forbidden");
    return ok(await testGatewayConnection(body.provider));
  },
);
