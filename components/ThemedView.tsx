import { useColorScheme } from "nativewind";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
	lightColor?: string;
	darkColor?: string;
	className?: string;
};

export function ThemedView({
	style,
	lightColor,
	darkColor,
	className = "",
	...otherProps
}: ThemedViewProps) {
	const { colorScheme } = useColorScheme();

	// Default background classes
	const defaultClasses =
		lightColor || darkColor
			? "" // If custom colors provided, don't use default classes
			: "bg-background-light dark:bg-background-dark";

	const combinedClassName = `${defaultClasses} ${className}`.trim();

	// Handle custom colors if provided
	const customStyle =
		lightColor || darkColor
			? [
					{
						backgroundColor: colorScheme === "dark" ? darkColor : lightColor,
					},
					style,
				]
			: style;

	return (
		<View className={combinedClassName} style={customStyle} {...otherProps} />
	);
}
