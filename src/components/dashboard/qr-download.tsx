"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrDownloadButtons({
  pngDataUrl,
  svgString,
  slug,
}: {
  pngDataUrl: string;
  svgString: string;
  slug: string;
}) {
  function download(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" onClick={() => download(pngDataUrl, `${slug}-qr.png`)}>
        <Download className="h-4 w-4" /> PNG
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          download(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`, `${slug}-qr.svg`)
        }
      >
        <Download className="h-4 w-4" /> SVG
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
    </div>
  );
}
