# Sentry Source Map Verification Guide

This guide explains how to verify that Sentry source maps are properly configured and uploaded.

## Why Source Maps Matter

Source maps allow Sentry to show you **readable stack traces** with your original TypeScript code instead of minified JavaScript. Without source maps, debugging production errors is nearly impossible.

### Without Source Maps ❌
```
Error: Cannot read property 'id' of undefined
  at a (main-abc123.js:1:1234)
  at b (main-abc123.js:1:5678)
  at c (vendors-xyz789.js:1:9012)
```

### With Source Maps ✅
```
Error: Cannot read property 'id' of undefined
  at AnimatorCard.render (components/animators/animator-card.tsx:45:12)
  at renderComponent (lib/utils/render.ts:89:5)
  at App (app/page.tsx:123:8)
```

---

## Quick Verification

Run the automated verification script:

```bash
pnpm verify:sentry-sourcemaps
```

This will check:
- ✅ Sentry configuration files exist
- ✅ Environment variables are set
- ✅ Next.js config has Sentry webpack plugin
- ✅ Build directory exists

---

## Manual Verification Steps

### Step 1: Configure Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
# Required for source map upload during build
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"

# Required for runtime error reporting
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
```

**Important:**
- `NEXT_PUBLIC_SENTRY_DSN` is for **client-side** error reporting (exposed to browser)
- `SENTRY_DSN` is for **server-side** error reporting (stays on server)
- Both can be the same DSN or different DSNs if you want separate client/server projects

### Step 2: Build the Application

Run a production build:

```bash
pnpm build
```

During the build, you should see:

```
...
✓ Compiled successfully
Sentry: Uploading source maps...
Sentry: Successfully uploaded source maps
...
```

If you don't see "Uploading source maps", check:
1. Are `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` set?
2. Is `next.config.js` wrapped with `withSentryConfig`?
3. Check build logs for Sentry-related errors

### Step 3: Trigger a Test Error

**Option A: Use Test Scripts**

```bash
# Test client-side error capture
pnpm test:sentry-client

