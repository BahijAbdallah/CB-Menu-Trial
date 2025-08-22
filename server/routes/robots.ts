import type { Express } from "express";

export function setupRobotsRoutes(app: Express) {
  // Robots.txt route
  app.get('/robots.txt', (req, res) => {
    const publicLaunch = process.env.PUBLIC_LAUNCH === 'true';
    
    if (publicLaunch) {
      // Allow all when site is public
      res.type('text/plain');
      res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
    } else {
      // Disallow all when site is in coming soon mode
      res.type('text/plain');
      res.send(`User-agent: *
Disallow: /`);
    }
  });

  // Optional: Sitemap route for when site is public
  app.get('/sitemap.xml', (req, res) => {
    const publicLaunch = process.env.PUBLIC_LAUNCH === 'true';
    
    if (!publicLaunch) {
      return res.status(404).send('Not found');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/halal-certificates</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  });
}