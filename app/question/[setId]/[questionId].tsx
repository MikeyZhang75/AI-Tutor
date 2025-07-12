import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import type { DrawingCanvasRef } from "@/components/DrawingCanvas";
import DrawingCanvas from "@/components/DrawingCanvas";
import { MathView } from "@/components/MathView";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useQuestions } from "@/contexts/QuestionContext";

export default function QuestionScreen() {
	const { setId } = useLocalSearchParams<{
		setId: string;
	}>();
	const router = useRouter();
	const {
		currentQuestion,
		currentSet,
		submitAnswer,
		nextQuestion,
		previousQuestion,
		isFirstQuestion,
		isLastQuestion,
		currentProgress,
		exitQuestionSet,
		isLoading,
		startQuestionSet,
	} = useQuestions();

	const canvasRef = useRef<DrawingCanvasRef | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasCanvasStrokes, setHasCanvasStrokes] = useState(false);

	// Use currentQuestionIndex from context instead of URL param
	const questionIndex = currentProgress?.currentQuestionIndex ?? 0;

	// Initialize question set if not loaded
	useEffect(() => {
		if (!currentSet && setId && !isLoading) {
			startQuestionSet(setId);
		}
	}, [currentSet, setId, startQuestionSet, isLoading]);

	// Clear canvas when question changes
	useEffect(() => {
		if (canvasRef.current && currentQuestion) {
			// Clear the canvas for new questions
			canvasRef.current.clear();
			setHasCanvasStrokes(false);
		}
	}, [currentQuestion]);

	const handleSubmit = async () => {
		if (!canvasRef.current || !canvasRef.current.hasStrokes()) {
			return;
		}

		setIsSubmitting(true);
		try {
			const base64Image = await canvasRef.current.captureCanvas();
			if (base64Image) {
				await submitAnswer(base64Image);

				// Immediately advance to next question or results
				if (!isLastQuestion) {
					handleNext();
				} else {
					// Navigate to results screen
					router.push(`/results/${setId}`);
				}
			}
		} catch (error) {
			console.error("Error submitting answer:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = () => {
		nextQuestion();
		// Don't navigate, just update state
	};

	const handlePrevious = () => {
		previousQuestion();
		// Don't navigate, just update state
	};

	const handleExit = () => {
		exitQuestionSet();
		// Navigate back to tabs root, clearing the navigation stack
		router.dismissAll();
		router.replace("/(tabs)");
	};

	if (!currentQuestion || !currentSet) {
		return (
			<ThemedView className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Content Section */}
			<View className="flex-1 px-5 py-4">
				{/* Question Card */}
				<ThemedView className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-sm font-semibold opacity-60">
							Question {questionIndex + 1} / {currentSet.totalQuestions}
						</Text>
						<Text className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
							{currentQuestion.points} points
						</Text>
					</View>
					<MathView>{currentQuestion.text}</MathView>
				</ThemedView>

				{/* Canvas Area */}
				<View className="flex-1">
					<View className="flex-1 mb-4">
						<DrawingCanvas
							ref={canvasRef}
							onStrokesChange={setHasCanvasStrokes}
						/>
					</View>
				</View>
			</View>

			{/* Bottom Actions Section */}
			<View className="px-5 pb-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
				<Button
					onPress={handleSubmit}
					disabled={isSubmitting || !hasCanvasStrokes}
					size="lg"
					className="mb-3 w-full"
				>
					<Text className="font-semibold text-white">
						{isSubmitting ? "Submitting..." : "Submit Answer"}
					</Text>
				</Button>

				<View className="flex-row gap-3 mb-3">
					<Button
						onPress={handlePrevious}
						disabled={isFirstQuestion}
						variant="secondary"
						className="flex-1"
					>
						<Text>Previous</Text>
					</Button>
					<Button
						onPress={
							isLastQuestion
								? () => router.push(`/results/${setId}`)
								: handleNext
						}
						disabled={false}
						variant="secondary"
						className="flex-1"
					>
						<Text>{isLastQuestion ? "View Results" : "Skip"}</Text>
					</Button>
				</View>

				<Button onPress={handleExit} variant="ghost" className="w-full">
					<Text>Exit Question Set</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
