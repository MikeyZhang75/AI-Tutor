import { analyseService } from "@/eden/services/analyse.service";
import type { Question } from "@/eden/services/question.service";
import { progressStorage } from "@/lib/storage/progressStorage";
import type { Answer } from "@/types/question.types";

interface VerificationTask {
	answer: Answer;
	question: Question;
	setId: string;
}

class VerificationService {
	private updateQueue: Promise<void> = Promise.resolve();

	// Add answer to verification queue - now starts verification immediately
	async queueVerification(answer: Answer, question: Question, setId: string) {
		// Start verification immediately without waiting
		this.verifyAnswer({ answer, question, setId });
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
					: `Your answer is incorrect. The correct answer is: ${question.correct_answer}`,
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
		// Queue updates to prevent race conditions
		this.updateQueue = this.updateQueue
			.then(async () => {
				const progress = await progressStorage.getProgress(setId);
				if (!progress) {
					console.error(`No progress found for setId: ${setId}`);
					return;
				}

				const updatedAnswers = progress.answers.map((a) =>
					a.questionId === questionId
						? { ...a, verificationStatus: status, feedback }
						: a,
				);

				const updatedProgress = { ...progress, answers: updatedAnswers };
				await progressStorage.saveProgress(updatedProgress);
				console.log(
					`Updated answer status for question ${questionId} to ${status}`,
				);
			})
			.catch((error) => {
				console.error("Error updating answer status:", error);
			});

		await this.updateQueue;
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
}

// Export singleton instance
export const verificationService = new VerificationService();
