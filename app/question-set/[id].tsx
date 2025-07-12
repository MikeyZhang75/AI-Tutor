import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useQuestions } from "@/contexts/QuestionContext";
import {
	type QuestionSet,
	questionService,
} from "@/eden/services/question.service";

export default function QuestionSetDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { startQuestionSet } = useQuestions();
	const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadQuestionSet = async () => {
			if (!id) return;

			try {
				const response = await questionService.getQuestionSets({});
				if (response.data?.data) {
					const foundSet = response.data.data.find(
						(set) => set.id.toString() === id,
					);
					setQuestionSet(foundSet || null);
				}
			} catch (error) {
				console.error("Failed to load question set:", error);
			} finally {
				setLoading(false);
			}
		};

		loadQuestionSet();
	}, [id]);

	if (loading) {
		return (
			<ThemedView className="flex-1 justify-center items-center p-5">
				<Text>Loading question set...</Text>
			</ThemedView>
		);
	}

	if (!questionSet) {
		return (
			<ThemedView className="flex-1 justify-center items-center p-5">
				<Text>Question set not found</Text>
			</ThemedView>
		);
	}

	const handleStart = async () => {
		if (id) {
			await startQuestionSet(id);
			router.push(`/question/${id}`);
		}
	};

	const difficultyColors = {
		easy: "text-green-600 dark:text-green-400",
		medium: "text-yellow-600 dark:text-yellow-400",
		hard: "text-red-600 dark:text-red-400",
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView className="flex-1" bounces={false}>
				{/* Header */}
				<ThemedView
					className="pt-8 pb-8 rounded-b-3xl shadow-lg"
					style={{ backgroundColor: questionSet.color || "#3B82F6" }}
				>
					<View className="px-5">
						<View className="flex-row items-center mb-2">
							{questionSet.icon && (
								<Text className="text-5xl mr-3">{questionSet.icon}</Text>
							)}
							<Text className="text-3xl font-bold leading-8 text-white flex-1">
								{questionSet.title}
							</Text>
						</View>
						<Text className="text-white/80">{questionSet.description}</Text>
					</View>
				</ThemedView>

				{/* Content */}
				<ThemedView className="px-5 py-6">
					{/* Info Cards */}
					<View className="flex-row flex-wrap gap-3 mb-6">
						<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
							<Text className="text-sm opacity-60 mb-1">Subject</Text>
							<Text className="text-base leading-6 font-semibold">
								{questionSet.subject}
							</Text>
						</View>
						<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
							<Text className="text-sm opacity-60 mb-1">Grade Level</Text>
							<Text className="text-base leading-6 font-semibold">
								{questionSet.grade}
							</Text>
						</View>
					</View>

					<View className="flex-row flex-wrap gap-3 mb-6">
						<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
							<Text className="text-sm opacity-60 mb-1">Questions</Text>
							<Text className="text-base leading-6 font-semibold">
								{questionSet.total_questions}
							</Text>
						</View>
						<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
							<Text className="text-sm opacity-60 mb-1">Duration</Text>
							<Text className="text-base leading-6 font-semibold">
								{questionSet.estimated_time} min
							</Text>
						</View>
						<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
							<Text className="text-sm opacity-60 mb-1">Difficulty</Text>
							<Text
								className={`text-base leading-6 font-semibold ${difficultyColors[questionSet.difficulty]}`}
							>
								{questionSet.difficulty.charAt(0).toUpperCase() +
									questionSet.difficulty.slice(1)}
							</Text>
						</View>
					</View>

					{/* Start Button */}
					<Button onPress={handleStart} size="lg" className="mt-4">
						<Text className="font-semibold">Start Question Set</Text>
					</Button>

					{/* Instructions */}
					<ThemedView className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-6">
						<Text className="text-base leading-6 font-semibold mb-2">
							How it works:
						</Text>
						<Text className="mb-1">• Answer questions one at a time</Text>
						<Text className="mb-1">
							• Your answers are verified in the background
						</Text>
						<Text className="mb-1">• Continue without waiting for results</Text>
						<Text>• See your score when you complete all questions</Text>
					</ThemedView>
				</ThemedView>
			</ScrollView>
		</SafeAreaView>
	);
}