# Test server-side error capture
pnpm test:sentry-server
```

**Option B: Create a Test Page**

Create `app/test-sentry/page.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function TestSentryPage() {
  // This will throw on page load
  useEffect(() => {
    throw new Error('Source map test error - check line numbers in Sentry!')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Source Map Test</h1>
      <p className="mb-4">This page should trigger an error on load.</p>

      <button
        onClick={() => {
          // Manually trigger an error
          Sentry.captureException(
            new Error('Manual source map test - this should show the correct file and line')
          )
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Trigger Manual Error
      </button>
    </div>
  )
}
```

**Option C: Browser Console**

1. Start the production server: `pnpm build && pnpm start`
2. Open any page
3. Open browser console (F12)
4. Run: `throw new Error("Browser console test error")`

### Step 4: Verify in Sentry Dashboard

1. Go to your Sentry dashboard: `https://sentry.io/organizations/{your-org}/issues/`
2. Find the error you just triggered
3. Click on the error to view details

**Check these indicators:**

✅ **Source Maps ARE Working:**
- Stack trace shows original file paths (e.g., `app/test-sentry/page.tsx`)
- Line numbers match your TypeScript source code
- Function names are readable (e.g., `TestSentryPage.useEffect`)
- Clicking a stack frame shows your actual TypeScript code
- Code snippets have proper syntax highlighting

❌ **Source Maps ARE NOT Working:**
- Stack trace shows webpack paths (e.g., `webpack:///_next/static/...`)
- File names are mangled (e.g., `main-abc123.js`, `_app.js`)
- Line numbers don't match your source (e.g., line 1, column 12345)
- Function names are minified (e.g., `function a()`, `t.render()`)
- Clicking a stack frame shows "Source code not available"
- Code snippets show minified JavaScript

### Step 5: Verify Specific Stack Frame

1. In Sentry, click on any stack frame in the error
2. You should see:
   - ✅ File path: `app/test-sentry/page.tsx` (not `main-abc.js`)
   - ✅ Line number: `8` (matches your code)
   - ✅ Code snippet:
     ```typescript
     useEffect(() => {
       throw new Error('Source map test error - check line numbers in Sentry!')
     }, [])
     ```

---

## Troubleshooting

### Issue: "Source code not available" in Sentry

**Possible causes:**

1. **Source maps not uploaded during build**
   - Check build logs for "Sentry: Uploading source maps"
   - Verify `SENTRY_AUTH_TOKEN` has correct permissions
   - Token needs: `project:write` and `project:releases`

2. **Environment variables not set**
   - Ensure `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` are in `.env.local`
   - Don't commit `.env.local` to git (use `.env.example` as template)

3. **Release version mismatch**
   - Sentry needs to match the release version from build to runtime
   - Check Sentry dashboard → Settings → Source Maps
   - Ensure release exists with uploaded source maps

4. **Next.js config issue**
   - Verify `next.config.js` is wrapped with `withSentryConfig`
   - Check `sentryWebpackPluginOptions` includes `org`, `project`, `authToken`

### Issue: Build fails with Sentry error

**Error:** `Error: Sentry CLI not authenticated`

**Solution:**
- Generate an auth token in Sentry → Settings → Auth Tokens
- Add to `.env.local`: `SENTRY_AUTH_TOKEN="your-token"`

**Error:** `Error: Organization not found`

**Solution:**
- Check organization slug in Sentry URL: `https://sentry.io/organizations/{org-slug}/`
- Ensure `SENTRY_ORG` matches exactly (case-sensitive)

**Error:** `Error: Project not found`

**Solution:**
- Check project slug in Sentry → Settings → General → Project Slug
- Ensure `SENTRY_PROJECT` matches exactly (case-sensitive)

### Issue: Stack traces show wrong line numbers

**Possible causes:**

1. **Cached build artifacts**
   - Delete `.next` folder: `rm -rf .next`
   - Clean build: `pnpm build`

2. **Development vs Production mismatch**
   - Source maps are only uploaded in production builds
   - Use `pnpm build` not `pnpm dev`

3. **Old source maps in Sentry**
   - Go to Sentry → Settings → Source Maps
   - Delete old releases
   - Rebuild and redeploy

---

## Advanced: Verifying Source Map Upload

### Check Build Output

During `pnpm build`, look for:

```
Sentry: Uploading source maps...
Sentry: Uploaded 45 source maps
Sentry: Processing source maps...
Sentry: Source maps processed successfully
```

### Check Sentry Dashboard

1. Go to **Settings** → **Projects** → **{Your Project}** → **Source Maps**
2. Click on the latest release
3. You should see uploaded artifacts:
   - `_next/static/chunks/*.js` (client bundles)
   - `.next/server/**/*.js` (server bundles)
   - Each should have a corresponding `.map` file

### Check Network Tab

During build, if you enable verbose mode:

```bash
SENTRY_WEBPACK_PLUGIN_VERBOSE=1 pnpm build
```

You'll see detailed upload logs including:
- Which files are being uploaded
- Upload progress
- Any errors or warnings

---

## Production Checklist

Before deploying to production, verify:

- [ ] `pnpm verify:sentry-sourcemaps` passes all checks
- [ ] Production build succeeds with "Uploading source maps" message
- [ ] Test error shows readable stack trace in Sentry
- [ ] Stack trace line numbers match source code
- [ ] Clicking stack frames shows TypeScript code
- [ ] Environment variables are set in production environment
- [ ] Sentry auth token has `project:write` and `project:releases` permissions
- [ ] `.env.local` is not committed to git

---

## CI/CD Integration

When deploying via CI/CD, ensure:

1. **Environment variables are set** in CI/CD secrets:
   ```yaml
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=<secret>
   NEXT_PUBLIC_SENTRY_DSN=https://...
   SENTRY_DSN=https://...
   ```

2. **Build command uploads source maps**:
   ```yaml
   - name: Build application
     run: pnpm build
     env:
       SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
       SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
       SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
   ```

3. **Release is tagged** (optional but recommended):
   ```typescript
   // sentry.client.config.ts
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA, // or your release version
   })
   ```

---

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Source Maps Documentation](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Troubleshooting Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js/)
- [Sentry Webpack Plugin](https://github.com/getsentry/sentry-webpack-plugin)

---

## Quick Reference

```bash
# Run verification checks
pnpm verify:sentry-sourcemaps

# Test client-side errors
pnpm test:sentry-client

# Test server-side errors
pnpm test:sentry-server

# Production build (uploads source maps)
pnpm build

# Start production server
pnpm start

# Clean build
rm -rf .next && pnpm build
```

---

## Support

If source maps still aren't working after following this guide:

1. Run the verification script: `pnpm verify:sentry-sourcemaps`
2. Check the build logs for Sentry errors
3. Verify auth token permissions in Sentry → Settings → Auth Tokens
4. Check Sentry dashboard → Settings → Source Maps for uploaded artifacts
5. Consult [Sentry's troubleshooting guide](https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js/)
