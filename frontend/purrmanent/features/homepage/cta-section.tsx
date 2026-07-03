import Link from 'next/link';
import { Button, FadeInItem } from '@/components/ui';
import Image from 'next/image';
import logo from '@/app/assets/logo/logo-1000x1000.png';

export function CtaSection() {
	return (
		<section className=" px-6 py-28 text-center relative overflow-hidden ">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(106,95,193,0.1),rgba(255,255,255,0))]" />

			<FadeInItem
				viewport={true}
				yOffset={24}
				className="relative z-10 max-w-xl mx-auto space-y-6"
			>
				<div className="h-[250px] w-[250px] p-4 rounded-full bg-surface-canvas-light mx-auto mb-12 hover:scale-105 scale-100 hover:bg-accent-lime transition-all duration-300">
					<Image src={logo} alt="Purrmanent Logo" width={250} height={250} />
				</div>
				<h2 className="font-display text-4xl font-bold text-on-primary">
					Ready to help your cat settle in?
				</h2>

				<p className="text-on-dark-muted leading-[1.8] max-w-sm mx-auto text-base">
					Start your custom 90-day interactive guide today. Protect their
					health, log progress, and build a permanent bond.
				</p>

				<div className="pt-4">
					<Button
						id="btn-footer-cta"
						asChild
						variant="emboss"
						size="lg"
						className="px-10"
					>
						<Link href="/register">Start your 90 days</Link>
					</Button>
				</div>
			</FadeInItem>
		</section>
	);
}
