import { z } from "zod";

export const updateGatewaySchema = z.object({
  enabled: z.boolean(),
});
