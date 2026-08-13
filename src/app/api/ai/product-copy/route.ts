import { z } from "zod";
import { requireShop } from "@/lib/auth/session";
import { getAI } from "@/lib/ai";
import { ok, handleApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  hints: z.string().trim().max(300).optional(),
});

export async function POST(req: Request) {
  try {
    const { shop } = await requireShop();
    const input = schema.parse(await req.json());
    const copy = await getAI().generateProductCopy({
      name: input.name,
      category: input.category ?? shop.category,
      hints: input.hints,
    });
    return ok({ copy });
  } catch (err) {
    return handleApiError(err);
  }
}
