import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawingCanvas from "@/components/DrawingCanvas";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function DrawScreen() {
	const insets = useSafeAreaInsets();

	return (
		<ThemedView style={styles.container}>
			<View style={[styles.content, { paddingBottom: insets.bottom + 80 }]}>
				<View style={styles.header}>
					<ThemedText type="title" style={styles.title}>
						Draw
					</ThemedText>
					<ThemedText style={styles.instructions}>
						Draw within the bordered area below
					</ThemedText>
				</View>
				<View style={styles.canvasWrapper}>
					<DrawingCanvas />
				</View>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		marginBottom: 10,
		textAlign: "center",
	},
	instructions: {
		textAlign: "center",
		opacity: 0.7,
	},
	canvasWrapper: {
		flex: 1,
		justifyContent: "center",
	},
});
