import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Progress, QuestionSetProgress } from "@/types/question.types";

const PROGRESS_KEY_PREFIX = "progress_";
const SET_PROGRESS_KEY_PREFIX = "set_progress_";

export const progressStorage = {
	// Save current progress for a question set
	async saveProgress(progress: Progress): Promise<void> {
		try {
			const key = `${PROGRESS_KEY_PREFIX}${progress.setId}`;
			await AsyncStorage.setItem(key, JSON.stringify(progress));
		} catch (error) {
			console.error("Error saving progress:", error);
		}
	},

	// Get current progress for a question set
	async getProgress(setId: string): Promise<Progress | null> {
		try {
			const key = `${PROGRESS_KEY_PREFIX}${setId}`;
			const data = await AsyncStorage.getItem(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Error getting progress:", error);
			return null;
		}
	},

	// Clear current progress for a question set
	async clearProgress(setId: string): Promise<void> {
		try {
			const key = `${PROGRESS_KEY_PREFIX}${setId}`;
			await AsyncStorage.removeItem(key);
		} catch (error) {
			console.error("Error clearing progress:", error);
		}
	},

	// Save overall progress for a question set (high scores, completion status)
	async saveSetProgress(setProgress: QuestionSetProgress): Promise<void> {
		try {
			const key = `${SET_PROGRESS_KEY_PREFIX}${setProgress.setId}`;
			await AsyncStorage.setItem(key, JSON.stringify(setProgress));
		} catch (error) {
			console.error("Error saving set progress:", error);
		}
	},

	// Get overall progress for a question set
	async getSetProgress(setId: string): Promise<QuestionSetProgress | null> {
		try {
			const key = `${SET_PROGRESS_KEY_PREFIX}${setId}`;
			const data = await AsyncStorage.getItem(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Error getting set progress:", error);
			return null;
		}
	},

	// Get all question set progress
	async getAllSetProgress(): Promise<QuestionSetProgress[]> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const progressKeys = keys.filter((key: string) =>
				key.startsWith(SET_PROGRESS_KEY_PREFIX),
			);
			const progressData = await AsyncStorage.multiGet(progressKeys);

			return progressData
				.map(([_, value]: [string, string | null]) =>
					value ? JSON.parse(value) : null,
				)
				.filter(Boolean) as QuestionSetProgress[];
		} catch (error) {
			console.error("Error getting all set progress:", error);
			return [];
		}
	},

	// Get all current progress (not set progress)
	async getAllProgress(): Promise<Progress[]> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const progressKeys = keys.filter(
				(key: string) =>
					key.startsWith(PROGRESS_KEY_PREFIX) &&
					!key.startsWith(SET_PROGRESS_KEY_PREFIX),
			);
			const progressData = await AsyncStorage.multiGet(progressKeys);

			return progressData
				.map(([_, value]: [string, string | null]) =>
					value ? JSON.parse(value) : null,
				)
				.filter(Boolean) as Progress[];
		} catch (error) {
			console.error("Error getting all progress:", error);
			return [];
		}
	},

	// Clear all progress data
	async clearAllProgress(): Promise<void> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const progressKeys = keys.filter(
				(key: string) =>
					key.startsWith(PROGRESS_KEY_PREFIX) ||
					key.startsWith(SET_PROGRESS_KEY_PREFIX),
			);
			await AsyncStorage.multiRemove(progressKeys);
		} catch (error) {
			console.error("Error clearing all progress:", error);
		}
	},
};
