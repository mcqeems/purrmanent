'use client';

import * as React from 'react';
import Image from 'next/image';
import certificateBackground from '@/app/assets/certification/background.jpeg';
import logo from '@/app/assets/logo/logo-1000x1000.png';

interface CertificatePreviewProps {
	catName: string;
	graduationDate: string;
}

export function CertificatePreview({
	catName,
	graduationDate,
}: CertificatePreviewProps) {
	return (
		<div className="w-full @container">
			<div
				id="graduation-certificate-canvas"
				className="relative w-full aspect-[16/9] bg-cover bg-center overflow-hidden flex flex-col items-center justify-between select-none text-primary"
				style={{
					backgroundImage: `url(${certificateBackground.src})`,
				}}
			>
				{/* Logo Icon */}
				<div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12%] aspect-square pointer-events-none">
					<div className="bg-accent-lime rounded-full p-2">
						<Image
							src={logo}
							alt="Purrmanent Logo"
							className="w-full h-full object-contain"
							priority
						/>
					</div>
				</div>

				{/* Main Certificate Content */}
				<div className="w-full flex flex-col items-center text-center mt-[19.5%] z-10 px-[6%]">
					<h1 className="font-display font-black tracking-wide uppercase text-[2.8cqi] leading-none mb-[1.2%]">
						Certificate of Graduation
					</h1>
					<p className="font-sans font-semibold tracking-[0.2em] text-[1.25cqi] text-muted mb-[2.5%]">
						THIS CERTIFIES THAT
					</p>

					{/* Cat Name with yellow drop-shadow offset matching Certificate.png */}
					<h2
						className="font-display font-black uppercase text-[5cqi] tracking-wider leading-none mb-[3.2%] text-primary select-text"
						style={{
							textShadow: '0.07em 0.07em 0px #FDE047',
						}}
					>
						{catName}
					</h2>

					{/* Graduation Body Message */}
					<p className="font-sans font-medium text-[1.45cqi] max-w-[80%] leading-relaxed text-muted px-[5%]">
						Has successfully graduated from the 90 days cat program from
						Purrmanent.
					</p>
				</div>

				{/* Graduation Date (positioned below the dark hand-drawn line) */}
				<div className="mt-auto mb-[2.2%] font-sans font-semibold text-[1.35cqi] text-muted z-10">
					{graduationDate}
				</div>
			</div>
		</div>
	);
}
