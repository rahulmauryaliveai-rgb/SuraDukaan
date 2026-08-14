import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  PauseCircle,
  Store,
  Phone,
  Mail,
  Clock,
  Globe,
  ArrowRight,
  Share2,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}
import { getPublicShop } from "@/lib/storefront";
import { db } from "@/lib/db";
import { appUrl, cn } from "@/lib/utils";
import { shopContactMessage } from "@/lib/whatsapp";
import { getTheme, themeCssVars, themeFontHref, isDarkTheme as themeIsDark } from "@/lib/themes";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { TrackView } from "@/components/storefront/track-view";
import { ShareShopButton } from "@/components/share-buttons";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getPublicShop(shopSlug);
  if (!shop) return { title: "Shop not found" };
  const title = `${shop.name} — Online Shop`;
  const description =
    shop.description ??
    `Browse products from ${shop.name}${shop.city ? ` in ${shop.city}` : ""} and order directly on WhatsApp.`;
  const url = appUrl(`/${shop.slug}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: shop.name,
      ...(shop.coverUrl || shop.logoUrl ? { images: [shop.coverUrl ?? shop.logoUrl!] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** One row of the contact block. */
function InfoRow({
  icon,
  children,
  href,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
}) {
  const body = (
    <span className="flex items-start gap-3 text-sm leading-relaxed">
      <span className="mt-0.5 shrink-0 opacity-70">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
  return href ? (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:underline">
        {body}
      </a>
    </li>
  ) : (
    <li>{body}</li>
  );
}

export default async function ShopWelcomePage({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getPublicShop(shopSlug);
  if (!shop) notFound();

  if (shop.status !== "LIVE") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
        <PauseCircle className="mb-4 h-12 w-12 text-ink-300" />
        <h1 className="text-xl font-bold">{shop.name}</h1>
        <p className="mt-2 text-ink-500">This shop is temporarily unavailable.</p>
      </div>
    );
  }

  const theme = getTheme(shop.theme?.template);
  const cssVars = themeCssVars(theme, shop.theme?.primaryColor);
  const shopUrl = appUrl(`/${shop.slug}`);

  const productCount = await db.product.count({
    where: { shopId: shop.id, deletedAt: null, isPublished: true },
  });

  const addressLine = [shop.address, shop.city, shop.state, shop.pincode].filter(Boolean).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    url: shopUrl,
    ...(shop.description ? { description: shop.description } : {}),
    ...(shop.logoUrl ? { image: shop.logoUrl } : {}),
    ...(shop.phone || shop.whatsapp ? { telephone: shop.phone ?? shop.whatsapp } : {}),
    ...(shop.email ? { email: shop.email } : {}),
    ...(addressLine
      ? {
          address: {
            "@type": "PostalAddress",
            ...(shop.address ? { streetAddress: shop.address } : {}),
            ...(shop.city ? { addressLocality: shop.city } : {}),
            ...(shop.state ? { addressRegion: shop.state } : {}),
            ...(shop.pincode ? { postalCode: shop.pincode } : {}),
            addressCountry: "IN",
          },
        }
      : {}),
    ...(shop.openingHours ? { openingHours: shop.openingHours } : {}),
  };

  /* Dark themes get a cinematic scrim with light text; light ones stay bright. */
  const isDarkTheme = themeIsDark(theme);
  const headingFont = { fontFamily: "var(--sf-font-heading)" };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ ...cssVars, background: "var(--sf-bg)", color: "var(--sf-ink)", fontFamily: "var(--sf-font-body)" }}
    >
      <link rel="stylesheet" href={themeFontHref(theme)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView shopSlug={shop.slug} type="SHOP_VIEW" />

      {/* ---------------- Background ---------------- */}
      <div className="fixed inset-0 -z-10">
        {shop.coverUrl ? (
          <Image src={shop.coverUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${theme.colors.surface}, ${theme.colors.accent}33)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: isDarkTheme
              ? "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.78))"
              : `linear-gradient(to bottom, ${theme.colors.bg}cc, ${theme.colors.bg}f2)`,
          }}
        />
      </div>

      {/* ---------------- Card ---------------- */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <div
          className="overflow-hidden border shadow-2xl backdrop-blur-sm"
          style={{
            background: isDarkTheme ? "rgba(18,18,20,0.72)" : "var(--sf-surface)",
            borderColor: "var(--sf-border)",
            borderRadius: `calc(var(--sf-radius) + 8px)`,
            color: isDarkTheme ? "#f5f5f5" : "var(--sf-ink)",
          }}
        >
          <div className="px-6 pb-6 pt-8 text-center sm:px-8">
            {/* Logo */}
            <div
              className="mx-auto mb-4 h-24 w-24 overflow-hidden border-2 shadow-lg"
              style={{
                borderColor: "var(--sf-accent)",
                background: "var(--sf-surface)",
                borderRadius: theme.radius === "999px" ? "999px" : `calc(var(--sf-radius) + 4px)`,
              }}
            >
              {shop.logoUrl ? (
                <Image
                  src={shop.logoUrl}
                  alt={`${shop.name} logo`}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="flex h-full items-center justify-center opacity-40">
                  <Store className="h-10 w-10" />
                </span>
              )}
            </div>

            {/* Name + category */}
            <h1
              className={cn(
                "text-3xl font-bold leading-tight sm:text-4xl",
                theme.upperHeadings && "uppercase tracking-[0.14em]",
              )}
              style={headingFont}
            >
              {shop.name}
            </h1>
            <p
              className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm"
              style={{ color: isDarkTheme ? "rgba(255,255,255,.7)" : "var(--sf-muted)" }}
            >
              <span>{shop.category}</span>
              {shop.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {shop.city}
                </span>
              )}
            </p>

            {/* About */}
            {shop.description && (
              <p
                className="mx-auto mt-4 max-w-md text-sm leading-relaxed"
                style={{ color: isDarkTheme ? "rgba(255,255,255,.82)" : "var(--sf-ink)" }}
              >
                {shop.description}
              </p>
            )}

            {/* Step In */}
            <Link
              href={`/${shop.slug}/shop`}
              className="group mt-7 inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-base font-bold shadow-lg transition hover:brightness-110 active:scale-[0.99]"
              style={{
                background: "var(--sf-accent)",
                color: "var(--sf-accent-ink)",
                borderRadius: "var(--sf-radius)",
                letterSpacing: theme.upperHeadings ? "0.12em" : undefined,
                textTransform: theme.upperHeadings ? "uppercase" : undefined,
              }}
            >
              Step In
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <p
              className="mt-2.5 text-xs"
              style={{ color: isDarkTheme ? "rgba(255,255,255,.6)" : "var(--sf-muted)" }}
            >
              {productCount} {productCount === 1 ? "product" : "products"} inside
            </p>
          </div>

          {/* ---------------- Contact ---------------- */}
          {(addressLine || shop.phone || shop.whatsapp || shop.email || shop.openingHours) && (
            <div
              className="border-t px-6 py-5 sm:px-8"
              style={{
                borderColor: isDarkTheme ? "rgba(255,255,255,.12)" : "var(--sf-border)",
                background: isDarkTheme ? "rgba(255,255,255,.04)" : "transparent",
              }}
            >
              <h2
                className="mb-3 text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: isDarkTheme ? "rgba(255,255,255,.55)" : "var(--sf-muted)" }}
              >
                Visit or contact us
              </h2>
              <ul className="space-y-2.5">
                {addressLine && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    href={shop.mapsLink || undefined}
                  >
                    {addressLine}
                    {shop.mapsLink && (
                      <span className="ml-1 font-medium" style={{ color: "var(--sf-accent)" }}>
                        · Directions
                      </span>
                    )}
                  </InfoRow>
                )}
                {(shop.phone || shop.whatsapp) && (
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    href={`tel:+91${(shop.phone ?? shop.whatsapp).replace(/^91/, "")}`}
                  >
                    +91 {(shop.phone ?? shop.whatsapp).replace(/^91/, "")}
                  </InfoRow>
                )}
                {shop.email && (
                  <InfoRow icon={<Mail className="h-4 w-4" />} href={`mailto:${shop.email}`}>
                    {shop.email}
                  </InfoRow>
                )}
                {shop.openingHours && (
                  <InfoRow icon={<Clock className="h-4 w-4" />}>{shop.openingHours}</InfoRow>
                )}
                {shop.website && (
                  <InfoRow icon={<Globe className="h-4 w-4" />} href={shop.website}>
                    {shop.website.replace(/^https?:\/\//, "")}
                  </InfoRow>
                )}
              </ul>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <WhatsAppButton
                  phone={shop.whatsapp}
                  message={shopContactMessage(shop.name)}
                  shopSlug={shop.slug}
                  source="STOREFRONT"
                  label="WhatsApp"
                  className="flex-1 py-2.5 text-sm"
                />
                <ShareShopButton shopName={shop.name} shopUrl={shopUrl} shopSlug={shop.slug}>
                  <span
                    role="button"
                    aria-label="Share shop"
                    className="inline-flex h-11 w-11 items-center justify-center border"
                    style={{
                      borderColor: isDarkTheme ? "rgba(255,255,255,.2)" : "var(--sf-border)",
                      borderRadius: "var(--sf-radius)",
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </span>
                </ShareShopButton>
                {shop.instagram && (
                  <a
                    href={
                      shop.instagram.startsWith("http")
                        ? shop.instagram
                        : `https://instagram.com/${shop.instagram.replace(/^@/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center border"
                    style={{
                      borderColor: isDarkTheme ? "rgba(255,255,255,.2)" : "var(--sf-border)",
                      borderRadius: "var(--sf-radius)",
                    }}
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                )}
                {shop.facebook && (
                  <a
                    href={shop.facebook.startsWith("http") ? shop.facebook : `https://facebook.com/${shop.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex h-11 w-11 items-center justify-center border"
                    style={{
                      borderColor: isDarkTheme ? "rgba(255,255,255,.2)" : "var(--sf-border)",
                      borderRadius: "var(--sf-radius)",
                    }}
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: isDarkTheme ? "rgba(255,255,255,.55)" : "var(--sf-muted)" }}
        >
          Powered by{" "}
          <Link href="/" className="font-semibold hover:underline" style={{ color: "var(--sf-accent)" }}>
            SURA SHOP
          </Link>
        </p>
      </main>
    </div>
  );
}
