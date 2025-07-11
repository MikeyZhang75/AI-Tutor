// Mock storage implementation for development
// Replace with actual AsyncStorage in production

const storage = new Map<string, string>();

export const mockAsyncStorage = {
	async setItem(key: string, value: string): Promise<void> {
		storage.set(key, value);
	},

	async getItem(key: string): Promise<string | null> {
		return storage.get(key) || null;
	},

	async removeItem(key: string): Promise<void> {
		storage.delete(key);
	},

	async getAllKeys(): Promise<string[]> {
		return Array.from(storage.keys());
	},

	async multiGet(keys: string[]): Promise<[string, string | null][]> {
		return keys.map((key) => [key, storage.get(key) || null]);
	},

	async multiRemove(keys: string[]): Promise<void> {
		keys.forEach((key) => storage.delete(key));
	},

	async clear(): Promise<void> {
		storage.clear();
	},
};
