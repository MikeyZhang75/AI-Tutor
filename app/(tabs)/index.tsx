import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuestionSetCard } from "@/components/QuestionSetCard";
import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";
import {
	type getQuestionSetsResponse,
	questionService,
} from "@/eden/services/question.service";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { QuestionSetProgress } from "@/types/question.types";

export default function HomeScreen() {
	const [progressData, setProgressData] = useState<
		Record<string, QuestionSetProgress>
	>({});
	const [refreshing, setRefreshing] = useState(false);
	const [questionSets, setQuestionSets] = useState<getQuestionSetsResponse>([]);
	const [loading, setLoading] = useState(true);

	const loadQuestionSets = useCallback(async () => {
		try {
			const response = await questionService.getQuestionSets({});
			if (response.data?.data) {
				setQuestionSets(response.data.data);
			}
		} catch (error) {
			console.error("Failed to load question sets:", error);
		} finally {
			setLoading(false);
		}
	}, []);

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
		loadQuestionSets();
		loadProgress();
	}, [loadQuestionSets, loadProgress]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([loadQuestionSets(), loadProgress()]);
		setRefreshing(false);
	}, [loadQuestionSets, loadProgress]);

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Header */}
				<ThemedView className="bg-blue-600 dark:bg-blue-700 pt-8 pb-8 rounded-b-3xl shadow-lg">
					<View className="px-5">
						<Text className="text-3xl font-bold leading-8 text-white mb-2">
							🎓 AI Tutor
						</Text>
						<Text className="text-white/80">
							Choose a question set to practice
						</Text>
					</View>
				</ThemedView>

				{/* Question Sets */}
				<ThemedView className="px-5 py-6">
					<Text className="text-xl font-bold mb-4">
						Available Question Sets
					</Text>

					{loading ? (
						<Text className="text-center py-8 text-gray-500">
							Loading question sets...
						</Text>
					) : questionSets.length === 0 ? (
						<Text className="text-center py-8 text-gray-500">
							No question sets available
						</Text>
					) : (
						questionSets.map((set) => {
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
						})
					)}
				</ThemedView>
			</ScrollView>
		</SafeAreaView>
	);
}
