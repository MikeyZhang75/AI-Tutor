import { useCallback, useEffect, useRef } from "react";
import { verificationService } from "@/lib/services/verificationService";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Progress } from "@/types/question.types";

interface UseVerificationPollingProps {
	setId: string;
	questionId: string;
	enabled: boolean;
	onVerificationComplete?: (progress: Progress) => void;
}

export function useVerificationPolling({
	setId,
	questionId,
	enabled,
	onVerificationComplete,
}: UseVerificationPollingProps) {
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
	}, []);

	const startPolling = useCallback(() => {
		stopPolling();

		if (!enabled || !setId || !questionId) return;

		pollingIntervalRef.current = setInterval(async () => {
			try {
				const verificationStatus =
					await verificationService.getVerificationStatus(setId, questionId);

				if (
					verificationStatus &&
					verificationStatus.verificationStatus !== "pending"
				) {
					stopPolling();

					// Update local state with verification result
					const latestProgress = await progressStorage.getProgress(setId);
					if (latestProgress && onVerificationComplete) {
						onVerificationComplete(latestProgress);
					}
				}
			} catch (error) {
				console.error("Error polling verification status:", error);
			}
		}, 1000);
	}, [enabled, setId, questionId, onVerificationComplete, stopPolling]);

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

	return { stopPolling };
}
