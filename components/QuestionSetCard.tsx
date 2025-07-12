import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import type { getQuestionSetsResponse } from "@/eden/services/question.service";
import { ThemedView } from "./ThemedView";

interface QuestionSetCardProps {
	questionSet: getQuestionSetsResponse[number];
	progress?: {
		completed: boolean;
		highScore: number;
	};
}

export function QuestionSetCard({
	questionSet,
	progress,
}: QuestionSetCardProps) {
	const difficultyColors = {
		easy: "text-green-600 dark:text-green-400",
		medium: "text-yellow-600 dark:text-yellow-400",
		hard: "text-red-600 dark:text-red-400",
	};

	return (
		<Link
			href={`/question-set/${questionSet.id}` as `/question-set/${string}`}
			asChild
		>
			<Pressable>
				<ThemedView className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
					<View className="flex-row items-start justify-between mb-2">
						<View className="flex-1">
							<View className="flex-row items-center mb-1">
								{questionSet.icon && (
									<Text className="text-2xl mr-2">{questionSet.icon}</Text>
								)}
								<Text className="text-xl font-bold flex-1">
									{questionSet.title}
								</Text>
							</View>
							<Text className="text-sm opacity-70 mb-2">
								{questionSet.description}
							</Text>
						</View>
						{progress?.completed && (
							<View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
								<Text className="text-green-800 dark:text-green-200 text-xs font-medium">
									✓ Completed
								</Text>
							</View>
						)}
					</View>

					<View className="flex-row flex-wrap gap-2 mb-3">
						<View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
							<Text className="text-xs text-gray-600 dark:text-gray-400">
								{questionSet.subject}
							</Text>
						</View>
						<View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
							<Text className="text-xs text-gray-600 dark:text-gray-400">
								{questionSet.grade}
							</Text>
						</View>
						<View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
							<Text
								className={`text-xs font-medium ${difficultyColors[questionSet.difficulty]}`}
							>
								{questionSet.difficulty.charAt(0).toUpperCase() +
									questionSet.difficulty.slice(1)}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-3">
							<Text className="text-xs text-gray-500 dark:text-gray-400">
								📝 {questionSet.total_questions} questions
							</Text>
							<Text className="text-xs text-gray-500 dark:text-gray-400">
								⏱️ {questionSet.estimated_time} min
							</Text>
						</View>
						{progress && (
							<Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
								High Score: {progress.highScore}%
							</Text>
						)}
					</View>

					{/* Progress bar */}
					{progress && (
						<View className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<View
								className="h-full bg-green-500"
								style={{ width: `${progress.highScore}%` }}
							/>
						</View>
					)}
				</ThemedView>
			</Pressable>
		</Link>
	);
}
