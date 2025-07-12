import { edenClient } from "../clients/eden.client";

export const questionService = {
	getQuestionSets: async (
		payload: Parameters<(typeof edenClient)["question-sets"]["get"]>[0],
	) => {
		return await edenClient["question-sets"].get(payload);
	},
	getQuestions: async (
		params: Parameters<(typeof edenClient)["question-sets"]>[0],
	) => {
		return await edenClient["question-sets"](params).questions.get();
	},
};

export type getQuestionSetsRequest = Parameters<
	typeof questionService.getQuestionSets
>;
export type getQuestionSetsResponse = Awaited<
	NonNullable<
		Awaited<ReturnType<typeof questionService.getQuestionSets>>["data"]
	>["data"]
>;
export type QuestionSet = getQuestionSetsResponse[number];

export type getQuestionsRequest = Parameters<
	typeof questionService.getQuestions
>;
export type getQuestionsResponse = Awaited<
	NonNullable<
		Awaited<ReturnType<typeof questionService.getQuestions>>["data"]
	>["data"]
>;
export type Question = getQuestionsResponse[number];
