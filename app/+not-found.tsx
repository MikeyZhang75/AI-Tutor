import { Link, Stack } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Text } from "@/components/ui/text";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<ThemedView className="flex-1 items-center justify-center p-5">
				<Text className="text-3xl font-bold leading-8">
					This screen does not exist.
				</Text>
				<Link href="/" className="mt-[15px] py-[15px]">
					<Text className="text-base leading-[30px] text-[#0a7ea4]">
						Go to home screen!
					</Text>
				</Link>
			</ThemedView>
		</>
	);
}
