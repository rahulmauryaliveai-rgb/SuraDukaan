# AI product photos

Phase 1 of the AI feature set: **photo clean-up**. A seller taps *Enhance* on any
product photo and gets a corrected, square, studio-style version back.

## What it does — and deliberately does not do

Phase 1 is **not generative**. The seller's product pixels are never redrawn,
only corrected and re-framed:

| Step | What happens |
| --- | --- |
| Orientation | EXIF rotation applied, so sideways phone photos stand up |
| Exposure | Mean brightness nudged towards a target (never a full contrast stretch) |
| Colour | Saturation lifted ~6–8%, hue untouched |
| Sharpness | Mild unsharp mask |
| Background | Cut out and replaced with a studio gradient **only when it can be done cleanly** |
| Framing | Product centred at 82% of a 1200×1200 canvas with a soft contact shadow |

An enhanced photo can therefore never misrepresent what arrives in the box.
That matters more here than raw visual impact: a customer who receives a
different-looking product blames the shop, and the shop blames us.

### Why exposure is not `normalise()`

sharp's `normalise()` stretches every channel to the full range. On a flat
product photo — one colour on one backdrop — that drags the product towards
black and the backdrop towards white. A maroon shirt came back near-black in
testing. We measure the mean instead and nudge it, clamped to 0.95×–1.45×.

## Background removal providers

Set `BG_REMOVAL_PROVIDER`:

| Value | Cost | Quality | Notes |
| --- | --- | --- | --- |
| `builtin` *(default)* | free | good on plain backgrounds | Offline flood-fill segmentation, ~0.8s |
| `selfhosted` | free per image | very good | Your own rembg / BiRefNet behind `BG_REMOVAL_ENDPOINT` |
| `removebg` | paid per image | best | Needs `REMOVEBG_API_KEY` |
| `none` | free | n/a | Colour and crop correction only |

### The built-in segmenter refuses rather than guesses

`src/lib/ai/segment.ts` flood-fills inward from the frame border, keeping
pixels that match the estimated background colour. It returns `null` — no
cutout — when:

- the border itself is highly varied (busy background), or
- the product would occupy under 4% or over 92% of the frame.

When it refuses, the pipeline falls back to correction-and-crop with **no fake
backdrop**. A dark phone photo letterboxed onto white looks worse than the
original; the UI explains this to the seller and suggests a plain wall.

## Plan gating and credits

- Requires `plan.aiEnhanceEnabled` — Starter and above. Free plan gets a 402
  with an upgrade link.
- `CREDIT_COST.ENHANCE` is **0**: enhancement is included, not metered. Credits
  are reserved for generative work (`GENERATE` = 1, `TRY_ON` = 2).
- Rate limited to 30 photos per shop per day.
- Every run writes an `AiJob` row; failures refund any credits charged.

## API

`POST /api/ai/enhance`

```jsonc
// JSON body — url must be one this app previously stored
{ "url": "/uploads/abc.jpg", "productId": "opt", "backdrop": "studio", "keepBackground": false }
```

Also accepts `multipart/form-data` with a `file` field.

```jsonc
{
  "ok": true,
  "data": {
    "jobId": "...",
    "originalUrl": "/uploads/abc.jpg",   // never deleted — revert always works
    "enhancedUrl": "/uploads/def.jpg",
    "backgroundRemoved": true,
    "creditsCharged": 0,
    "creditsRemaining": 30
  }
}
```

Backdrops: `studio` (default), `warm`, `cool`, `white`, `charcoal`.

### SSRF note

The `url` form only accepts a local `/uploads/` path (read straight off disk,
never over HTTP) or an `https` URL on our own Vercel Blob host. Arbitrary URLs
are refused, so the endpoint can't be used to make the server fetch internal
addresses.

## Roadmap

- **Phase 2** — generative extra angles / lifestyle shots (`GENERATE`, 1 credit)
- **Phase 3** — model try-on for apparel (`TRY_ON`, 2 credits)
