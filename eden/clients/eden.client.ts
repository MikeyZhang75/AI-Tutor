import { treaty } from "@elysiajs/eden";
import type { API } from "@/api";

const host = "http://localhost:3000";

export const edenClient = treaty<API>(host);
