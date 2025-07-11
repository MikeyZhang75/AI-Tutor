import { useRef } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { analyseService } from "@/eden/services/analyse.service";

const question = "solve for x: 2x+5=13";

export default function AnalyseScreen() {
	const insets = useSafeAreaInsets();
	const canvasRef = useRef<{ captureCanvas: () => Promise<string> }>(null);

	const handleSubmit = async () => {
		try {
			if (!canvasRef.current?.captureCanvas) {
				Alert.alert("Error", "Unable to capture drawing");
				return;
			}

			// captureCanvas now returns a data URL directly
			const base64DataUrl = await canvasRef.current.captureCanvas();

			// Call the verifySolution service
			const { data, error } = await analyseService.verifySolution({
				question,
				image: base64DataUrl,
			});

			if (error) {
				Alert.alert("Error", error.value.message);
				return;
			}

			const isCorrect = data.data.is_correct;

			Alert.alert(
				isCorrect ? "Correct!" : "Try Again",
				isCorrect
					? "Great job! Your solution is correct."
					: "Your solution is incorrect. Please try again.",
			);
		} catch (error) {
			console.error("Error submitting solution:", error);
			Alert.alert("Error", "Failed to submit solution. Please try again.");
		}
	};

	return (
		<ThemedView className="flex-1">
			<View
				className="flex-1 p-5"
				style={{ paddingBottom: insets.bottom + 80 }}
			>
				<View className="mb-5">
					<ThemedText type="title" className="mb-2.5 text-center">
						Analyse
					</ThemedText>
					<ThemedText className="text-center opacity-70 mb-2">
						Question: {question}
					</ThemedText>
					<ThemedText className="text-center opacity-60">
						Write your solution below
					</ThemedText>
				</View>
				<View className="flex-1 justify-center">
					<DrawingCanvas ref={canvasRef} />
					<View className="mt-5 items-center">
						<Button variant="default" onPress={handleSubmit} className="px-8">
							<Text className="text-base font-semibold">Submit Answer</Text>
						</Button>
					</View>
				</View>
			</View>
		</ThemedView>
	);
}
