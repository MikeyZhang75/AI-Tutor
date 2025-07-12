export type Point = {
	x: number;
	y: number;
};

export type Stroke = {
	points: Point[];
	color: string;
	width: number;
};

export interface Answer {
	questionId: string;
	userAnswer: string; // Still used for backward compatibility and verification
	strokes?: Stroke[]; // New field to store stroke data
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
