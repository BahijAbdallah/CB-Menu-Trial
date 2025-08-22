# Coming Soon Gate Setup Instructions

## Overview
The Coming Soon gate system completely hides your website from the public while allowing private preview access during development. This is perfect for restaurants preparing to launch their digital menu.

## Environment Variables

### Required Variables for Production

Add these environment variables to your production hosting (Replit, Vercel, etc.):

```bash
# Main launch control - set to 'true' to make site public
PUBLIC_LAUNCH=false

# Preview access key for private previews (change this to a secure value)
VITE_PREVIEW_KEY=your-secret-preview-key-here

# Optional: Force preview mode even when PUBLIC_LAUNCH=true (for testing)
VITE_PREVIEW_MODE=false
```

### For Development/Replit

In your Replit environment, add these secrets:

1. **PUBLIC_LAUNCH** = `false` (keeps site hidden by default)
2. **VITE_PREVIEW_KEY** = `MY_SECRET_PREVIEW_KEY` (replace with your chosen key)
3. **VITE_PREVIEW_MODE** = `true` (optional: always show preview mode in development)

## How to Use

### During Development
- Set `VITE_PREVIEW_MODE=true` to always see the full site with a preview banner
- Or use `?preview=MY_SECRET_PREVIEW_KEY` in the URL to bypass Coming Soon

### For Private Previews
Share this URL with stakeholders for private reviews:
```
https://your-domain.com/?preview=MY_SECRET_PREVIEW_KEY
```

### Going Live
When ready to launch publicly:
1. Set `PUBLIC_LAUNCH=true` in your production environment
2. The Coming Soon page will disappear for all visitors
3. Remove the preview URL parameter for clean public links

## Features

### SEO Protection
- **robots.txt**: Automatically blocks all search engines when `PUBLIC_LAUNCH=false`
- **meta robots**: Adds `noindex, nofollow` to prevent indexing
- **sitemap.xml**: Only serves when site is public

### Preview Mode Indicators
- Red banner shows "PREVIEW MODE - Site not yet public" when using preview access
- Helps distinguish between private preview and public launch

### Complete Site Hiding
- All routes (`/`, `/admin`, `/halal-certificates`, etc.) show Coming Soon
- No header, footer, or navigation elements are accessible
- Maintains brand colors and typography for consistency

## Security Notes

1. **Change the preview key**: Don't use `MY_SECRET_PREVIEW_KEY` in production
2. **Keep keys private**: Don't share preview URLs publicly
3. **Remove preview parameters**: Clean URLs before public launch

## Testing Scenarios

1. **Coming Soon Mode**: `PUBLIC_LAUNCH=false` → Shows Coming Soon to everyone
2. **Preview Access**: `PUBLIC_LAUNCH=false` + `?preview=KEY` → Shows full site with banner
3. **Development Mode**: `VITE_PREVIEW_MODE=true` → Always shows full site with banner
4. **Public Launch**: `PUBLIC_LAUNCH=true` → Shows full site to everyone

## Common Issues

### Preview not working?
- Check that `VITE_PREVIEW_KEY` matches your URL parameter
- Ensure the environment variable starts with `VITE_` for frontend access

### Still showing Coming Soon after launch?
- Verify `PUBLIC_LAUNCH=true` (not `'true'` in quotes)
- Clear browser cache and refresh

### Preview banner not showing?
- This is normal when `PUBLIC_LAUNCH=true` - the banner only shows in preview mode

---

**Ready to launch?** Set `PUBLIC_LAUNCH=true` in your environment and your restaurant's digital menu will be live for the world to see! 🚀