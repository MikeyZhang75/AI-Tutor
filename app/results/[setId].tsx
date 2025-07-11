import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { mockQuestionSets, mockQuestions } from "@/data/mockQuestions";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Progress, QuestionSetProgress } from "@/types/question.types";

export default function ResultsScreen() {
	const { setId } = useLocalSearchParams<{ setId: string }>();
	const router = useRouter();
	const [progress, setProgressState] = useState<Progress | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const questionSet = useMemo(
		() => mockQuestionSets.find((set) => set.id === setId),
		[setId],
	);

	const questions = useMemo(
		() =>
			mockQuestions
				.filter((q) => q.setId === setId)
				.sort((a, b) => a.order - b.order),
		[setId],
	);

	const loadProgress = useCallback(async () => {
		if (!setId) return;

		setIsLoading(true);
		const savedProgress = await progressStorage.getProgress(setId);

		if (savedProgress) {
			// Mark as completed
			savedProgress.completedAt = new Date();

			// Calculate score
			const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
			const earnedPoints = savedProgress.answers.reduce((sum, answer) => {
				const question = questions.find((q) => q.id === answer.questionId);
				return (
					sum +
					(answer.verificationStatus === "correct" && question
						? question.points
						: 0)
				);
			}, 0);

			savedProgress.score = Math.round((earnedPoints / totalPoints) * 100);
			savedProgress.totalPoints = totalPoints;

			setProgressState(savedProgress);

			// Save completion to set progress
			const setProgressData: QuestionSetProgress = {
				setId: setId,
				completed: true,
				highScore: savedProgress.score,
				lastAttemptDate: new Date(),
				totalAttempts: 1, // In real app, increment this
			};
			await progressStorage.saveSetProgress(setProgressData);
		}

		setIsLoading(false);
	}, [setId, questions]);

	useEffect(() => {
		loadProgress();
	}, [loadProgress]);

	const handleRetrySet = async () => {
		if (setId) {
			await progressStorage.clearProgress(setId);
			router.replace(`/question-set/${setId}`);
		}
	};

	if (isLoading) {
		return (
			<ThemedView className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	if (!progress || !questionSet) {
		return (
			<ThemedView className="flex-1 justify-center items-center p-5">
				<Text>No results found</Text>
				<Link href="/" asChild>
					<Button className="mt-4">
						<Text>Back to Home</Text>
					</Button>
				</Link>
			</ThemedView>
		);
	}

	const correctAnswers = progress.answers.filter(
		(a) => a.verificationStatus === "correct",
	).length;
	const totalQuestions = questions.length;
	const scorePercentage = progress.score || 0;
	const isPassing = scorePercentage >= 70;

	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<ThemedView
				className={`px-5 pt-12 pb-8 ${isPassing ? "bg-green-600 dark:bg-green-700" : "bg-orange-600 dark:bg-orange-700"}`}
			>
				<View className="items-center">
					<Text className="text-6xl mb-4">{isPassing ? "🎉" : "💪"}</Text>
					<Text className="text-3xl font-bold leading-8 text-white text-center mb-2">
						{isPassing ? "Congratulations!" : "Good Effort!"}
					</Text>
					<Text className="text-white/80 text-center">
						You completed {questionSet.title}
					</Text>
				</View>
			</ThemedView>

			{/* Results Summary */}
			<ThemedView className="px-5 py-6">
				{/* Score Card */}
				<View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6">
					<View className="items-center">
						<Text className="text-5xl font-bold leading-8 mb-2">
							{scorePercentage}%
						</Text>
						<Text className="opacity-70">Overall Score</Text>
					</View>

					<View className="flex-row justify-around mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
						<View className="items-center">
							<Text className="text-2xl leading-6 font-semibold text-green-600 dark:text-green-400">
								{correctAnswers}
							</Text>
							<Text className="text-sm opacity-70">Correct</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl leading-6 font-semibold text-red-600 dark:text-red-400">
								{totalQuestions - correctAnswers}
							</Text>
							<Text className="text-sm opacity-70">Incorrect</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl leading-6 font-semibold">
								{progress.totalPoints}
							</Text>
							<Text className="text-sm opacity-70">Total Points</Text>
						</View>
					</View>
				</View>

				{/* Question Details */}
				<Text className="text-xl font-bold mb-3">Question Details</Text>
				{questions.map((question, index) => {
					const answer = progress.answers.find(
						(a) => a.questionId === question.id,
					);
					const isCorrect = answer?.verificationStatus === "correct";
					const isPending =
						answer?.verificationStatus === "pending" ||
						answer?.verificationStatus === "verifying";

					return (
						<View
							key={question.id}
							className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-2 flex-row items-center"
						>
							<View className="mr-3">
								{isPending ? (
									<ActivityIndicator size="small" />
								) : (
									<Text
										className={`text-2xl ${isCorrect ? "text-green-500" : "text-red-500"}`}
									>
										{isCorrect ? "✓" : "✗"}
									</Text>
								)}
							</View>
							<View className="flex-1">
								<Text className="text-base leading-6 font-semibold">
									Question {index + 1}
								</Text>
								<Text className="text-sm opacity-70">
									{isCorrect ? `+${question.points} points` : "0 points"}
								</Text>
							</View>
							<Text
								className={`text-sm ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
							>
								{isPending
									? "Verifying..."
									: isCorrect
										? "Correct"
										: "Incorrect"}
							</Text>
						</View>
					);
				})}

				{/* Actions */}
				<View className="gap-3 mt-6">
					<Button onPress={handleRetrySet} size="lg">
						<Text className="font-semibold">Try Again</Text>
					</Button>
					<Link href="/" asChild>
						<Button variant="secondary" size="lg">
							<Text>Back to Question Sets</Text>
						</Button>
					</Link>
				</View>
			</ThemedView>
		</ScrollView>
	);
}
