import { swagger } from "@elysiajs/swagger";
import { Elysia, status, t } from "elysia";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { env } from "@/utils/env";

const SolutionCorrectness = z.object({
	is_correct: z.boolean(),
});

const app = new Elysia()
	.use(swagger())
	.post(
		"/verify-solution",
		async ({ body }) => {
			console.log("Received request");
			const openai = new OpenAI({
				apiKey: env.OPENAI_API_KEY,
				baseURL: env.OPENAI_BASE_URL,
			});

			const response = await openai.responses.parse({
				model: "o4-mini",
				input: [
					{
						role: "developer",
						content: [
							{
								type: "input_text",
								text: "You will receive a user's question as text and an attached image showing the user's solution. Your task is to determine whether the user's solution is correct according to the question.\n\nReturn True if the solution in the image is correct, or False if it is incorrect.\n\n## Output Format\nRespond with only True or False (as a boolean, not as a string). Do not provide any explanation or additional text.",
							},
						],
					},
					{
						role: "user",
						content: [
							{
								type: "input_text",
								text: body.question,
							},
							{
								type: "input_image",
								image_url: body.image,
								detail: "high",
							},
						],
					},
				],
				text: {
					format: zodTextFormat(SolutionCorrectness, "solution_correctness"),
				},
				reasoning: {
					effort: "medium",
				},
				tools: [],
				store: false,
			});

			if (!response.output_parsed) {
				return status(400, {
					message: "Failed to parse response",
					error: {
						code: "PARSE_ERROR",
						message: "Failed to parse response",
					},
				});
			}

			return {
				success: true,
				data: response.output_parsed,
			};
		},
		{
			body: t.Object({
				question: t.String(),
				image: t.String(),
			}),
		},
	)
	.listen(process.env.API_PORT ?? 3000);

export const GET = app.handle;
export const POST = app.handle;

export type API = typeof app;

console.log("API is running on port 3000");
