import { edenClient } from "../clients/eden.client";

export const mathpixService = {
	convert: async (
		payload: Parameters<(typeof edenClient.mathpix)["convert"]["post"]>[0],
	) => {
		return await edenClient.mathpix.convert.post(payload);
	},
};

export type convertRequest = Parameters<typeof mathpixService.convert>;
export type convertResponse = Awaited<
	NonNullable<
		Awaited<ReturnType<typeof mathpixService.convert>>["data"]
	>["data"]
>;
