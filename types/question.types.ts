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
