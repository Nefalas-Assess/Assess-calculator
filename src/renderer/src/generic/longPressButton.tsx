import React from "react";
import { useLongPress } from "../hooks/useLongPress";

interface LongPressButtonProps {
	onClick?: () => void;
	onLongPress: () => void;
	children: React.ReactNode;
	delay?: number;
	className?: string;
	style?: React.CSSProperties;
}

const LongPressButton: React.FC<LongPressButtonProps> = ({
	onClick,
	onLongPress,
	children,
	delay = 500,
	className,
	style,
}) => {
	const longPressProps = useLongPress({
		onLongPress,
		onClick,
		delay,
	});

	return (
		<button
			{...longPressProps}
			className={className}
			style={style}
			type="button"
		>
			{children}
		</button>
	);
};

export default LongPressButton;
