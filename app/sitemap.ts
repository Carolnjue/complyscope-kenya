import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const pages: [string, number][] = [['/', 1], ['/counties', 0.8], ['/signup', 0.7], ['/contact', 0.5], ['/privacy', 0.3], ['/terms', 0.3], ['/data-protection', 0.3]];
  return pages.map(([p, priority]) => ({ url: base + p, changeFrequency: 'weekly', priority }));
}
