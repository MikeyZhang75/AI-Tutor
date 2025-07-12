import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
	// OPENAI
	OPENAI_API_KEY: str(),
	OPENAI_BASE_URL: str(),

	DATABASE_URL: str(),
});
