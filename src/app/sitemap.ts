import type { MetadataRoute } from 'next';

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://hago-mandal.vercel.app';
};

const sitemap = (): MetadataRoute.Sitemap => {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();
  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/profiles`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
};

export default sitemap;
