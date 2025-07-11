import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { analyseService } from "@/eden/services/analyse.service";
import { useColorScheme } from "@/lib/useColorScheme";

const question = "Solve for x: 2x+5=13";

export default function AnalyseScreen() {
	const insets = useSafeAreaInsets();
	const canvasRef = useRef<{ captureCanvas: () => Promise<string> }>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [resultMessage, setResultMessage] = useState("");
	const { isDarkColorScheme } = useColorScheme();

	const handleSubmit = async () => {
		try {
			if (!canvasRef.current?.captureCanvas) {
				setResultMessage("Unable to capture drawing");
				setIsCorrect(false);
				setShowResult(true);
				return;
			}

			setIsLoading(true);

			// captureCanvas now returns a data URL directly
			const base64DataUrl = await canvasRef.current.captureCanvas();

			// Call the verifySolution service
			const { data, error } = await analyseService.verifySolution({
				question,
				image: base64DataUrl,
			});

			setIsLoading(false);

			if (error) {
				setResultMessage(error.value.message ?? "Unknown error");
				setIsCorrect(false);
				setShowResult(true);
				return;
			}

			const correct = data.data.is_correct;
			setIsCorrect(correct);
			setResultMessage(
				correct
					? "Great job! Your solution is correct."
					: "Your solution is incorrect. Please try again.",
			);
			setShowResult(true);
		} catch (error) {
			setIsLoading(false);
			console.error("Error submitting solution:", error);
			setResultMessage("Failed to submit solution. Please try again.");
			setIsCorrect(false);
			setShowResult(true);
		}
	};

	const closeModal = () => {
		setShowResult(false);
		if (isCorrect) {
			// Could navigate to next question or reset canvas
		}
	};

	return (
		<ThemedView className="flex-1">
			<View
				className="flex-1"
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 80,
				}}
			>
				{/* Header Section */}
				<View className="px-6 mb-6">
					<View className="bg-blue-500/10 dark:bg-blue-400/20 rounded-2xl p-4 mb-4">
						<ThemedText className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
							Math Problem
						</ThemedText>
						<ThemedText type="title" className="text-2xl">
							{question}
						</ThemedText>
					</View>
					<ThemedText className="text-center text-gray-500 dark:text-gray-400">
						Write your solution below
					</ThemedText>
				</View>

				{/* Canvas Section */}
				<View className="flex-1 px-4">
					<DrawingCanvas ref={canvasRef} />
				</View>

				{/* Submit Button */}
				<View className="px-6 mt-6">
					<Button
						variant="default"
						onPress={handleSubmit}
						disabled={isLoading}
						className="w-full"
					>
						{isLoading ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-lg font-semibold">Submit Answer</Text>
						)}
					</Button>
				</View>
			</View>

			{/* Result Modal */}
			<Modal
				visible={showResult}
				transparent
				animationType="fade"
				onRequestClose={closeModal}
			>
				<View className="flex-1 justify-center items-center px-6 bg-black/50 dark:bg-black/70">
					<Pressable onPress={closeModal} className="absolute inset-0" />
					<View className="rounded-3xl p-8 items-center w-full max-w-sm shadow-2xl bg-white dark:bg-gray-800">
						{/* Icon */}
						<View
							className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
								isCorrect
									? "bg-green-500/20 dark:bg-green-400/20"
									: "bg-red-500/20 dark:bg-red-400/20"
							}`}
						>
							<Ionicons
								name={isCorrect ? "checkmark-circle" : "close-circle"}
								size={48}
								color={
									isCorrect
										? isDarkColorScheme
											? "#34d399"
											: "#10b981"
										: isDarkColorScheme
											? "#f87171"
											: "#ef4444"
								}
							/>
						</View>

						{/* Title */}
						<ThemedText
							type="subtitle"
							className={`text-2xl mb-2 ${
								isCorrect
									? "text-green-500 dark:text-green-400"
									: "text-red-500 dark:text-red-400"
							}`}
						>
							{isCorrect ? "Correct!" : "Try Again"}
						</ThemedText>

						{/* Message */}
						<ThemedText className="text-center text-gray-600 dark:text-gray-300 mb-6">
							{resultMessage}
						</ThemedText>

						{/* Action Button */}
						<Button
							variant={isCorrect ? "default" : "secondary"}
							onPress={closeModal}
							className="w-full rounded-xl"
						>
							<Text className="font-semibold">
								{isCorrect ? "Continue" : "Try Again"}
							</Text>
						</Button>
					</View>
				</View>
			</Modal>
		</ThemedView>
	);
}
