import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function DrawScreen() {
	const insets = useSafeAreaInsets();

	return (
		<ThemedView className="flex-1">
			<View
				className="flex-1 p-5"
				style={{ paddingBottom: insets.bottom + 80 }}
			>
				<View className="mb-5">
					<ThemedText type="title" className="mb-2.5 text-center">
						Draw
					</ThemedText>
					<ThemedText className="text-center opacity-70">
						Draw within the bordered area below
					</ThemedText>
				</View>
				<View className="flex-1 justify-center">
					<DrawingCanvas />
				</View>
			</View>
		</ThemedView>
	);
}
