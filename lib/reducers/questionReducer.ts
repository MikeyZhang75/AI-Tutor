import type { Question, QuestionSet } from "@/eden/services/question.service";
import type { Answer, Progress } from "@/types/question.types";

export interface QuestionState {
	currentSet: QuestionSet | null;
	currentQuestions: Question[];
	currentProgress: Progress | null;
	currentQuestionIndex: number;
	isLoading: boolean;
	isExiting: boolean;
	error: string | null;
}

export type QuestionAction =
	| { type: "START_LOADING" }
	| { type: "SET_ERROR"; payload: string }
	| { type: "CLEAR_ERROR" }
	| {
			type: "SET_QUESTION_SET";
			payload: { set: QuestionSet; questions: Question[] };
	  }
	| { type: "SET_PROGRESS"; payload: Progress }
	| { type: "UPDATE_PROGRESS"; payload: Partial<Progress> }
	| { type: "SET_QUESTION_INDEX"; payload: number }
	| { type: "ADD_OR_UPDATE_ANSWER"; payload: Answer }
	| { type: "SET_EXITING"; payload: boolean }
	| { type: "RESET_SESSION" }
	| { type: "FINISH_LOADING" };

export const initialQuestionState: QuestionState = {
	currentSet: null,
	currentQuestions: [],
	currentProgress: null,
	currentQuestionIndex: 0,
	isLoading: false,
	isExiting: false,
	error: null,
};

export function questionReducer(
	state: QuestionState,
	action: QuestionAction,
): QuestionState {
	switch (action.type) {
		case "START_LOADING":
			return { ...state, isLoading: true, error: null };

		case "FINISH_LOADING":
			return { ...state, isLoading: false };

		case "SET_ERROR":
			return { ...state, error: action.payload, isLoading: false };

		case "CLEAR_ERROR":
			return { ...state, error: null };

		case "SET_QUESTION_SET":
			return {
				...state,
				currentSet: action.payload.set,
				currentQuestions: action.payload.questions,
				currentQuestionIndex: 0,
			};

		case "SET_PROGRESS":
			return { ...state, currentProgress: action.payload };

		case "UPDATE_PROGRESS":
			if (!state.currentProgress) return state;
			return {
				...state,
				currentProgress: { ...state.currentProgress, ...action.payload },
			};

		case "SET_QUESTION_INDEX":
			return { ...state, currentQuestionIndex: action.payload };

		case "ADD_OR_UPDATE_ANSWER": {
			if (!state.currentProgress) return state;

			const existingAnswerIndex = state.currentProgress.answers.findIndex(
				(a) => a.questionId === action.payload.questionId,
			);

			const updatedAnswers = [...state.currentProgress.answers];
			if (existingAnswerIndex >= 0) {
				updatedAnswers[existingAnswerIndex] = action.payload;
			} else {
				updatedAnswers.push(action.payload);
			}

			return {
				...state,
				currentProgress: {
					...state.currentProgress,
					answers: updatedAnswers,
				},
			};
		}

		case "SET_EXITING":
			return { ...state, isExiting: action.payload };

		case "RESET_SESSION":
			return {
				...initialQuestionState,
				isExiting: state.isExiting,
			};

		default:
			return state;
	}
}
