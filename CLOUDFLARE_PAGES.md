# Cloudflare Pages Deployment

This document explains the Cloudflare Pages migration for the Lucid Bots pricing configurator.

## What Works on Cloudflare Pages

✅ **Static pages** (`/`, `/refresh`, `/capex`) - All pages build and render correctly as static HTML  
✅ **Root redirect** - Handled via meta refresh in the static HTML (307 → 200 with instant redirect)  
✅ **Client-side functionality** - Form UI, state management, URL encoding all work  
✅ **External CNAME** - Pages accepts `pricing.lucidbots.com` CNAME even with DNS at GoDaddy  

## What DOES NOT Work

❌ **API route `/api/pdf`** - PDF generation via `@react-pdf/renderer`  
❌ **API route `/api/submit`** - Email submission via Resend  

### Why API Routes Block Migration

Both API routes use `export const runtime = 'nodejs'` and Node.js-specific APIs:

1. **`/api/pdf`**: Uses `@react-pdf/renderer` which requires:
   - `fs.readFileSync()` to load fonts and logo from disk
   - `path.join()` for file system paths
   - Node.js Buffer APIs

2. **`/api/submit`**: Uses Resend Node.js SDK and:
   - Node.js runtime for email sending
   - File system access for attachments

Cloudflare Pages Functions run in the Workers runtime, which does **not provide Node.js APIs** (`fs`, `path`, `Buffer`, etc.). These routes would need complete rewrites to work in Workers.

## Deployment Options

### Option A: Static Pages Only (Recommended for Cost Savings)

Deploy static pages to Cloudflare Pages, **remove** PDF/email features from the UI.

**Pros:**
- $0/month on Cloudflare Pages Free tier
- No DNS changes needed (CNAME works)
- Fast global CDN

**Cons:**
- Loss of "Lock in configuration" email feature
- Loss of PDF download feature

### Option B: Hybrid Setup

Deploy static pages to Cloudflare Pages, keep Netlify Functions for API routes only.

**Implementation:**
- Point `pricing.lucidbots.com` to Cloudflare Pages
- Update `/api/*` fetch calls to POST to `https://refreshconfig.netlify.app/api/*`
- Keep Netlify site running for Functions only (no CDN traffic)

**Pros:**
- Retains all features
- Reduces Netlify bandwidth costs (no page serving)

**Cons:**
- Requires CORS configuration
- Cross-origin API calls (slightly slower)
- Still paying for Netlify Functions

### Option C: Rewrite API Routes for Workers

Rewrite both API routes to be Workers-compatible:
- Replace `@react-pdf/renderer` with a Workers-compatible PDF library or service
- Replace Resend SDK with direct fetch to Resend API
- Inline fonts/images as base64 data URIs

**Effort:** High (2-3 days of development + testing)

## Build Configuration

### Cloudflare Pages Settings

```
Project name: lucid-pricing
Build command: ./build-pages.sh
Build output directory: dist
Node version: 18
```

### Environment Variables

Set these in Cloudflare Pages dashboard (only needed if keeping/rewriting API routes):

```
RESEND_API_KEY
RESEND_FROM_EMAIL
REFRESH_INBOX
HUBSPOT_TOKEN (optional)
```

### DNS Setup

In GoDaddy DNS:
```
Type: CNAME
Name: pricing
Value: lucid-pricing.pages.dev
TTL: 1 hour
```

## File Structure

```
dist/               # Build output (static HTML/CSS/JS)
├── index.html      # Root with meta refresh redirect
├── refresh.html    # Refresh pricing page
├── capex.html      # CapEx pricing page
├── _redirects      # Netlify-style redirects (Pages supports)
└── _next/          # Next.js assets
    └── static/
```

## Testing

Static pages verified locally:
- Root (/) → meta refresh to /refresh/
- /refresh → Lucid Refresh configurator
- /capex → Lucid Sherpa outright purchase

All pages render identically to production https://pricing.lucidbots.com

## Recommendation

Deploy **Option A** (static pages only, remove API features) for immediate cost savings, then evaluate whether customers actually use the email/PDF features. If usage is low, keep it removed. If high, implement Option C (rewrite for Workers).
