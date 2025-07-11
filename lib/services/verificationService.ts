import { analyseService } from "@/eden/services/analyse.service";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Answer, Question } from "@/types/question.types";

interface VerificationTask {
	answer: Answer;
	question: Question;
	setId: string;
}

class VerificationService {
	private verificationQueue: VerificationTask[] = [];
	private isProcessing = false;

	// Add answer to verification queue
	async queueVerification(answer: Answer, question: Question, setId: string) {
		this.verificationQueue.push({ answer, question, setId });

		// Start processing if not already running
		if (!this.isProcessing) {
			this.processQueue();
		}
	}

	// Process verification queue
	private async processQueue() {
		if (this.isProcessing || this.verificationQueue.length === 0) {
			return;
		}

		this.isProcessing = true;

		while (this.verificationQueue.length > 0) {
			const task = this.verificationQueue.shift();
			if (task) {
				await this.verifyAnswer(task);
			}
		}

		this.isProcessing = false;
	}

	// Verify a single answer
	private async verifyAnswer(task: VerificationTask) {
		try {
			const { answer, question, setId } = task;

			// Skip if already verified
			if (answer.verificationStatus !== "pending") {
				return;
			}

			// Update status to verifying
			await this.updateAnswerStatus(setId, answer.questionId, "verifying");

			// Call the verification API
			const { data, error } = await analyseService.verifySolution({
				question: question.text,
				image: answer.userAnswer, // This should be the base64 image
			});

			if (error) {
				console.error("Verification error:", error);
				await this.updateAnswerStatus(
					setId,
					answer.questionId,
					"incorrect",
					"Error verifying answer. Please try again.",
				);
				return;
			}

			// Update with verification result
			const isCorrect = data.data.is_correct;
			await this.updateAnswerStatus(
				setId,
				answer.questionId,
				isCorrect ? "correct" : "incorrect",
				isCorrect
					? "Great job! Your answer is correct."
					: `Your answer is incorrect. The correct answer is: ${question.correctAnswer}`,
			);
		} catch (error) {
			console.error("Error in verification process:", error);
		}
	}

	// Update answer status in storage
	private async updateAnswerStatus(
		setId: string,
		questionId: string,
		status: Answer["verificationStatus"],
		feedback?: string,
	) {
		const progress = await progressStorage.getProgress(setId);
		if (!progress) return;

		const updatedAnswers = progress.answers.map((a) =>
			a.questionId === questionId
				? { ...a, verificationStatus: status, feedback }
				: a,
		);

		const updatedProgress = { ...progress, answers: updatedAnswers };
		await progressStorage.saveProgress(updatedProgress);
	}

	// Get verification status for a question
	async getVerificationStatus(
		setId: string,
		questionId: string,
	): Promise<Answer | null> {
		const progress = await progressStorage.getProgress(setId);
		if (!progress) return null;

		return progress.answers.find((a) => a.questionId === questionId) || null;
	}

	// Clear the verification queue
	clearQueue() {
		this.verificationQueue = [];
	}
}

// Export singleton instance
export const verificationService = new VerificationService();
