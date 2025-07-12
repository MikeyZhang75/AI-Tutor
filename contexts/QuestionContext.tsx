import type React from "react";
import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
} from "react";
import {
	type Question,
	questionService,
} from "@/eden/services/question.service";
import { useVerificationPolling } from "@/lib/hooks/useVerificationPolling";
import {
	initialQuestionState,
	type QuestionState,
	questionReducer,
} from "@/lib/reducers/questionReducer";
import { verificationService } from "@/lib/services/verificationService";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Answer, Progress, Stroke } from "@/types/question.types";

interface QuestionContextType {
	// State
	state: QuestionState;

	// Actions
	startQuestionSet: (setId: string) => Promise<void>;
	submitAnswer: (answer: string, strokes?: Stroke[]) => Promise<void>;
	navigateToQuestion: (direction: "next" | "previous") => Promise<void>;
	exitQuestionSet: () => void;

	// Computed values
	isLastQuestion: boolean;
	isFirstQuestion: boolean;
	currentQuestion: Question | null;
	getCurrentAnswer: () => Answer | undefined;
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
	const [state, dispatch] = useReducer(questionReducer, initialQuestionState);

	// Extract commonly used values
	const {
		currentSet,
		currentQuestions,
		currentProgress,
		currentQuestionIndex,
	} = state;

	// Computed values
	const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
	const isFirstQuestion = currentQuestionIndex === 0;
	const currentQuestion = currentQuestions[currentQuestionIndex] || null;

	// Use verification polling hook
	const { stopPolling } = useVerificationPolling({
		setId: currentProgress?.setId || "",
		questionId: currentQuestion?.id.toString() || "",
		enabled: false, // We'll manually control when to poll
		onVerificationComplete: (progress) => {
			dispatch({ type: "SET_PROGRESS", payload: progress });
		},
	});

