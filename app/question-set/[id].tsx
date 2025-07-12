import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useQuestions } from "@/contexts/QuestionContext";
import { mockQuestionSets } from "@/data/mockQuestions";

export default function QuestionSetDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { startQuestionSet, currentProgress } = useQuestions();

	const questionSet = mockQuestionSets.find((set) => set.id === id);

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
			// Use the current question index from context (will be 0 for new sets)
			const questionIndex = currentProgress?.currentQuestionIndex ?? 0;
			router.push(`/question/${id}/${questionIndex}`);
		}
	};

	const difficultyColors = {
		easy: "text-green-600 dark:text-green-400",
		medium: "text-yellow-600 dark:text-yellow-400",
		hard: "text-red-600 dark:text-red-400",
	};

	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<ThemedView
				className="px-5 pt-12 pb-8 rounded-b-3xl shadow-lg"
				style={{ backgroundColor: questionSet.color || "#3B82F6" }}
			>
				<View className="flex-row items-center mb-2">
					{questionSet.icon && (
						<Text className="text-5xl mr-3">{questionSet.icon}</Text>
					)}
					<Text className="text-3xl font-bold leading-8 text-white flex-1">
						{questionSet.title}
					</Text>
				</View>
				<Text className="text-white/80">{questionSet.description}</Text>
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
							{questionSet.totalQuestions}
						</Text>
					</View>
					<View className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex-1 min-w-[140px]">
						<Text className="text-sm opacity-60 mb-1">Duration</Text>
						<Text className="text-base leading-6 font-semibold">
							{questionSet.estimatedTime} min
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
	);
}
