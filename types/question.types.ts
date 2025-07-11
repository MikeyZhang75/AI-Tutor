export interface Question {
	id: string;
	setId: string;
	order: number;
	text: string;
	type: "math" | "text" | "multiple-choice";
	difficulty: "easy" | "medium" | "hard";
	points: number;
	imageUrl?: string;
	options?: string[]; // For multiple-choice
	correctAnswer?: string; // For verification
}

export interface QuestionSet {
	id: string;
	title: string;
	description: string;
	subject: string;
	grade: string;
	totalQuestions: number;
	estimatedTime: number; // in minutes
	difficulty: "easy" | "medium" | "hard";
	icon?: string;
	color?: string;
}

export interface Answer {
	questionId: string;
	userAnswer: string;
	submittedAt: Date;
	verificationStatus: "pending" | "verifying" | "correct" | "incorrect";
	feedback?: string;
	attemptNumber: number;
}

export interface Progress {
	setId: string;
	userId?: string; // Optional for now since we don't have auth
	currentQuestionIndex: number;
	answers: Answer[];
	startedAt: Date;
	completedAt?: Date;
	score?: number;
	totalPoints?: number;
}

export interface QuestionSetProgress {
	setId: string;
	completed: boolean;
	highScore: number;
	lastAttemptDate?: Date;
	totalAttempts: number;
}
