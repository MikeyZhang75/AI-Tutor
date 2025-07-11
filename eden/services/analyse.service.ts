import { edenClient } from "../clients/eden.client";

export const analyseService = {
	verifySolution: async (
		payload: Parameters<(typeof edenClient)["verify-solution"]["post"]>[0],
	) => {
		return await edenClient["verify-solution"].post(payload);
	},
};

export type verifySolutionRequest = Parameters<
	typeof analyseService.verifySolution
>;
export type verifySolutionResponse = Awaited<
	NonNullable<
		Awaited<ReturnType<typeof analyseService.verifySolution>>["data"]
	>["data"]
>;
