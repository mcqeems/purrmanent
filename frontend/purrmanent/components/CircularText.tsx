import React, { useEffect } from 'react';
import {
	motion,
	useAnimation,
	useMotionValue,
	MotionValue,
	Transition,
} from 'motion/react';
import { cn } from '@/lib/utils/cn';
import Image, { type StaticImageData } from 'next/image';

interface CircularTextProps {
	text: string;
	spinDuration?: number;
	onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
	className?: string;
	radius?: number;
	image?: string | StaticImageData;
}

const getRotationTransition = (
	duration: number,
	from: number,
	loop: boolean = true,
) => ({
	from,
	to: from + 360,
	ease: 'linear' as const,
	duration,
	type: 'tween' as const,
	repeat: loop ? Infinity : 0,
});

const getTransition = (duration: number, from: number) => ({
	rotate: getRotationTransition(duration, from),
	scale: {
		type: 'spring' as const,
		damping: 20,
		stiffness: 300,
	},
});

const CircularText: React.FC<CircularTextProps> = ({
	text,
	spinDuration = 20,
	onHover = 'speedUp',
	className = '',
	radius = 75,
	image,
}) => {
	const letters = Array.from(text);
	const controls = useAnimation();
	const rotation: MotionValue<number> = useMotionValue(0);

	useEffect(() => {
		const start = rotation.get();
		controls.start({
			rotate: start + 360,
			scale: 1,
			transition: getTransition(spinDuration, start),
		});
	}, [spinDuration, text, onHover, controls]);

	const handleHoverStart = () => {
		const start = rotation.get();

		if (!onHover) return;

		let transitionConfig: ReturnType<typeof getTransition> | Transition;
		let scaleVal = 1;

		switch (onHover) {
			case 'slowDown':
				transitionConfig = getTransition(spinDuration * 2, start);
				break;
			case 'speedUp':
				transitionConfig = getTransition(spinDuration / 4, start);
				break;
			case 'pause':
				transitionConfig = {
					rotate: { type: 'spring', damping: 20, stiffness: 300 },
					scale: { type: 'spring', damping: 20, stiffness: 300 },
				};
				break;
			case 'goBonkers':
				transitionConfig = getTransition(spinDuration / 20, start);
				scaleVal = 0.8;
				break;
			default:
				transitionConfig = getTransition(spinDuration, start);
		}

		controls.start({
			rotate: start + 360,
			scale: scaleVal,
			transition: transitionConfig,
		});
	};

	const handleMouseLeave = () => {
		const start = rotation.get();
		controls.start({
			rotate: start + 360,
			scale: 1,
			transition: getTransition(spinDuration, start),
		});
	};

	return (
		<motion.div
			className={cn(
				'-0 mx-auto rounded-full w-[200px] h-[200px] relative font-black text-white text-center cursor-pointer origin-center flex justify-center items-center',
				className,
			)}
			style={{ rotate: rotation }}
			initial={{ rotate: 0 }}
			animate={controls}
			onMouseEnter={handleHoverStart}
			onMouseLeave={handleMouseLeave}
		>
			{image && (
				<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
					<div className="bg-accent-lime rounded-full w-15 h-15 p-2">
						<Image src={image} alt="Logo purrmanent" width={50} height={50} />
					</div>
				</div>
			)}

			<div>
				{letters.map((letter, i) => {
					const rotationDeg = (360 / letters.length) * i;
					const transform = `translate3d(-50%, -50%, 0) rotateZ(${rotationDeg}deg) translate3d(0, -${radius}px, 0)`;

					return (
						<span
							key={i}
							className="absolute top-1/2 left-1/2 inline-block text-[inherit] transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
							style={{ transform, WebkitTransform: transform }}
						>
							{letter}
						</span>
					);
				})}
			</div>
		</motion.div>
	);
};

export default CircularText;
