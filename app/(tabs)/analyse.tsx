import { Link } from "expo-router";
import { View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function AnalyseScreen() {
	return (
		<ThemedView className="flex-1 justify-center items-center px-6">
			<View className="items-center">
				<Text className="text-6xl mb-6">📚</Text>
				<Text className="text-3xl font-bold leading-8 text-center mb-4">
					Ready to Learn?
				</Text>
				<Text className="text-center mb-8 opacity-70">
					Practice solving math problems with AI-powered feedback. Choose a
					question set from the home screen to get started!
				</Text>

				<Link href="/(tabs)" asChild>
					<Button variant="default" className="px-8">
						<Text className="font-semibold">Browse Question Sets</Text>
					</Button>
				</Link>
			</View>
		</ThemedView>
	);
}
