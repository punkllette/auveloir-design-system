import type { APIRoute } from 'astro';

// Public content pages, including the static catalogs served from public/.
const pages = ['/', '/design-system.html', '/assets/components/index.html'];

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Set site in astro.config.mjs to generate the sitemap.');

  const urls = pages.map((path) => {
    const location = new URL(path, site).href.replace(/&/g, '&amp;');
    return `  <url><loc>${location}</loc></url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
