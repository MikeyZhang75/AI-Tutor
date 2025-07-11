import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import OpenAI from "openai";
import { env } from "@/utils/env";

const app = new Elysia()
	.use(swagger())
	.post(
		"/verify-solution",
		async ({ body }) => {
			const openai = new OpenAI({
				apiKey: env.OPENAI_API_KEY,
				baseURL: env.OPENAI_BASE_URL,
			});

			const response = await openai.responses.create({
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
					format: {
						type: "json_schema",
						name: "solution_correctness",
						strict: true,
						schema: {
							type: "object",
							properties: {
								is_correct: {
									type: "boolean",
									description:
										"Whether the user's answer is correct (True) or incorrect (False).",
								},
							},
							required: ["is_correct"],
							additionalProperties: false,
						},
					},
				},
				reasoning: {
					effort: "medium",
				},
				tools: [],
				store: false,
			});

			return response.output_text;
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
