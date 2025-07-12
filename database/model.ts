import { table } from "./schema";
import { spreads } from "./utils";

export const model = {
	insert: spreads(
		{
			user: table.user,
			questionSet: table.questionSet,
			question: table.question,
		},
		"insert",
	),
	select: spreads(
		{
			user: table.user,
			questionSet: table.questionSet,
			question: table.question,
		},
		"select",
	),
} as const;
