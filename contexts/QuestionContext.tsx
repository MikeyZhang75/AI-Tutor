import type React from "react";
import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { verificationService } from "@/lib/services/verificationService";
import { progressStorage } from "@/lib/storage/progressStorage";
import type {
	Answer,
	Progress,
	Question,
	QuestionSet,
} from "@/types/question.types";

interface QuestionContextType {
	// Current session state
	currentSet: QuestionSet | null;
	currentQuestions: Question[];
	currentProgress: Progress | null;
	currentQuestionIndex: number;

	// Actions
	startQuestionSet: (setId: string) => Promise<void>;
	submitAnswer: (answer: string) => Promise<void>;
	nextQuestion: () => void;
	previousQuestion: () => void;
	exitQuestionSet: () => void;

	// Computed values
	isLastQuestion: boolean;
	isFirstQuestion: boolean;
	currentQuestion: Question | null;
	isLoading: boolean;
}

const QuestionContext = createContext<QuestionContextType | undefined>(
	undefined,
);

export const useQuestions = () => {
	const context = useContext(QuestionContext);
	if (!context) {
		throw new Error("useQuestions must be used within a QuestionProvider");
	}
	return context;
};

interface QuestionProviderProps {
	children: ReactNode;
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({
	children,
}) => {
	const [currentSet, setCurrentSet] = useState<QuestionSet | null>(null);
	const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
	const [currentProgress, setCurrentProgress] = useState<Progress | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const startQuestionSet = useCallback(async (setId: string) => {
		setIsLoading(true);
		try {
			// Mock implementation - will be replaced with actual API calls
			const { mockQuestionSets, mockQuestions } = await import(
				"@/data/mockQuestions"
			);

			const questionSet = mockQuestionSets.find((set) => set.id === setId);
			const questions = mockQuestions
				.filter((q) => q.setId === setId)
				.sort((a, b) => a.order - b.order);

			if (questionSet && questions.length > 0) {
				setCurrentSet(questionSet);
				setCurrentQuestions(questions);
				setCurrentQuestionIndex(0);

				// Initialize progress
				// Check for existing progress
				const existingProgress = await progressStorage.getProgress(setId);

				if (existingProgress && existingProgress.answers.length > 0) {
					// Resume from existing progress
					setCurrentProgress(existingProgress);
					setCurrentQuestionIndex(existingProgress.currentQuestionIndex);
				} else {
					// Start new progress
					const progress: Progress = {
						setId,
						currentQuestionIndex: 0,
						answers: [],
						startedAt: new Date(),
					};
					setCurrentProgress(progress);
					await progressStorage.saveProgress(progress);
				}
			}
		} catch (error) {
			console.error("Error starting question set:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const submitAnswer = useCallback(
		async (answer: string) => {
			if (!currentProgress || !currentQuestions[currentQuestionIndex]) return;

			const question = currentQuestions[currentQuestionIndex];
			const newAnswer: Answer = {
				questionId: question.id,
				userAnswer: answer,
				submittedAt: new Date(),
				verificationStatus: "pending",
				attemptNumber: 1,
			};

			// Update progress with new answer
			const updatedProgress = {
				...currentProgress,
				answers: [...currentProgress.answers, newAnswer],
			};
			setCurrentProgress(updatedProgress);

			// Save to storage
			await progressStorage.saveProgress(updatedProgress);

			// Queue background verification
			await verificationService.queueVerification(
				newAnswer,
				question,
				currentProgress.setId,
			);

			// Clear any existing polling interval
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}

			// Poll for verification status updates
			pollingIntervalRef.current = setInterval(async () => {
				const verificationStatus =
					await verificationService.getVerificationStatus(
						currentProgress.setId,
						question.id,
					);

				if (
					verificationStatus &&
					verificationStatus.verificationStatus !== "pending"
				) {
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}

					// Update local state with verification result
					const latestProgress = await progressStorage.getProgress(
						currentProgress.setId,
					);
					if (latestProgress) {
						setCurrentProgress(latestProgress);
					}
				}
			}, 1000);
		},
		[currentProgress, currentQuestions, currentQuestionIndex],
	);

	const nextQuestion = useCallback(async () => {
		if (currentQuestionIndex < currentQuestions.length - 1 && currentProgress) {
			// Clear any active polling interval when moving to next question
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
			const newIndex = currentQuestionIndex + 1;
			setCurrentQuestionIndex(newIndex);
			const updatedProgress = {
				...currentProgress,
				currentQuestionIndex: newIndex,
			};
			setCurrentProgress(updatedProgress);
			await progressStorage.saveProgress(updatedProgress);
		}
	}, [currentQuestionIndex, currentQuestions.length, currentProgress]);

	const previousQuestion = useCallback(async () => {
		if (currentQuestionIndex > 0 && currentProgress) {
			// Clear any active polling interval when moving to previous question
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
			const newIndex = currentQuestionIndex - 1;
			setCurrentQuestionIndex(newIndex);
			const updatedProgress = {
				...currentProgress,
				currentQuestionIndex: newIndex,
			};
			setCurrentProgress(updatedProgress);
			await progressStorage.saveProgress(updatedProgress);
		}
	}, [currentQuestionIndex, currentProgress]);

	const exitQuestionSet = useCallback(async () => {
		// Clear any active polling interval
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		// Don't clear storage - keep progress for resuming
		setCurrentSet(null);
		setCurrentQuestions([]);
		setCurrentProgress(null);
		setCurrentQuestionIndex(0);
	}, []);

	// Clean up polling interval on unmount
	useEffect(() => {
		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, []);

	const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
	const isFirstQuestion = currentQuestionIndex === 0;
	const currentQuestion = currentQuestions[currentQuestionIndex] || null;

	const value: QuestionContextType = {
		currentSet,
		currentQuestions,
		currentProgress,
		currentQuestionIndex,
		startQuestionSet,
		submitAnswer,
		nextQuestion,
		previousQuestion,
		exitQuestionSet,
		isLastQuestion,
		isFirstQuestion,
		currentQuestion,
		isLoading,
	};

	return (
		<QuestionContext.Provider value={value}>
			{children}
		</QuestionContext.Provider>
	);
};
