import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import {
	Alert,
	type LayoutChangeEvent,
	PanResponder,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

type Point = {
	x: number;
	y: number;
};

type Stroke = {
	points: Point[];
	color: string;
	width: number;
};

export default function DrawingCanvas() {
	const [strokes, setStrokes] = useState<Stroke[]>([]);
	const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
	const [canvasDimensions, setCanvasDimensions] = useState({
		width: 0,
		height: 0,
	});
	const currentStrokeRef = useRef<Point[]>([]);
	const viewShotRef = useRef<ViewShot>(null);
	const strokeColor = useThemeColor({}, "text");
	const strokeColorRef = useRef(strokeColor);
	const borderColor = useThemeColor(
		{ light: "#999999", dark: "#666666" },
		"text",
	);
	const buttonBgColor = useThemeColor(
		{ light: "#f0f0f0", dark: "#333333" },
		"background",
	);
	const bgColor = useThemeColor({}, "background");

	// Update strokeColorRef when strokeColor changes
	strokeColorRef.current = strokeColor;

	const onCanvasLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		// Make canvas square based on the smaller dimension
		const size = Math.min(width, height - 80); // Leave space for clear button
		setCanvasDimensions({ width: size, height: size });
	};

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				const { locationX, locationY } = evt.nativeEvent;
				const newStroke = [{ x: locationX, y: locationY }];
				currentStrokeRef.current = newStroke;
				setCurrentStroke(newStroke);
			},
			onPanResponderMove: (evt) => {
				const { locationX, locationY } = evt.nativeEvent;
				const updatedStroke = [
					...currentStrokeRef.current,
					{ x: locationX, y: locationY },
				];
				currentStrokeRef.current = updatedStroke;
				setCurrentStroke(updatedStroke);
			},
			onPanResponderRelease: () => {
				if (currentStrokeRef.current.length > 0) {
					const newStroke = {
						points: [...currentStrokeRef.current],
						color: strokeColorRef.current,
						width: 2,
					};
					setStrokes((prev) => {
						const newStrokes = [...prev, newStroke];
						return newStrokes;
					});
					currentStrokeRef.current = [];
					setCurrentStroke([]);
				}
			},
		}),
	).current;

	const clearCanvas = () => {
		setStrokes([]);
		setCurrentStroke([]);
		currentStrokeRef.current = [];
	};

	const saveToLocal = async () => {
		try {
			// Request permission to save to photo library
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Please grant permission to save images to your photo library.",
				);
				return;
			}

			// Capture the canvas as an image
			if (viewShotRef.current?.capture) {
				const uri = await viewShotRef.current.capture();

				// Save to photo library
				const asset = await MediaLibrary.createAssetAsync(uri);
				await MediaLibrary.createAlbumAsync("AI Tutor", asset, false);

				Alert.alert("Success", "Drawing saved to your photo library!");
			}
		} catch (error) {
			console.error("Error saving image:", error);
			Alert.alert("Error", "Failed to save drawing. Please try again.");
		}
	};

	const pointsToPath = (points: Point[]) => {
		if (points.length < 2) return "";

		let path = `M${points[0].x},${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const cpx = (prev.x + curr.x) / 2;
			const cpy = (prev.y + curr.y) / 2;
			path += ` Q${prev.x},${prev.y} ${cpx},${cpy}`;
		}
		return path;
	};

	return (
		<View style={styles.container} onLayout={onCanvasLayout}>
			{canvasDimensions.width > 0 && (
				<View style={styles.canvasContent}>
					<ViewShot
						ref={viewShotRef}
						options={{
							format: "png",
							quality: 1,
							width: canvasDimensions.width,
							height: canvasDimensions.height,
						}}
					>
						<View
							style={[
								styles.canvasContainer,
								{
									borderColor,
									height: canvasDimensions.height,
									width: canvasDimensions.width,
									backgroundColor: bgColor,
								},
							]}
							{...panResponder.panHandlers}
						>
							<Svg
								width={canvasDimensions.width}
								height={canvasDimensions.height}
								style={styles.svg}
							>
								{strokes.map((stroke, index) => (
									<Path
										key={`stroke-${index}-${stroke.points.length}`}
										d={pointsToPath(stroke.points)}
										stroke={stroke.color || "#000000"}
										strokeWidth={stroke.width || 2}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								))}
								{currentStroke.length > 0 && (
									<Path
										d={pointsToPath(currentStroke)}
										stroke={strokeColor}
										strokeWidth={2}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								)}
							</Svg>
						</View>
					</ViewShot>
					<View style={styles.buttonContainer}>
						<Pressable
							style={[styles.button, { backgroundColor: buttonBgColor }]}
							onPress={clearCanvas}
						>
							<ThemedText style={styles.buttonText}>Clear</ThemedText>
						</Pressable>
						<Pressable
							style={[styles.button, { backgroundColor: buttonBgColor }]}
							onPress={saveToLocal}
						>
							<ThemedText style={styles.buttonText}>Save</ThemedText>
						</Pressable>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	canvasContent: {
		alignItems: "center",
	},
	canvasContainer: {
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "transparent",
	},
	svg: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		marginTop: 20,
		gap: 15,
	},
	button: {
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 20,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
