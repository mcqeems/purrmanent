import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/dashboard',
					'/cats',
					'/coach',
					'/crisis',
					'/progress',
					'/profile',
					'/onboarding',
				],
			},
		],
		sitemap: 'https://purrmanent.web.id/sitemap.xml',
	};
}
