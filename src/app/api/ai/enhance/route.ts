import { z } from "zod";
import { requireShop } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ok, fail, handleApiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { getStorage, readStored, MAX_UPLOAD_BYTES, extForMime } from "@/lib/storage";
import { getCreditState, spendCredits, refundCredits, InsufficientCreditsError } from "@/lib/credits";
import { enhanceProductPhoto, type BackdropId } from "@/lib/ai/enhance";

/**
 * Photo clean-up for a product image.
 *
 * The original is never touched or deleted — this returns a NEW url and the
 * caller decides whether to keep it, so "revert" is always possible.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

/** Enhancement is not free to run, even at zero credits. */
const DAILY_LIMIT = 30;

const BACKDROPS = ["studio", "warm", "cool", "white", "charcoal"] as const;

const schema = z.object({
  /** A url this app previously stored, or omit and send `file` instead. */
  url: z.string().trim().min(1).max(500).optional(),
  productId: z.string().trim().min(1).max(60).optional(),
  backdrop: z.enum(BACKDROPS).optional(),
  keepBackground: z.boolean().optional(),
});

function looksLikeImage(buffer: Buffer): boolean {
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return isJpg || isPng || isWebp;
}

/** Accepts either multipart (file + fields) or a JSON body referencing a url. */
async function readRequest(req: Request): Promise<{
  input: z.infer<typeof schema>;
  file: File | null;
}> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const raw = {
      url: (form.get("url") as string | null) ?? undefined,
      productId: (form.get("productId") as string | null) ?? undefined,
      backdrop: (form.get("backdrop") as string | null) ?? undefined,
      keepBackground: form.get("keepBackground") === "true" ? true : undefined,
    };
    return { input: schema.parse(raw), file: file instanceof File ? file : null };
  }
  return { input: schema.parse(await req.json()), file: null };
}

export async function POST(req: Request) {
  try {
    const { shop } = await requireShop();

    const credits = await getCreditState(shop.id);
    if (!credits.enhanceEnabled) {
      return fail("Photo enhancement is available on the Starter plan and above.", 402);
    }
    if (!rateLimit(`enhance:${shop.id}`, DAILY_LIMIT, 24 * 60 * 60 * 1000)) {
      return fail(`You can enhance ${DAILY_LIMIT} photos a day. Try again tomorrow.`, 429);
    }

    const { input, file } = await readRequest(req);

    // --- Resolve the source image -------------------------------------
    let source: Buffer | null = null;
    let originalUrl = input.url ?? null;

    if (file) {
      if (file.size > MAX_UPLOAD_BYTES) return fail("Image must be under 5 MB.");
      if (!extForMime(file.type)) return fail("Only JPG, PNG and WebP images are allowed.");
      source = Buffer.from(await file.arrayBuffer());
    } else if (input.url) {
      source = await readStored(input.url);
      if (!source) return fail("Could not read that image. Please upload it again.");
    }

    if (!source) return fail("No image provided.");
    if (!looksLikeImage(source)) return fail("File does not look like a valid image.");

    // The original must survive so the seller can always revert.
    if (!originalUrl) {
      originalUrl = await getStorage().save(source, "jpg");
    }

    // Only ever act on a product this shop owns.
    let productId: string | null = null;
    if (input.productId) {
      const product = await db.product.findFirst({
        where: { id: input.productId, shopId: shop.id, deletedAt: null },
        select: { id: true },
      });
      if (!product) return fail("Product not found.", 404);
      productId = product.id;
    }

    const job = await db.aiJob.create({
      data: {
        shopId: shop.id,
        productId,
        kind: "ENHANCE",
        status: "RUNNING",
        inputUrl: originalUrl,
        provider: "pending",
        creditCost: 0,
      },
      select: { id: true },
    });

    let charged = 0;
    try {
      const spend = await spendCredits({
        shopId: shop.id,
        operation: "ENHANCE",
        jobId: job.id,
        note: "Photo enhancement",
      });
      charged = spend.charged;

      const result = await enhanceProductPhoto(source, {
        backdrop: input.backdrop as BackdropId | undefined,
        keepBackground: input.keepBackground,
      });
      const enhancedUrl = await getStorage().save(result.buffer, "jpg");

      await db.aiJob.update({
        where: { id: job.id },
        data: {
          status: "SUCCEEDED",
          outputUrl: enhancedUrl,
          provider: result.provider,
          creditCost: charged,
        },
      });

      return ok({
        jobId: job.id,
        originalUrl,
        enhancedUrl,
        backgroundRemoved: result.backgroundRemoved,
        creditsCharged: charged,
        creditsRemaining: spend.remaining,
      });
    } catch (err) {
      await db.aiJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: err instanceof Error ? err.message.slice(0, 300) : "unknown",
        },
      });
      // A seller must never pay for a job that produced nothing.
      if (charged > 0) {
        await refundCredits({
          shopId: shop.id,
          amount: charged,
          jobId: job.id,
          note: "Enhancement failed",
        });
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return fail("You've used all your AI credits for this month.", 402);
    }
    return handleApiError(err);
  }
}
