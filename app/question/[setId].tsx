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
import type { Stroke } from "@/types/question.types";

export default function QuestionScreen() {
	const { setId } = useLocalSearchParams<{
		setId: string;
	}>();
	const router = useRouter();
	const {
		state: { currentSet, currentQuestionIndex, isLoading, isExiting, error },
		currentQuestion,
		isFirstQuestion,
		isLastQuestion,
		submitAnswer,
		navigateToQuestion,
		exitQuestionSet,
		startQuestionSet,
		getCurrentAnswer,
	} = useQuestions();

	const canvasRef = useRef<DrawingCanvasRef | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasCanvasStrokes, setHasCanvasStrokes] = useState(false);
	const [initialStrokes, setInitialStrokes] = useState<Stroke[]>([]);

	// Initialize question set if not loaded
	useEffect(() => {
		if (!currentSet && setId && !isLoading && !isExiting) {
			startQuestionSet(setId);
		}
	}, [currentSet, setId, startQuestionSet, isLoading, isExiting]);

	// Track the current question ID to detect actual question changes
	const previousQuestionIdRef = useRef<string | null>(null);

	// Clear canvas and load existing strokes when question changes
	useEffect(() => {
		const currentQuestionId = currentQuestion?.id.toString() || null;

		// Only process if this is an actual question change
		if (currentQuestionId !== previousQuestionIdRef.current) {
			previousQuestionIdRef.current = currentQuestionId;

			if (currentQuestion) {
				const existingAnswer = getCurrentAnswer();

				if (existingAnswer?.strokes) {
					setInitialStrokes(existingAnswer.strokes);
					setHasCanvasStrokes(true);
				} else {
					setInitialStrokes([]);
					if (canvasRef.current) {
						canvasRef.current.clear();
					}
					setHasCanvasStrokes(false);
				}
			}
		}
	}, [currentQuestion, getCurrentAnswer]);

	const handleSubmit = async () => {
		if (!canvasRef.current || !canvasRef.current.hasStrokes()) {
			return;
		}

		setIsSubmitting(true);
		try {
			const base64Image = await canvasRef.current.captureCanvas();
			const strokes = canvasRef.current.getStrokes();
			if (base64Image) {
				await submitAnswer(base64Image, strokes);

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
		navigateToQuestion("next");
	};

	const handlePrevious = () => {
		navigateToQuestion("previous");
	};

	const handleExit = () => {
		exitQuestionSet();
		// Navigate back to tabs root, clearing the navigation stack
		router.dismissAll();
		router.replace("/(tabs)");
	};

	if (error) {
		return (
			<ThemedView className="flex-1 justify-center items-center px-5">
				<Text className="text-red-500 text-center mb-4">{error}</Text>
				<Button onPress={() => router.back()}>
					<Text>Go Back</Text>
				</Button>
			</ThemedView>
		);
	}

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
							Question {currentQuestionIndex + 1} / {currentSet.total_questions}
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
							initialStrokes={initialStrokes}
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
