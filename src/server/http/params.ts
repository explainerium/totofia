import { z } from "zod";

export const idParams = z.object({ id: z.uuid() });
export const valueParams = z.object({ id: z.uuid(), valueId: z.uuid() });
