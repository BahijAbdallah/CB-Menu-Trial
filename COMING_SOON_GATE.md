# Coming Soon Gate Implementation

This document explains how the domain-based coming soon gate works and how to configure it.

## Overview

The coming soon gate shows a "Coming Soon" page to visitors on the custom domain `menu.chezbeyrouth.com` before the public launch, while allowing full access on development URLs.

## Behavior

### When Coming Soon is Active
- **Custom Domain** (`menu.chezbeyrouth.com`): Shows coming soon page
- **Development URLs** (*.replit.dev, localhost): Shows full menu app
- **Preview Bypass**: Full app accessible with `?preview=SECRET_KEY` on custom domain
- **SEO Protection**: Adds `noindex,nofollow` meta tag and serves restrictive robots.txt

### When Launched
- All domains show the full menu application

## Configuration

### Environment Variables

Create or update your `.env` file:

```bash
# Coming Soon Gate
VITE_PUBLIC_LAUNCH=false
VITE_PREVIEW_KEY=your-long-random-secret-key
```

### Setting Up the Gate

1. **Before Launch** (Coming Soon Active):
   ```bash
   VITE_PUBLIC_LAUNCH=false
   VITE_PREVIEW_KEY=my-secret-preview-key-123
   ```

2. **After Launch** (Full App Active):
   ```bash
   VITE_PUBLIC_LAUNCH=true
   # VITE_PREVIEW_KEY can remain but is ignored
   ```

### Preview Access

While the coming soon gate is active, you can preview the full app on the custom domain by adding the preview parameter:

```
https://menu.chezbeyrouth.com/?preview=my-secret-preview-key-123
```

## Implementation Details

### Frontend Gate Logic
- Located in `client/src/lib/gate-utils.ts`
- Checks hostname, launch status, and preview parameter
- Returns boolean for whether to show coming soon

### Coming Soon Component
- Located in `client/src/components/coming-soon.tsx`
- Responsive design matching site colors and typography
- Email signup form for launch notifications
- Lebanese restaurant branding

### App Integration
- Gate check happens in `client/src/App.tsx`
- Overrides all routing when active
- Adds SEO protection meta tags dynamically

### Server-side SEO Protection
- Robots.txt route in `server/index.ts`
- Returns `Disallow: /` when gate is active on custom domain
- Returns `Allow: /` for development or after launch

## Security Notes

1. **Preview Key**: Use a long, random string (20+ characters)
2. **Environment Variables**: Never commit actual keys to version control
3. **Production**: Ensure `VITE_PUBLIC_LAUNCH=true` when ready to launch

## Testing

### Test Coming Soon Gate
1. Set `VITE_PUBLIC_LAUNCH=false`
2. Mock hostname as `menu.chezbeyrouth.com` in browser dev tools
3. Verify coming soon page appears

### Test Preview Bypass
1. With gate active, visit: `?preview=your-secret-key`
2. Verify full app loads

### Test Launch Mode
1. Set `VITE_PUBLIC_LAUNCH=true`
2. Verify full app loads on all domains

## Deployment Checklist

- [ ] Set `VITE_PREVIEW_KEY` to secure random string
- [ ] Set `VITE_PUBLIC_LAUNCH=false` for pre-launch
- [ ] Verify coming soon page loads on custom domain
- [ ] Test preview bypass functionality
- [ ] Verify robots.txt returns correct content
- [ ] When ready: Set `VITE_PUBLIC_LAUNCH=true`