'use client';

import * as React from 'react';
import { Dialog, DialogContent, Button } from '@/components/ui';
import { CertificatePreview } from './certificate-preview';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface CertificateDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	catName: string;
	graduationDate?: string;
}

function formatGraduationDate(dateStr?: string): string {
	const date = dateStr ? new Date(dateStr) : new Date();
	const day = date.getDate();
	const year = date.getFullYear();
	const month = date.toLocaleString('en-US', { month: 'long' });

	let suffix = 'th';
	if (day === 1 || day === 21 || day === 31) suffix = 'st';
	else if (day === 2 || day === 22) suffix = 'nd';
	else if (day === 3 || day === 23) suffix = 'rd';

	return `${day}${suffix} of ${month} ${year}`;
}

export function CertificateDialog({
	isOpen,
	onOpenChange,
	catName,
	graduationDate,
}: CertificateDialogProps) {
	const [isDownloading, setIsDownloading] = React.useState(false);
	const formattedDate = React.useMemo(() => formatGraduationDate(graduationDate), [graduationDate]);

	const handleDownloadPDF = async () => {
		setIsDownloading(true);
		try {
			const element = document.getElementById('graduation-certificate-canvas');
			if (!element) return;

			// Capture at 3x scale for high print quality (avoid pixelation)
			const canvas = await html2canvas(element, {
				scale: 3,
				useCORS: true,
				logging: false,
				backgroundColor: null,
			});

			const imgData = canvas.toDataURL('image/jpeg', 0.98);

			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'pt',
				format: [1440, 810],
			});

			pdf.addImage(imgData, 'JPEG', 0, 0, 1440, 810);
			pdf.save(`${catName.toLowerCase().replace(/\s+/g, '-')}-graduation-certificate.pdf`);
		} catch (error) {
			console.error('Failed to generate graduation certificate PDF:', error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent
				title={`${catName}'s Certificate`}
				className="max-w-3xl md:max-w-4xl bg-surface-canvas-light text-ink-deep border border-hairline-cloud rounded-xl overflow-hidden"
			>
				<div className="flex flex-col gap-6">
					{/* Certificate Container */}
					<div className="border border-hairline-cool rounded-lg overflow-hidden shadow-sm bg-white">
						<CertificatePreview catName={catName} graduationDate={formattedDate} />
					</div>

					{/* Download Action Bar */}
					<div className="flex justify-end gap-3 mt-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isDownloading}
						>
							Close
						</Button>
						<Button
							variant="emboss"
							onClick={handleDownloadPDF}
							disabled={isDownloading}
							className="min-w-[160px]"
						>
							{isDownloading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
