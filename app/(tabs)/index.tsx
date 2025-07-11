import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { QuestionSetCard } from "@/components/QuestionSetCard";
import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import { mockQuestionSets } from "@/data/mockQuestions";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { QuestionSetProgress } from "@/types/question.types";

export default function HomeScreen() {
	const [progressData, setProgressData] = useState<
		Record<string, QuestionSetProgress>
	>({});
	const [refreshing, setRefreshing] = useState(false);

	const loadProgress = useCallback(async () => {
		const allProgress = await progressStorage.getAllSetProgress();
		const progressMap = allProgress.reduce(
			(acc, progress) => {
				acc[progress.setId] = progress;
				return acc;
			},
			{} as Record<string, QuestionSetProgress>,
		);
		setProgressData(progressMap);
	}, []);

	useEffect(() => {
		loadProgress();
	}, [loadProgress]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadProgress();
		setRefreshing(false);
	}, [loadProgress]);

	return (
		<ScrollView
			className="flex-1 bg-gray-50 dark:bg-gray-900"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			{/* Header */}
			<ThemedView className="bg-blue-600 dark:bg-blue-700 px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
				<Text className="text-3xl font-bold leading-8 text-white mb-2">
					🎓 AI Tutor
				</Text>
				<Text className="text-white/80">Choose a question set to practice</Text>
			</ThemedView>

			{/* Question Sets */}
			<ThemedView className="px-5 py-6">
				<Text className="text-xl font-bold mb-4">Available Question Sets</Text>

				{mockQuestionSets.map((set) => {
					const progress = progressData[set.id];
					return (
						<QuestionSetCard
							key={set.id}
							questionSet={set}
							progress={
								progress
									? {
											completed: progress.completed,
											highScore: progress.highScore,
										}
									: undefined
							}
						/>
					);
				})}
			</ThemedView>
		</ScrollView>
	);
}
