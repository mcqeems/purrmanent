import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://purrmanent.web.id',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: 'https://purrmanent.web.id/login',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.3,
		},
		{
			url: 'https://purrmanent.web.id/register',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.3,
		},
	];
}
