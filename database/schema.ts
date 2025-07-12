import { integer, jsonb, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	age: integer().notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const questionDifficultiesEnum = ["easy", "medium", "hard"] as const;
export const questionTypesEnum = ["math", "text", "multiple-choice"] as const;

export const questionDifficulties = pgEnum(
	"difficulty",
	questionDifficultiesEnum,
);
export const questionTypes = pgEnum("type", questionTypesEnum);

export const questionSet = pgTable("question_set", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	grade: varchar({ length: 255 }).notNull(),
	total_questions: integer().notNull(),
	estimated_time: integer().notNull(),
	difficulty: questionDifficulties("difficulty").notNull(),
	icon: varchar({ length: 255 }),
	color: varchar({ length: 255 }),
});

export const question = pgTable("question", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	set_id: integer().references(() => questionSet.id),
	order: integer().notNull(),
	text: varchar({ length: 255 }).notNull(),
	type: questionTypes("type").notNull(),
	difficulty: questionDifficulties("difficulty").notNull(),
	points: integer().notNull(),
	image_url: varchar({ length: 255 }),
	options: jsonb().array(),
	correct_answer: varchar({ length: 255 }),
});

export const table = {
	user,
	questionSet,
	question,
};

export type Table = typeof table;
