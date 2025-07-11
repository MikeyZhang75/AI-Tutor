import { type PropsWithChildren, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/lib/useColorScheme";

export function Collapsible({
	children,
	title,
}: PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const { colorScheme } = useColorScheme();
	const theme = colorScheme ?? "light";

	return (
		<ThemedView>
			<TouchableOpacity
				className="flex-row items-center gap-1.5"
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<IconSymbol
					name="chevron.right"
					size={18}
					weight="medium"
					color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
					style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
				/>

				<Text className="text-base leading-6 font-semibold">{title}</Text>
			</TouchableOpacity>
			{isOpen && <ThemedView className="mt-1.5 ml-6">{children}</ThemedView>}
		</ThemedView>
	);
}
