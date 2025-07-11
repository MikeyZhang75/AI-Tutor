import { StyleSheet, View } from "react-native";
import Katex from "react-native-katex";
import { useColorScheme } from "@/lib/useColorScheme";
import { ThemedText } from "./ThemedText";

interface MathViewProps {
	children: string;
	className?: string;
	fallback?: boolean;
}

const styles = StyleSheet.create({
	katexContainer: {
		height: 80,
		minHeight: 80,
	},
});

export function MathView({
	children,
	className = "",
	fallback = false,
}: MathViewProps) {
	const { isDarkColorScheme } = useColorScheme();

	// If fallback is true, render plain text
	if (fallback) {
		return <ThemedText className={className}>{children}</ThemedText>;
	}

	// Convert the mixed text/LaTeX content to a full LaTeX expression
	// Input: "Solve for $x$: $\frac{2x + 5}{3} = \frac{x - 1}{2}$"
	// Output: "\text{Solve for }x\text{: }\frac{2x + 5}{3} = \frac{x - 1}{2}"

	let expression = children;

	// Replace inline math $...$ with the LaTeX content
	// and wrap regular text in \text{}
	const parts = expression.split(/(\$[^$]+\$)/);
	const processedParts = parts.map((part) => {
		if (part.startsWith("$") && part.endsWith("$")) {
			// This is LaTeX - remove dollar signs
			return part.slice(1, -1);
		}
		if (part.trim()) {
			// This is regular text - wrap in \text{}
			// Escape any special LaTeX characters in text
			const escapedText = part
				.replace(/\\/g, "\\\\")
				.replace(/{/g, "\\{")
				.replace(/}/g, "\\}")
				.replace(/_/g, "\\_")
				.replace(/\^/g, "\\^")
				.replace(/&/g, "\\&")
				.replace(/%/g, "\\%")
				.replace(/\$/g, "\\$")
				.replace(/#/g, "\\#");
			return `\\text{${escapedText}}`;
		}
		return "";
	});

	// Join all parts into a single LaTeX expression
	expression = processedParts.join("");

	// Custom CSS for KaTeX based on theme
	const inlineStyle = `
		html, body {
			display: flex;
			background-color: transparent;
			justify-content: center;
			align-items: center;
			height: 100%;
			margin: 0;
			padding: 0;
		}
		.katex {
			color: ${isDarkColorScheme ? "#ffffff" : "#000000"};
			font-size: 1.2em;
			margin: 0;
			display: flex;
		}
		.katex-display {
			margin: 0 !important;
		}
		/* Error handling styles */
		.katex-error {
			color: ${isDarkColorScheme ? "#ff6b6b" : "#dc2626"};
		}
	`;

	console.log("Original text:", children);
	console.log("Processed expression:", expression);

	return (
		<View className={className} style={styles.katexContainer}>
			<Katex
				expression={expression}
				displayMode={false}
				throwOnError={false}
				errorColor={isDarkColorScheme ? "#ff6b6b" : "#dc2626"}
				inlineStyle={inlineStyle}
				style={{
					backgroundColor: "transparent",
					flex: 1,
				}}
				onLoad={() => console.log("KaTeX loaded successfully")}
				onError={(error) => console.error("KaTeX error:", error)}
			/>
		</View>
	);
}
