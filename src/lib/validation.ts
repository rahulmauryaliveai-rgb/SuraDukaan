import { z } from "zod";
import { isValidSlug } from "@/lib/slug";

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+91/, "").replace(/^0/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

export const otpSchema = z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(isValidSlug, "Use 3-60 lowercase letters, numbers and hyphens (not reserved)");

export const shopCreateSchema = z.object({
  name: z.string().trim().min(2, "Shop name is too short").max(80),
  category: z.string().trim().min(2).max(50),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  whatsapp: phoneSchema,
  slug: slugSchema,
  template: z.enum(["modern", "minimal", "retail", "fashion", "food"]).default("modern"),
});

export const shopUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  category: z.string().trim().min(2).max(50).optional(),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  state: z.string().trim().max(60).optional().or(z.literal("")),
  pincode: z.string().trim().regex(/^\d{6}$/).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  mapsLink: z.string().trim().url().optional().or(z.literal("")),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  whatsapp: phoneSchema.optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  instagram: z.string().trim().max(100).optional().or(z.literal("")),
  facebook: z.string().trim().max(100).optional().or(z.literal("")),
  openingHours: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["LIVE", "PAUSED", "MAINTENANCE"]).optional(),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  coverUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export const themeUpdateSchema = z.object({
  template: z.enum(["modern", "minimal", "retail", "fashion", "food"]).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonStyle: z.enum(["rounded", "pill", "square"]).optional(),
  font: z.enum(["inter", "poppins", "dm-sans"]).optional(),
  cardStyle: z.enum(["shadow", "border", "flat"]).optional(),
});

export const priceSchema = z.coerce
  .number()
  .positive("Price must be greater than 0")
  .max(10_000_000, "Price is too large");

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is too short").max(120),
    price: priceSchema,
    discountPrice: z.coerce.number().positive().max(10_000_000).optional().nullable(),
    categoryId: z.string().trim().optional().nullable(),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    sku: z.string().trim().max(60).optional().or(z.literal("")),
    stock: z.coerce.number().int().min(0).optional().nullable(),
    brand: z.string().trim().max(80).optional().or(z.literal("")),
    weight: z.string().trim().max(40).optional().or(z.literal("")),
    productCode: z.string().trim().max(60).optional().or(z.literal("")),
    isPublished: z.boolean().optional(),
    inStock: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    variants: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(40),
          options: z.array(z.string().trim().min(1).max(40)).min(1).max(30),
        }),
      )
      .max(5)
      .optional(),
    images: z.array(z.string().trim().max(500)).max(8).optional(),
  })
  .refine(
    (p) => p.discountPrice == null || p.discountPrice < p.price,
    { message: "Discount price must be lower than the price", path: ["discountPrice"] },
  );

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(60),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export function zodErrorMessage(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Invalid input";
}
