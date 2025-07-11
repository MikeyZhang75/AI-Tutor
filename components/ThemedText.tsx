import { useColorScheme } from "nativewind";
import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
	lightColor?: string;
	darkColor?: string;
	type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
	className?: string;
};

export function ThemedText({
	style,
	lightColor,
	darkColor,
	type = "default",
	className = "",
	...rest
}: ThemedTextProps) {
	const { colorScheme } = useColorScheme();

	// Type-specific classes
	const typeClasses = {
		default: "text-base leading-6",
		defaultSemiBold: "text-base leading-6 font-semibold",
		title: "text-3xl font-bold leading-8",
		subtitle: "text-xl font-bold",
		link: "text-base leading-[30px] text-[#0a7ea4]",
	};

	// Default color classes
	const defaultColorClasses =
		lightColor || darkColor
			? "" // If custom colors provided, don't use default classes
			: type === "link"
				? "" // Link has its own color
				: "text-text-light dark:text-text-dark";

	const combinedClassName =
		`${typeClasses[type]} ${defaultColorClasses} ${className}`.trim();

	// Handle custom colors if provided
	const customStyle =
		lightColor || darkColor
			? [
					{
						color: colorScheme === "dark" ? darkColor : lightColor,
					},
					style,
				]
			: style;

	return <Text className={combinedClassName} style={customStyle} {...rest} />;
}
