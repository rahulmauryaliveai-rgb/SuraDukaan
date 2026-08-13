import type { Metadata } from "next";
import QRCode from "qrcode";
import { requireShop } from "@/lib/auth/session";
import { appUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { QrDownloadButtons } from "@/components/dashboard/qr-download";

export const metadata: Metadata = { title: "QR Code" };
export const dynamic = "force-dynamic";

export default async function QrCodePage() {
  const { shop } = await requireShop();
  const shopUrl = appUrl(`/${shop.slug}`);

  const [pngDataUrl, svgString] = await Promise.all([
    QRCode.toDataURL(shopUrl, { width: 640, margin: 2, color: { dark: "#0f172a" } }),
    QRCode.toString(shopUrl, { type: "svg", margin: 2, color: { dark: "#0f172a" } }),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="text-xl font-bold">Your Shop QR Code</h1>
      <p className="text-sm text-ink-500">
        Print this and place it at your counter, on your packaging, visiting cards or shop board.
        Customers scan it and land directly in your online shop.
      </p>

      <Card className="print:shadow-none">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <h2 className="text-lg font-bold">{shop.name}</h2>
          <p className="mt-1 text-sm text-ink-500">Scan to Visit Our Shop</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pngDataUrl} alt={`QR code for ${shopUrl}`} className="my-5 h-56 w-56" />
          <p className="break-all font-mono text-xs text-brand-700">{shopUrl}</p>
        </CardContent>
      </Card>

      <QrDownloadButtons pngDataUrl={pngDataUrl} svgString={svgString} slug={shop.slug} />
    </div>
  );
}
