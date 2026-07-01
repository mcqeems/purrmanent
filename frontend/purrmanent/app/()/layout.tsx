import { PublicHeader } from '@/components/layout/public-header';
import { Footer } from '@/components/layout/footer';

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<PublicHeader />
			{children}
			<Footer />
		</>
	);
}
