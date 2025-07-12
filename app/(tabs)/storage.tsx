import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Progress } from "@/types/question.types";

export default function StorageScreen() {
	const [storageData, setStorageData] = useState<Progress[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const loadStorageData = useCallback(async () => {
		try {
			const allProgress = await progressStorage.getAllProgress();
			setStorageData(allProgress);
		} catch (error) {
			console.error("Error loading storage data:", error);
		}
	}, []);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadStorageData();
		setRefreshing(false);
	}, [loadStorageData]);

	useEffect(() => {
		loadStorageData();
	}, [loadStorageData]);

	const clearAllData = async () => {
		try {
			await progressStorage.clearAllProgress();
			await loadStorageData();
		} catch (error) {
			console.error("Error clearing data:", error);
		}
	};

	const clearProgressForSet = async (setId: string) => {
		try {
			await progressStorage.clearProgress(setId);
			await loadStorageData();
		} catch (error) {
			console.error("Error clearing progress:", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView
				className="flex-1"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View className="p-4">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-2xl font-bold">Storage Debug</Text>
						<Button onPress={clearAllData} variant="destructive" size="sm">
							<Text className="text-white">Clear All</Text>
						</Button>
					</View>

					{storageData.length === 0 ? (
						<ThemedView className="bg-white dark:bg-gray-800 p-4 rounded-lg">
							<Text className="text-center opacity-60">
								No storage data found
							</Text>
						</ThemedView>
					) : (
						storageData.map((progress) => (
							<ThemedView
								key={progress.setId}
								className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4"
							>
								<View className="flex-row justify-between items-start mb-2">
									<Text className="text-lg font-semibold">
										Set: {progress.setId}
									</Text>
									<Button
										onPress={() => clearProgressForSet(progress.setId)}
										variant="destructive"
										size="sm"
									>
										<Text className="text-white text-xs">Clear</Text>
									</Button>
								</View>

								<Text className="text-sm opacity-60 mb-2">
									Current Question Index: {progress.currentQuestionIndex}
								</Text>

								<Text className="text-sm opacity-60 mb-2">
									Started: {new Date(progress.startedAt).toLocaleString()}
								</Text>

								{progress.completedAt && (
									<Text className="text-sm opacity-60 mb-2">
										Completed: {new Date(progress.completedAt).toLocaleString()}
									</Text>
								)}

								<Text className="text-sm font-semibold mb-1">
									Answers ({progress.answers.length}):
								</Text>

								{progress.answers.map((answer, index) => (
									<View
										key={`${answer.questionId}-${index}`}
										className="ml-4 mb-2"
									>
										<Text className="text-sm">
											• Question {answer.questionId}
										</Text>
										<Text className="text-xs opacity-60 ml-2">
											Status: {answer.verificationStatus || "pending"}
										</Text>
										<Text className="text-xs opacity-60 ml-2">
											Submitted:{" "}
											{new Date(answer.submittedAt).toLocaleTimeString()}
										</Text>
										{answer.feedback && (
											<Text className="text-xs opacity-60 ml-2">
												Feedback: {answer.feedback}
											</Text>
										)}
									</View>
								))}
							</ThemedView>
						))
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
