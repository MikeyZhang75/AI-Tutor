import { useCallback, useEffect, useRef } from "react";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Progress } from "@/types/question.types";

interface UseProgressPollingProps {
	setId: string;
	enabled: boolean;
	onProgressUpdate?: (progress: Progress) => void;
}

export function useProgressPolling({
	setId,
	enabled,
	onProgressUpdate,
}: UseProgressPollingProps) {
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
	}, []);

	const checkForUpdates = useCallback(async () => {
		if (!setId) return;

		try {
			const progress = await progressStorage.getProgress(setId);
			if (progress && onProgressUpdate) {
				// Check if any answers are still pending/verifying
				const hasPendingAnswers = progress.answers.some(
					(answer) =>
						answer.verificationStatus === "pending" ||
						answer.verificationStatus === "verifying",
				);

				onProgressUpdate(progress);

				// Stop polling if all verifications are complete
				if (!hasPendingAnswers) {
					stopPolling();
				}
			}
		} catch (error) {
			console.error("Error checking for progress updates:", error);
		}
	}, [setId, onProgressUpdate, stopPolling]);

	const startPolling = useCallback(() => {
		stopPolling();

		if (!enabled || !setId) return;

		// Check immediately
		checkForUpdates();

		// Then poll every 2 seconds
		pollingIntervalRef.current = setInterval(checkForUpdates, 2000);
	}, [enabled, setId, checkForUpdates, stopPolling]);

	useEffect(() => {
		if (enabled) {
			startPolling();
		} else {
			stopPolling();
		}

		return () => {
			stopPolling();
		};
	}, [enabled, startPolling, stopPolling]);

	return { stopPolling, checkForUpdates };
}