	const startQuestionSet = useCallback(
		async (setId: string) => {
			// Prevent re-initialization if already loaded
			if (currentSet?.id.toString() === setId && currentProgress) {
				return;
			}

			dispatch({ type: "SET_EXITING", payload: false });
			dispatch({ type: "START_LOADING" });

			try {
				// Fetch data
				const [questionSetsResponse, questionsResponse] = await Promise.all([
					questionService.getQuestionSets({}),
					questionService.getQuestions({ id: Number(setId) }),
				]);

				const questionSet = questionSetsResponse.data?.data?.find(
					(set) => set.id.toString() === setId,
				);
				const questionsData = questionsResponse.data?.data?.filter(
					(q) => q.set_id?.toString() === setId,
				);

				if (!questionSet || !questionsData || questionsData.length === 0) {
					throw new Error("Question set not found or has no questions");
				}

				dispatch({
					type: "SET_QUESTION_SET",
					payload: { set: questionSet, questions: questionsData },
				});

				// Load or create progress
				const existingProgress = await progressStorage.getProgress(setId);

				if (existingProgress && existingProgress.answers.length > 0) {
					dispatch({ type: "SET_PROGRESS", payload: existingProgress });
					dispatch({
						type: "SET_QUESTION_INDEX",
						payload: existingProgress.currentQuestionIndex,
					});
				} else {
					const newProgress: Progress = {
						setId,
						currentQuestionIndex: 0,
						answers: [],
						startedAt: new Date(),
					};
					dispatch({ type: "SET_PROGRESS", payload: newProgress });
					await progressStorage.saveProgress(newProgress);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to load question set";
				dispatch({ type: "SET_ERROR", payload: errorMessage });
			} finally {
				dispatch({ type: "FINISH_LOADING" });
			}
		},
		[currentSet, currentProgress],
	);

	const submitAnswer = useCallback(
		async (answer: string, strokes?: Stroke[]) => {
			if (!currentProgress || !currentQuestion) {
				dispatch({ type: "SET_ERROR", payload: "No active question session" });
				return;
			}

			const newAnswer: Answer = {
				questionId: currentQuestion.id.toString(),
				userAnswer: answer,
				strokes,
				submittedAt: new Date(),
				verificationStatus: "pending",
				attemptNumber: 1,
			};

			// Update state
			dispatch({ type: "ADD_OR_UPDATE_ANSWER", payload: newAnswer });

			// Save to storage (get updated progress from state)
			const updatedProgress = {
				...currentProgress,
				answers: [
					...currentProgress.answers.filter(
						(a) => a.questionId !== newAnswer.questionId,
					),
					newAnswer,
				],
			};
			await progressStorage.saveProgress(updatedProgress);

			// Queue verification
			await verificationService.queueVerification(
				newAnswer,
				currentQuestion,
				currentProgress.setId,
			);

			// Start polling for verification
			stopPolling();
			// Manually start polling by creating a new instance
			const pollInterval = setInterval(async () => {
				const status = await verificationService.getVerificationStatus(
					currentProgress.setId,
					currentQuestion.id.toString(),
				);

				if (status && status.verificationStatus !== "pending") {
					clearInterval(pollInterval);
					const latestProgress = await progressStorage.getProgress(
						currentProgress.setId,
					);
					if (latestProgress) {
						dispatch({ type: "SET_PROGRESS", payload: latestProgress });
					}
				}
			}, 1000);
		},
		[currentProgress, currentQuestion, stopPolling],
	);

	const navigateToQuestion = useCallback(
		async (direction: "next" | "previous") => {
			if (!currentSet || !currentProgress) return;

			const canNavigateNext = direction === "next" && !isLastQuestion;
			const canNavigatePrevious = direction === "previous" && !isFirstQuestion;

			if (!canNavigateNext && !canNavigatePrevious) return;

			stopPolling();

			// Get latest progress from storage
			const latestProgress = await progressStorage.getProgress(
				currentSet.id.toString(),
			);
			if (!latestProgress) {
				dispatch({ type: "SET_ERROR", payload: "Failed to load progress" });
				return;
			}

			const newIndex =
				direction === "next"
					? currentQuestionIndex + 1
					: currentQuestionIndex - 1;

			// Update state
			dispatch({ type: "SET_PROGRESS", payload: latestProgress });
			dispatch({ type: "SET_QUESTION_INDEX", payload: newIndex });

			// Save updated progress
			const updatedProgress = {
				...latestProgress,
				currentQuestionIndex: newIndex,
			};
			await progressStorage.saveProgress(updatedProgress);
		},
		[
			currentSet,
			currentProgress,
			currentQuestionIndex,
			isLastQuestion,
			isFirstQuestion,
			stopPolling,
		],
	);

	const exitQuestionSet = useCallback(() => {
		dispatch({ type: "SET_EXITING", payload: true });
		stopPolling();
		dispatch({ type: "RESET_SESSION" });
	}, [stopPolling]);

	const getCurrentAnswer = useCallback(() => {
		if (!currentProgress || !currentQuestion) return undefined;

		// Get the most recent answer for the current question
		const answers = currentProgress.answers.filter(
			(answer) => answer.questionId === currentQuestion.id.toString(),
		);
		return answers[answers.length - 1];
	}, [currentProgress, currentQuestion]);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo<QuestionContextType>(
		() => ({
			state,
			startQuestionSet,
			submitAnswer,
			navigateToQuestion,
			exitQuestionSet,
			isLastQuestion,
			isFirstQuestion,
			currentQuestion,
			getCurrentAnswer,
		}),
		[
			state,
			startQuestionSet,
			submitAnswer,
			navigateToQuestion,
			exitQuestionSet,
			isLastQuestion,
			isFirstQuestion,
			currentQuestion,
			getCurrentAnswer,
		],
	);

	return (
		<QuestionContext.Provider value={value}>
			{children}
		</QuestionContext.Provider>
	);
};
